import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RedisKeys, CacheTTL, safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { generateSearchHash } from '@/lib/cache/cache-manager'
import { getProducts, ProductsQueryParams, DealProduct } from '@/lib/deals/deals-engine'
import { omkarApi, mapOmkarSearchResult } from '@/lib/omkar/omkar-client'
import { log } from '@/lib/utils/logger'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('DB_TIMEOUT')), ms)),
  ])
}

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
  prime_only: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  best_seller_only: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  amazon_choice_only: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
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

    const cachedData = await safeRedisGet(cacheKey)
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

    let responseData: {
      total_count: number
      page: number
      total_pages: number
      filters_applied: Record<string, unknown>
      products: DealProduct[]
    }
    let source = 'database'

    try {
      const result = await withTimeout(getProducts(queryParams), 8000)

      if (result.products.length === 0) {
        throw new Error('DB_EMPTY')
      }

      responseData = {
        total_count: result.total_count,
        page: result.page,
        total_pages: result.total_pages,
        filters_applied: result.filters_applied,
        products: result.products,
      }
    } catch (dbError) {
      log.warn('DB unavailable for products, falling back to omkar API', {
        error: dbError instanceof Error ? dbError.message : 'Unknown',
      })

      const omkarSort = validated.sort === 'price_asc' ? 'price-low-to-high'
        : validated.sort === 'price_desc' ? 'price-high-to-low'
        : validated.sort === 'rating_desc' ? 'reviews'
        : 'best-sellers'

      const searchResult = await omkarApi.search('gaming', validated.page, omkarSort)
      const mapped = mapOmkarSearchResult(searchResult.results || [])

      const products: DealProduct[] = mapped
        .filter((p) => {
          if (validated.min_price !== undefined && (p.price || 0) < validated.min_price) return false
          if (validated.max_price !== undefined && (p.price || 0) > validated.max_price) return false
          if (validated.min_rating !== undefined && (p.rating || 0) < validated.min_rating) return false
          if (validated.min_discount !== undefined && (p.discount_percentage || 0) < validated.min_discount) return false
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

      responseData = {
        total_count: products.length,
        page: validated.page,
        total_pages: Math.max(1, Math.ceil((searchResult.total_results || products.length) / validated.limit)),
        filters_applied: { sort: validated.sort },
        products,
      }
      source = 'omkar_fallback'
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
      source,
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