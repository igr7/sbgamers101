import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { getPriceHistory } from '@/lib/queue/jobs/price-update'
import { log } from '@/lib/utils/logger'

const CACHE_TTL = 3600

const asinSchema = z.string().regex(/^[A-Z0-9]{10}$/, 'Invalid ASIN format')
const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
})

interface PriceHistoryResponse {
  success: boolean
  data?: {
    asin: string
    history: Array<{
      price: number
      timestamp: string
    }>
  }
  cached?: boolean
  cache_age_seconds?: number
  source?: string
  error?: string
  message?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
): Promise<NextResponse<PriceHistoryResponse>> {
  const { asin } = await params

  try {
    const validatedAsin = asinSchema.parse(asin.toUpperCase())
    const { searchParams } = new URL(request.url)
    const validated = querySchema.parse({
      days: searchParams.get('days') || 30,
    })

    const cacheKey = `price_history:${validatedAsin}:response`

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

    const history = await getPriceHistory(validatedAsin)

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - validated.days)

    const filteredHistory = history.filter((h) => new Date(h.timestamp) >= cutoffDate)

    const responseData = {
      asin: validatedAsin,
      history: filteredHistory.map((h) => ({
        price: h.price,
        timestamp: h.timestamp,
      })),
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
      source: 'database',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'VALIDATION_ERROR', message: error.errors[0].message },
        { status: 400 }
      )
    }

    log.error('Price history API error', {
      asin,
      error: error instanceof Error ? error.message : 'Unknown',
    })

    return NextResponse.json(
      { success: false, error: 'API_ERROR', message: 'An error occurred while fetching price history.' },
      { status: 500 }
    )
  }
}