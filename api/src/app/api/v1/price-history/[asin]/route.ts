import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RedisKeys, CacheTTL, safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { getPriceHistory, PriceHistoryStats } from '@/lib/price-history/price-analyzer'
import { fetchAndSaveProduct } from '@/lib/omkar/product-fetcher'
import { prisma } from '@/lib/db/prisma-client'
import { log } from '@/lib/utils/logger'

const asinSchema = z.string().regex(/^[A-Z0-9]{10}$/, 'Invalid ASIN format')

const querySchema = z.object({
  days: z.coerce.number().int().refine((v) => [7, 30, 90, 180, 0].includes(v) || v === -1, {
    message: 'Days must be 7, 30, 90, 180, or -1 for all',
  }).default(30),
  interval: z.enum(['hourly', 'daily', 'weekly']).default('daily'),
})

interface PriceHistoryResponse {
  success: boolean
  data?: PriceHistoryStats
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
): Promise<NextResponse<PriceHistoryResponse>> {
  const { asin } = await params

  try {
    const validatedAsin = asinSchema.parse(asin.toUpperCase())
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')
    const intervalParam = searchParams.get('interval')

    const validated = querySchema.parse({
      days: daysParam === 'all' ? -1 : (daysParam || 30),
      interval: intervalParam || 'daily',
    })

    const days = validated.days === -1 ? 0 : validated.days

    const cacheKey = `${RedisKeys.productPrice(validatedAsin)}:history:${days}:${validated.interval}`
    const cachedData = await safeRedisGet(cacheKey)

    if (cachedData) {
      const parsed = JSON.parse(cachedData) as {
        data: PriceHistoryStats
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
      addCacheHeaders(response, true, cacheAge, CacheTTL.price, false)
      return response
    }

    const existingHistory = await prisma.priceHistory.findFirst({
      where: { asin: validatedAsin },
    })

    if (!existingHistory) {
      log.info('No price history found, fetching product', { asin: validatedAsin })
      const productData = await fetchAndSaveProduct(validatedAsin)

      if (!productData) {
        return NextResponse.json(
          {
            success: false,
            error: 'PRODUCT_NOT_FOUND',
            message: `Product ${validatedAsin} not found. Cannot start price tracking.`,
          },
          { status: 404 }
        )
      }

      const initialStats = await getPriceHistory(validatedAsin, days, validated.interval)
      initialStats.tracking_started = true

      safeRedisSetex(
        cacheKey,
        CacheTTL.price,
        JSON.stringify({
          data: initialStats,
          metadata: { cachedAt: Date.now(), ttl: CacheTTL.price, compressed: false },
        })
      )

      const response = NextResponse.json({
        success: true,
        data: initialStats,
        cached: false,
        stale: false,
        cache_age_seconds: 0,
        source: 'api',
      })
      addCacheHeaders(response, false, 0, CacheTTL.price, false)
      return response
    }

    const historyStats = await getPriceHistory(validatedAsin, days, validated.interval)

    safeRedisSetex(
      cacheKey,
      CacheTTL.price,
      JSON.stringify({
        data: historyStats,
        metadata: { cachedAt: Date.now(), ttl: CacheTTL.price, compressed: false },
      })
    )

    const response = NextResponse.json({
      success: true,
      data: historyStats,
      cached: false,
      stale: false,
      cache_age_seconds: 0,
      source: 'database',
    })
    addCacheHeaders(response, false, 0, CacheTTL.price, false)
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

    log.error('Price history API error', {
      asin,
      error: error instanceof Error ? error.message : 'Unknown',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'API_ERROR',
        message: 'An error occurred while fetching price history.',
        retry_after: 30,
      },
      { status: 500 }
    )
  }
}