import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { decodoApi, mapDecodoSearchResult, AMAZON_SA_CATEGORIES } from '@/lib/decodo/decodo-client'
import { log } from '@/lib/utils/logger'

const CACHE_TTL = 1800

const categoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(['discount_desc', 'price_asc', 'price_desc', 'rating_desc', 'popular']).default('popular'),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

interface CategoryProduct {
  asin: string
  title: string
  main_image: string
  price: number | null
  original_price: number | null
  discount_percentage: number | null
  rating: number | null
  ratings_count: number | null
  is_prime: boolean
  is_best_seller: boolean
  is_amazon_choice: boolean
  currency: string
  amazon_url: string
}

interface CategoryResponse {
  success: boolean
  data?: {
    category_slug: string
    category_name_en: string
    category_name_ar: string
    total_count: number
    page: number
    total_pages: number
    products: CategoryProduct[]
  }
  cached?: boolean
  cache_age_seconds?: number
  source?: string
  error?: string
  message?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse<CategoryResponse>> {
  const { slug } = await params

  try {
    const { searchParams } = new URL(request.url)
    const validated = categoryQuerySchema.parse({
      page: searchParams.get('page') || '1',
      sort: searchParams.get('sort') || 'popular',
      limit: searchParams.get('limit') || '50',
    })

    const category = AMAZON_SA_CATEGORIES[slug as keyof typeof AMAZON_SA_CATEGORIES]
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'CATEGORY_NOT_FOUND', message: `Category "${slug}" not found.` },
        { status: 404 }
      )
    }

    const cacheKey = `category:${slug}:${validated.page}:${validated.sort}:${validated.limit}`

    const cachedData = await safeRedisGet(cacheKey)
    if (cachedData) {
      const parsed = JSON.parse(cachedData)
      const cacheAge = Math.floor((Date.now() - parsed.metadata.cachedAt) / 1000)
      return NextResponse.json({
        success: true,
        data: parsed.data,
        cached: true,
        cache_age_seconds: cacheAge,
        source: 'cache',
      })
    }

    const searchResult = await decodoApi.search(category.name_en, validated.page)
    const organicResults = searchResult.results?.results?.organic || []

    let products = organicResults.map((item) => {
      const mapped = mapDecodoSearchResult(item)
      return {
        asin: mapped.asin,
        title: mapped.title,
        main_image: mapped.image_url,
        price: mapped.price,
        original_price: mapped.original_price,
        discount_percentage: mapped.discount_percentage,
        rating: mapped.rating,
        ratings_count: mapped.ratings_count,
        is_prime: mapped.is_prime,
        is_best_seller: mapped.is_best_seller,
        is_amazon_choice: mapped.is_amazon_choice,
        currency: mapped.currency,
        amazon_url: mapped.amazon_url,
      }
    })

    switch (validated.sort) {
      case 'discount_desc':
        products = products.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
        break
      case 'price_asc':
        products = products.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price_desc':
        products = products.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'rating_desc':
        products = products.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
    }

    const paginatedProducts = products.slice(0, validated.limit)
    const totalCount = products.length
    const totalPages = Math.ceil(totalCount / validated.limit)

    const responseData = {
      category_slug: slug,
      category_name_en: category.name_en,
      category_name_ar: category.name_ar,
      total_count: totalCount,
      page: validated.page,
      total_pages: totalPages,
      products: paginatedProducts,
    }

    safeRedisSetex(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({
        data: responseData,
        metadata: { cachedAt: Date.now(), ttl: CACHE_TTL },
      })
    )

    return NextResponse.json({
      success: true,
      data: responseData,
      cached: false,
      cache_age_seconds: 0,
      source: 'decodo_api',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'VALIDATION_ERROR', message: error.errors[0].message },
        { status: 400 }
      )
    }

    log.error('Category API error', { slug, error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json(
      { success: false, error: 'API_ERROR', message: 'An error occurred while fetching category products.' },
      { status: 500 }
    )
  }
}