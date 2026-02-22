import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { redis, RedisKeys, CacheTTL } from '@/lib/cache/redis-client'
import { generateSearchHash } from '@/lib/cache/cache-manager'
import { getProducts, ProductsQueryParams, DealProduct } from '@/lib/deals/deals-engine'
import { log } from '@/lib/utils/logger'

const productsQuerySchema = z.object({
  sort: z
    .enum([
      'price_asc',
      'price_desc',
      'rating_desc',
      'discount_desc',
      'newest',
      'most_reviewed',
      'most_popular',
    ])
    .default('most_popular'),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  min_discount: z.coerce.number().min(0).max(100).optional(),
  prime_only: z.coerce.boolean().default(false),
  best_seller_only: z.coerce.boolean().default(false),
  amazon_choice_only: z.coerce.boolean().default(false),
  brand: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

interface ProductsResponse {
  success: boolean
  data?: {
    total_count: number
    page: number
    total_pages: number
    filters_applied: Record<string, unknown>
    products: DealProduct[]
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

export async function GET(request: NextRequest): Promise<NextResponse<ProductsResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      sort: searchParams.get('sort') || 'most_popular',
      min_price: searchParams.get('min_price') || undefined,
      max_price: searchParams.get('max_price') || undefined,
      min_rating: searchParams.get('min_rating') || undefined,
      min_discount: searchParams.get('min_discount') || undefined,
      prime_only: searchParams.get('prime_only') || 'false',
      best_seller_only: searchParams.get('best_seller_only') || 'false',
      amazon_choice_only: searchParams.get('amazon_choice_only') || 'false',
      brand: searchParams.get('brand') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    }

    const validated = productsQuerySchema.parse(params)
    const searchHash = generateSearchHash({ ...validated, endpoint: 'products' })
    const cacheKey = RedisKeys.products(searchHash)

    const cachedData = await redis.get(cacheKey)
    if (cachedData) {
      const parsed = JSON.parse(cachedData) as {
        data: {
          products: DealProduct[]
          total_count: number
          page: number
          total_pages: number
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

    const queryParams: ProductsQueryParams = {
      sort: validated.sort,
      min_price: validated.min_price,
      max_price: validated.max_price,
      min_rating: validated.min_rating,
      min_discount: validated.min_discount,
      prime_only: validated.prime_only,
      best_seller_only: validated.best_seller_only,
      amazon_choice_only: validated.amazon_choice_only,
      brand: validated.brand,
      page: validated.page,
      limit: validated.limit,
    }

    const result = await getProducts(queryParams)

    const responseData = {
      total_count: result.total_count,
      page: result.page,
      total_pages: result.total_pages,
      filters_applied: result.filters_applied,
      products: result.products,
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

    log.error('Products API error', {
      error: error instanceof Error ? error.message : 'Unknown',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'API_ERROR',
        message: 'An error occurred while fetching products.',
        retry_after: 30,
      },
      { status: 500 }
    )
  }
}