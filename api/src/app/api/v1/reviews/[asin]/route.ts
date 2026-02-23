import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { decodoApi } from '@/lib/decodo/decodo-client'
import { log } from '@/lib/utils/logger'

const CACHE_TTL = 86400

const asinSchema = z.string().regex(/^[A-Z0-9]{10}$/, 'Invalid ASIN format')

interface ReviewsResponse {
  success: boolean
  data?: {
    asin: string
    overall_rating: number | null
    total_reviews: number
    reviews: Array<{
      review_id: string
      reviewer_name: string
      rating: number
      review_title: string
      review_text: string
      review_date: string
      is_verified_purchase: boolean
      helpful_votes: number
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
): Promise<NextResponse<ReviewsResponse>> {
  const { asin } = await params

  try {
    const validatedAsin = asinSchema.parse(asin.toUpperCase())
    const cacheKey = `reviews:${validatedAsin}`

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

    const product = await decodoApi.getProduct(validatedAsin)

    const reviewsData = {
      asin: validatedAsin,
      overall_rating: product?.rating || null,
      total_reviews: product?.ratings_total || 0,
      reviews: (product?.top_reviews || []).map((review) => ({
        review_id: review.id,
        reviewer_name: review.author,
        rating: review.rating,
        review_title: review.title,
        review_text: review.body,
        review_date: review.date,
        is_verified_purchase: review.verified,
        helpful_votes: review.helpful_votes || 0,
      })),
    }

    safeRedisSetex(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({
        data: reviewsData,
        metadata: { cachedAt: Date.now(), ttl: CACHE_TTL },
      })
    )

    return NextResponse.json({
      success: true,
      data: reviewsData,
      cached: false,
      cache_age_seconds: 0,
      source: 'decodo_api',
    })
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
      { success: false, error: 'API_ERROR', message: 'An error occurred while fetching reviews.' },
      { status: 500 }
    )
  }
}