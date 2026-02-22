import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { redis, RedisKeys, CacheTTL } from '@/lib/cache/redis-client'
import { generateSearchHash } from '@/lib/cache/cache-manager'
import { getDeals, DealsQueryParams, DealProduct } from '@/lib/deals/deals-engine'
import { log } from '@/lib/utils/logger'

const dealsQuerySchema = z.object({
  min_discount: z.coerce.number().int().min(0).max(100).default(10),
  min_rating: z.coerce.number().min(0).max(5).default(0),
  sort: z
    .enum(['biggest_discount', 'lowest_price', 'highest_rating', 'most_reviewed'])
    .default('biggest_discount'),
  prime_only: z.coerce.boolean().default(false),
  best_seller_only: z.coerce.boolean().default(false),
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
      min_discount: searchParams.get('min_discount') || '10',
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

    const cachedData = await redis.get(cacheKey)
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

    const queryParams: DealsQueryParams = {
      min_discount: validated.min_discount,
      min_rating: validated.min_rating,
      sort: validated.sort,
      prime_only: validated.prime_only,
      best_seller_only: validated.best_seller_only,
      page: validated.page,
      limit: validated.limit,
    }

    const result = await getDeals(queryParams)

    const responseData = {
      total_count: result.total_count,
      page: result.page,
      total_pages: result.total_pages,
      database_building: result.database_building,
      filters_applied: {
        min_discount: validated.min_discount,
        min_rating: validated.min_rating,
        sort: validated.sort,
        prime_only: validated.prime_only,
        best_seller_only: validated.best_seller_only,
      },
      deals: result.deals,
    }

    await redis.setex(
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
      source: 'database',
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