import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { decodoApi, mapDecodoSearchResult } from '@/lib/decodo/decodo-client'
import { log } from '@/lib/utils/logger'

const CACHE_TTL = 1800

const productsQuerySchema = z.object({
  sort: z.enum(['price_asc', 'price_desc', 'rating_desc', 'discount_desc', 'popular']).default('popular'),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  min_discount: z.coerce.number().min(0).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})

interface ProductItem {
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

interface ProductsResponse {
  success: boolean
  data?: {
    total_count: number
    page: number
    total_pages: number
    filters_applied: Record<string, unknown>
    products: ProductItem[]
  }
  cached?: boolean
  cache_age_seconds?: number
  source?: string
  error?: string
  message?: string
}

export async function GET(request: NextRequest): Promise<NextResponse<ProductsResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      sort: searchParams.get('sort') || 'popular',
      min_price: searchParams.get('min_price') || undefined,
      max_price: searchParams.get('max_price') || undefined,
      min_rating: searchParams.get('min_rating') || undefined,
      min_discount: searchParams.get('min_discount') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
    }

    const validated = productsQuerySchema.parse(params)
    const cacheKey = `products:${validated.sort}:${validated.page}:${validated.limit}`

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

    const searchResult = await decodoApi.search('gaming', validated.page)
    const organicResults = searchResult.results?.[0]?.content?.results?.results?.organic || []

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

    if (validated.min_price !== undefined) {
      products = products.filter((p) => p.price !== null && p.price >= validated.min_price!)
    }
    if (validated.max_price !== undefined) {
      products = products.filter((p) => p.price !== null && p.price <= validated.max_price!)
    }
    if (validated.min_rating !== undefined) {
      products = products.filter((p) => p.rating !== null && p.rating >= validated.min_rating!)
    }
    if (validated.min_discount !== undefined) {
      products = products.filter((p) => p.discount_percentage !== null && p.discount_percentage >= validated.min_discount!)
    }

    switch (validated.sort) {
      case 'price_asc':
        products = products.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price_desc':
        products = products.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'rating_desc':
        products = products.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'discount_desc':
        products = products.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
        break
    }

    const paginatedProducts = products.slice(0, validated.limit)
    const totalCount = products.length
    const totalPages = Math.ceil(totalCount / validated.limit)

    const responseData = {
      total_count: totalCount,
      page: validated.page,
      total_pages: totalPages,
      filters_applied: {
        min_price: validated.min_price,
        max_price: validated.max_price,
        min_rating: validated.min_rating,
        min_discount: validated.min_discount,
        sort: validated.sort,
      },
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

    log.error('Products API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json(
      { success: false, error: 'API_ERROR', message: 'An error occurred while fetching products.' },
      { status: 500 }
    )
  }
}