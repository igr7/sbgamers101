import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RedisKeys, CacheTTL, safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { omkarApi, mapOmkarReviewsResponse, ReviewsResponse } from '@/lib/omkar/omkar-client'
import { log } from '@/lib/utils/logger'

const asinSchema = z.string().regex(/^[A-Z0-9]{10}$/, 'Invalid ASIN format')

interface ReviewsApiResponse {
  success: boolean
  data?: ReviewsResponse
  cached?: boolean
  stale?: boolean
  cache_age_seconds?: number
  source?: string
  error?: string
  message?: string
  stale_data?: ReviewsResponse
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
): Promise<NextResponse<ReviewsApiResponse>> {
  const { asin } = await params

  try {
    const validatedAsin = asinSchema.parse(asin.toUpperCase())

    const cacheKey = RedisKeys.reviews(validatedAsin)
    const cachedData = await safeRedisGet(cacheKey)

    if (cachedData) {
      const parsed = JSON.parse(cachedData) as {
        data: ReviewsResponse
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
      addCacheHeaders(response, true, cacheAge, CacheTTL.reviews, false)
      return response
    }

    const rawReviews = await omkarApi.getReviews(validatedAsin)
    const reviewsData = mapOmkarReviewsResponse(rawReviews, validatedAsin)

    safeRedisSetex(
      cacheKey,
      CacheTTL.reviews,
      JSON.stringify({
        data: reviewsData,
        metadata: { cachedAt: Date.now(), ttl: CacheTTL.reviews, compressed: false },
      })
    )

    const response = NextResponse.json({
      success: true,
      data: reviewsData,
      cached: false,
      stale: false,
      cache_age_seconds: 0,
      source: 'api',
    })
    addCacheHeaders(response, false, 0, CacheTTL.reviews, false)
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

    log.error('Reviews API error', {
      asin,
      error: error instanceof Error ? error.message : 'Unknown',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'API_ERROR',
        message: 'An error occurred while fetching reviews.',
        retry_after: 30,
      },
      { status: 500 }
    )
  }
}