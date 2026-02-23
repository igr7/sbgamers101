import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RedisKeys, CacheTTL, safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { generateSearchHash } from '@/lib/cache/cache-manager'
import { DealsQueryParams, DealProduct } from '@/lib/deals/deals-engine'
import { omkarApi, mapOmkarSearchResult } from '@/lib/omkar/omkar-client'
import { log } from '@/lib/utils/logger'

const GAMING_SEARCH_QUERIES = [
  'gaming headset',
  'gaming keyboard',
  'gaming mouse',
  'RTX graphics card',
  'gaming monitor',
  'gaming chair',
  'RGB RAM',
  'gaming laptop',
]

const dealsQuerySchema = z.object({
  min_discount: z.coerce.number().int().min(0).max(100).default(0),
  min_rating: z.coerce.number().min(0).max(5).default(0),
  sort: z
    .enum(['biggest_discount', 'lowest_price', 'highest_rating', 'most_reviewed'])
    .default('biggest_discount'),
  prime_only: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  best_seller_only: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

interface DealsResponse {
  success: boolean
  data?: {
    total_count: number
    page: number
    total_pages: number
    database_building?: boolean
    filters_applied: Record<string, unknown>
    deals: DealProduct[]
  }
  cached?: boolean
  stale?: boolean
  cache_age_seconds?: number
  source?: string
  error?: string
  message?: string
}

function addCacheHeaders(
  response: NextResponse,
  cached: boolean,
  cacheAge: number,
  ttl: number,
  stale: boolean
): void {
  response.headers.set('X-Cache', cached ? 'HIT' : 'MISS')
  response.headers.set('X-Cache-Age', String(cacheAge))
  response.headers.set('X-Cache-TTL', String(ttl))
  response.headers.set('X-Stale', stale ? 'true' : 'false')
  response.headers.set('Cache-Control', 'public, max-age=300')
}

export async function GET(request: NextRequest): Promise<NextResponse<DealsResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      min_discount: searchParams.get('min_discount') || '0',
      min_rating: searchParams.get('min_rating') || '0',
      sort: searchParams.get('sort') || 'biggest_discount',
      prime_only: searchParams.get('prime_only') || 'false',
      best_seller_only: searchParams.get('best_seller_only') || 'false',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    }

    const validated = dealsQuerySchema.parse(params)
    const searchHash = generateSearchHash({ ...validated, endpoint: 'deals' })
    const cacheKey = RedisKeys.deals(searchHash)

    const cachedData = await safeRedisGet(cacheKey)
    if (cachedData) {
      const parsed = JSON.parse(cachedData) as {
        data: {
          deals: DealProduct[]
          total_count: number
          page: number
          total_pages: number
          database_building: boolean
          filters_applied: Record<string, unknown>
        }
        metadata: { cachedAt: number }
      }
      const cacheAge = Math.floor((Date.now() - parsed.metadata.cachedAt) / 1000)

      const response = NextResponse.json({
        success: true,
        data: parsed.data,
        cached: true,
        stale: false,
        cache_age_seconds: cacheAge,
        source: 'cache',
      })
      addCacheHeaders(response, true, cacheAge, CacheTTL.deals, false)
      return response
    }

    // Use Omkar API directly (fastest, most reliable)
    const queryIndex = ((validated.page - 1) % GAMING_SEARCH_QUERIES.length)
    const searchQuery = GAMING_SEARCH_QUERIES[queryIndex]
    const searchResult = await omkarApi.search(searchQuery, validated.page, 'best-sellers')
    const mapped = mapOmkarSearchResult(searchResult.results || [])

    const deals: DealProduct[] = mapped
      .filter((p) => {
        if (validated.min_discount > 0 && (p.discount_percentage || 0) < validated.min_discount) return false
        if (validated.min_rating > 0 && (p.rating || 0) < validated.min_rating) return false
        if (validated.prime_only && !p.is_prime) return false
        if (validated.best_seller_only && !p.is_best_seller) return false
        return true
      })
      .slice(0, validated.limit)
      .map((p) => ({
        asin: p.asin,
        title: p.title,
        main_image: p.image_url,
        price: p.price,
        original_price: p.original_price,
        discount_percentage: p.discount_percentage,
        rating: p.rating,
        ratings_count: p.ratings_count,
        is_prime: p.is_prime,
        is_best_seller: p.is_best_seller,
        is_amazon_choice: p.is_amazon_choice,
        currency: 'SAR',
        is_near_all_time_low: false,
        all_time_low_price: null,
        price_trend_7d: null,
      }))

    const responseData = {
      total_count: searchResult.total_results || deals.length,
      page: validated.page,
      total_pages: Math.max(1, Math.ceil((searchResult.total_results || deals.length) / validated.limit)),
      filters_applied: {
        min_discount: validated.min_discount,
        sort: validated.sort,
      },
      deals,
    }

    safeRedisSetex(
      cacheKey,
      CacheTTL.deals,
      JSON.stringify({
        data: responseData,
        metadata: { cachedAt: Date.now(), ttl: CacheTTL.deals, compressed: false },
      })
    )

    const response = NextResponse.json({
      success: true,
      data: responseData,
      cached: false,
      stale: false,
      cache_age_seconds: 0,
      source: 'omkar_api',
    })
    addCacheHeaders(response, false, 0, CacheTTL.deals, false)
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.errors[0].message,
        },
        { status: 400 }
      )
    }

    log.error('Deals API error', {
      error: error instanceof Error ? error.message : 'Unknown',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'API_ERROR',
        message: 'An error occurred while fetching deals.',
        retry_after: 30,
      },
      { status: 500 }
    )
  }
}
