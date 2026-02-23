import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma-client'
import { RedisKeys, CacheTTL, safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { fetchAndSaveProduct, getStoredProduct } from '@/lib/omkar/product-fetcher'
import { getMonthlyUsageStats } from '@/lib/omkar/usage-tracker'
import { log } from '@/lib/utils/logger'
import { omkarApi, mapOmkarToProductData, ProductData } from '@/lib/omkar/omkar-client'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ])
}

const asinSchema = z.string().regex(/^[A-Z0-9]{10}$/, 'Invalid ASIN format')

type DataSource = 'cache' | 'api' | 'database'

interface ApiResponse<T> {
  success: boolean
  data?: T
  cached?: boolean
  stale?: boolean
  cache_age_seconds?: number
  source?: DataSource
  error?: string
  message?: string
  stale_data?: T | null
  retry_after?: number
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

function createResponse<T>(
  data: T,
  cached: boolean,
  stale: boolean,
  cacheAge: number,
  source: DataSource
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    cached,
    stale,
    cache_age_seconds: cacheAge,
    source,
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
): Promise<NextResponse<ApiResponse<ProductData>>> {
  const { asin } = await params
  const startTime = Date.now()

  try {
    const validatedAsin = asinSchema.parse(asin.toUpperCase())

    const cacheKey = RedisKeys.productFull(validatedAsin)
    const cachedData = await safeRedisGet(cacheKey)

    if (cachedData) {
      const parsed = JSON.parse(cachedData) as {
        data: ProductData
        metadata: { cachedAt: number }
      }
      const cacheAge = Math.floor((Date.now() - parsed.metadata.cachedAt) / 1000)

      const response = createResponse(parsed.data, true, false, cacheAge, 'cache')
      addCacheHeaders(response, true, cacheAge, CacheTTL.product, false)
      return response
    }

    // Try DB with 3s timeout - skip if unavailable
    const storedProduct = await withTimeout(getStoredProduct(validatedAsin), 3000)
    if (storedProduct) {
      const cacheAge = storedProduct.fetched_at
        ? Math.floor((Date.now() - new Date(storedProduct.fetched_at).getTime()) / 1000)
        : 0

      const staleTtl = CacheTTL.product * 2
      if (cacheAge < staleTtl) {
        setImmediate(() => {
          fetchAndSaveProduct(validatedAsin).catch((err) => {
            log.error('Background refresh failed', {
              asin: validatedAsin,
              error: err.message,
            })
          })
        })

        const response = createResponse(storedProduct, true, true, cacheAge, 'database')
        addCacheHeaders(response, true, cacheAge, CacheTTL.product, true)
        return response
      }
    }

    // Check usage quota with 3s timeout - skip check if DB unavailable
    const usageStats = await withTimeout(getMonthlyUsageStats(), 3000)
    if (usageStats?.is_near_limit) {
      if (storedProduct) {
        const response = createResponse(storedProduct, true, true, 0, 'database')
        response.headers.set('X-Quota-Warning', 'true')
        addCacheHeaders(response, true, 0, CacheTTL.product, true)
        return response
      }

      return NextResponse.json(
        {
          success: false,
          error: 'QUOTA_EXCEEDED',
          message: 'API quota exceeded. Please try again later.',
          stale_data: null,
          retry_after: 3600,
        },
        { status: 429 }
      )
    }

    // Try fetchAndSaveProduct first (includes DB write), fall back to direct omkar API
    let productData = await withTimeout(fetchAndSaveProduct(validatedAsin), 18000)

    if (!productData) {
      // Direct omkar API fallback (skip DB entirely)
      try {
        const raw = await omkarApi.getProduct(validatedAsin)
        productData = mapOmkarToProductData(raw, validatedAsin)
      } catch {
        // omkar API also failed
      }
    }

    if (!productData) {
      if (storedProduct) {
        const response = createResponse(storedProduct, true, true, 0, 'database')
        addCacheHeaders(response, true, 0, CacheTTL.product, true)
        return response
      }

      return NextResponse.json(
        {
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Product ${validatedAsin} not found on Amazon Saudi Arabia.`,
          stale_data: null,
        },
        { status: 404 }
      )
    }

    safeRedisSetex(
      cacheKey,
      CacheTTL.product,
      JSON.stringify({
        data: productData,
        metadata: { cachedAt: Date.now(), ttl: CacheTTL.product, compressed: false },
      })
    )

    const responseTime = Date.now() - startTime
    log.info('Product fetched', {
      asin: validatedAsin,
      responseTime: `${responseTime}ms`,
      cached: false,
    })

    const response = createResponse(productData, false, false, 0, 'api')
    addCacheHeaders(response, false, 0, CacheTTL.product, false)
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_ASIN',
          message: 'Invalid ASIN format. ASIN must be 10 alphanumeric characters.',
        },
        { status: 400 }
      )
    }

    log.error('Product API error', {
      asin,
      error: error instanceof Error ? error.message : 'Unknown',
    })

    const storedProduct = await withTimeout(getStoredProduct(asin).catch(() => null), 3000)
    if (storedProduct) {
      const response = createResponse(storedProduct, true, true, 0, 'database')
      addCacheHeaders(response, true, 0, CacheTTL.product, true)
      return response
    }

    return NextResponse.json(
      {
        success: false,
        error: 'API_ERROR',
        message: 'An error occurred while fetching product data.',
        stale_data: null,
        retry_after: 30,
      },
      { status: 500 }
    )
  }
}