import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { decodoApi, mapDecodoSearchResult, AMAZON_SA_CATEGORIES } from '@/lib/decodo/decodo-client'
import { log } from '@/lib/utils/logger'

const CACHE_TTL = 900

const dealsQuerySchema = z.object({
  min_discount: z.coerce.number().int().min(0).max(100).default(0),
  min_rating: z.coerce.number().min(0).max(5).default(0),
  sort: z.enum(['biggest_discount', 'lowest_price', 'highest_rating', 'most_reviewed']).default('biggest_discount'),
  category: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

interface DealProduct {
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
  category_slug: string
  category_name: string
}

interface DealsResponse {
  success: boolean
  data?: {
    total_count: number
    page: number
    total_pages: number
    filters_applied: Record<string, unknown>
    deals: DealProduct[]
  }
  cached?: boolean
  cache_age_seconds?: number
  source?: string
  error?: string
  message?: string
}

export async function GET(request: NextRequest): Promise<NextResponse<DealsResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      min_discount: searchParams.get('min_discount') || '0',
      min_rating: searchParams.get('min_rating') || '0',
      sort: searchParams.get('sort') || 'biggest_discount',
      category: searchParams.get('category') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    }

    const validated = dealsQuerySchema.parse(params)
    const cacheKey = `deals:${validated.category || 'all'}:${validated.page}:${validated.min_discount}:${validated.sort}`

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

    const categoriesToFetch = validated.category
      ? [validated.category]
      : ['gpu'] // Only fetch GPU category for performance (most popular)

    // Fetch categories in parallel
    const categoryPromises = categoriesToFetch.map(async (catSlug) => {
      const category = AMAZON_SA_CATEGORIES[catSlug as keyof typeof AMAZON_SA_CATEGORIES]
      if (!category) return []

      try {
        const searchResult = await decodoApi.search(category.name_en, validated.page)
        const organicResults = searchResult.results?.[0]?.content?.results?.results?.organic || []

        const deals: DealProduct[] = []
        for (const item of organicResults) {
          const mapped = mapDecodoSearchResult(item)

          if (validated.min_discount > 0 && (mapped.discount_percentage || 0) < validated.min_discount) continue
          if (validated.min_rating > 0 && (mapped.rating || 0) < validated.min_rating) continue

          deals.push({
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
            category_slug: catSlug,
            category_name: category.name_en,
          })
        }
        return deals
      } catch (err) {
        log.warn('Failed to fetch deals for category', { category: catSlug, error: err instanceof Error ? err.message : 'Unknown' })
        return []
      }
    })

    const categoryResults = await Promise.all(categoryPromises)
    const allDeals = categoryResults.flat()

    let sortedDeals = allDeals
    switch (validated.sort) {
      case 'biggest_discount':
        sortedDeals = allDeals.sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0))
        break
      case 'lowest_price':
        sortedDeals = allDeals.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'highest_rating':
        sortedDeals = allDeals.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'most_reviewed':
        sortedDeals = allDeals.sort((a, b) => (b.ratings_count || 0) - (a.ratings_count || 0))
        break
    }

    const paginatedDeals = sortedDeals.slice(0, validated.limit)
    const totalCount = allDeals.length
    const totalPages = Math.ceil(totalCount / validated.limit)

    const responseData = {
      total_count: totalCount,
      page: validated.page,
      total_pages: totalPages,
      filters_applied: {
        min_discount: validated.min_discount,
        min_rating: validated.min_rating,
        sort: validated.sort,
        category: validated.category,
      },
      deals: paginatedDeals,
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

    log.error('Deals API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json(
      { success: false, error: 'API_ERROR', message: 'An error occurred while fetching deals.' },
      { status: 500 }
    )
  }
}