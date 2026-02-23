import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RedisKeys, CacheTTL, safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { generateSearchHash, getCachedOrFetch } from '@/lib/cache/cache-manager'
import { omkarApi, mapOmkarSearchResult, SearchProductResult } from '@/lib/omkar/omkar-client'
import { prisma } from '@/lib/db/prisma-client'
import { log } from '@/lib/utils/logger'

const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  page: z.coerce.number().int().min(1).default(1),
  sort: z
    .enum(['relevance', 'price_asc', 'price_desc', 'rating', 'newest', 'best_sellers'])
    .default('relevance'),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  prime_only: z.coerce.boolean().default(false),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  min_discount: z.coerce.number().min(0).max(100).optional(),
})

const sortMapping: Record<string, string> = {
  relevance: 'relevance',
  price_asc: 'price-low-to-high',
  price_desc: 'price-high-to-low',
  rating: 'reviews',
  newest: 'date',
  best_sellers: 'best-sellers',
}

interface SearchResponse {
  success: boolean
  data?: {
    query: string
    page: number
    sort: string
    total_results: number
    filters_applied: Record<string, unknown>
    products: SearchProductResult[]
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

export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const params = {
      q: searchParams.get('q') || '',
      page: searchParams.get('page') || '1',
      sort: searchParams.get('sort') || 'relevance',
      min_price: searchParams.get('min_price') || undefined,
      max_price: searchParams.get('max_price') || undefined,
      prime_only: searchParams.get('prime_only') || 'false',
      min_rating: searchParams.get('min_rating') || undefined,
      min_discount: searchParams.get('min_discount') || undefined,
    }

    const validated = searchSchema.parse(params)
    const searchHash = generateSearchHash(validated)
    const cacheKey = RedisKeys.search(searchHash)

    const cachedData = await safeRedisGet(cacheKey)
    if (cachedData) {
      const parsed = JSON.parse(cachedData) as {
        data: { products: SearchProductResult[]; total: number }
        metadata: { cachedAt: number }
      }
      const cacheAge = Math.floor((Date.now() - parsed.metadata.cachedAt) / 1000)

      const response = NextResponse.json({
        success: true,
        data: {
          query: validated.q,
          page: validated.page,
          sort: validated.sort,
          total_results: parsed.data.total,
          filters_applied: {
            min_price: validated.min_price,
            max_price: validated.max_price,
            prime_only: validated.prime_only,
            min_rating: validated.min_rating,
            min_discount: validated.min_discount,
          },
          products: parsed.data.products,
        },
        cached: true,
        stale: false,
        cache_age_seconds: cacheAge,
        source: 'cache',
      })
      addCacheHeaders(response, true, cacheAge, CacheTTL.search, false)
      return response
    }

    const omkarSort = sortMapping[validated.sort] || 'relevance'
    const searchResult = await omkarApi.search(validated.q, validated.page, omkarSort)

    let products = mapOmkarSearchResult(searchResult.results || [])

    if (validated.min_price !== undefined) {
      products = products.filter(
        (p) => p.price !== null && p.price >= validated.min_price!
      )
    }
    if (validated.max_price !== undefined) {
      products = products.filter(
        (p) => p.price !== null && p.price <= validated.max_price!
      )
    }
    if (validated.prime_only) {
      products = products.filter((p) => p.is_prime)
    }
    if (validated.min_rating !== undefined) {
      products = products.filter(
        (p) => p.rating !== null && p.rating >= validated.min_rating!
      )
    }
    if (validated.min_discount !== undefined) {
      products = products.filter(
        (p) =>
          p.discount_percentage !== null && p.discount_percentage >= validated.min_discount!
      )
    }

    // Fire-and-forget DB upserts to avoid slowing down the response
    Promise.all(
      products.slice(0, 10).map((product) =>
        prisma.product.upsert({
          where: { asin: product.asin },
          create: {
            asin: product.asin,
            title: product.title,
            price: product.price,
            original_price: product.original_price,
            discount_percentage: product.discount_percentage,
            rating: product.rating,
            ratings_count: product.ratings_count,
            main_image: product.image_url,
            is_prime: product.is_prime,
            is_best_seller: product.is_best_seller,
            is_amazon_choice: product.is_amazon_choice,
          },
          update: {
            title: product.title,
            price: product.price,
            original_price: product.original_price,
            discount_percentage: product.discount_percentage,
            rating: product.rating,
            ratings_count: product.ratings_count,
            main_image: product.image_url,
            is_prime: product.is_prime,
            is_best_seller: product.is_best_seller,
            is_amazon_choice: product.is_amazon_choice,
          },
        }).catch(() => {})
      )
    ).catch(() => {})

    const cacheData = {
      data: { products, total: products.length },
      metadata: { cachedAt: Date.now(), ttl: CacheTTL.search, compressed: false },
    }
    safeRedisSetex(cacheKey, CacheTTL.search, JSON.stringify(cacheData))

    const responseTime = Date.now() - startTime
    log.info('Search completed', {
      query: validated.q,
      results: products.length,
      responseTime: `${responseTime}ms`,
      cached: false,
    })

    const response = NextResponse.json({
      success: true,
      data: {
        query: validated.q,
        page: validated.page,
        sort: validated.sort,
        total_results: searchResult.total_results || products.length,
        filters_applied: {
          min_price: validated.min_price,
          max_price: validated.max_price,
          prime_only: validated.prime_only,
          min_rating: validated.min_rating,
          min_discount: validated.min_discount,
        },
        products,
      },
      cached: false,
      stale: false,
      cache_age_seconds: 0,
      source: 'api',
    })
    addCacheHeaders(response, false, 0, CacheTTL.search, false)
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

    log.error('Search API error', {
      error: error instanceof Error ? error.message : 'Unknown',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'API_ERROR',
        message: 'An error occurred while searching products.',
        retry_after: 30,
      },
      { status: 500 }
    )
  }
}