import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { decodoApi, mapDecodoProduct } from '@/lib/decodo/decodo-client'
import { log } from '@/lib/utils/logger'

const CACHE_TTL = 21600

const asinSchema = z.string().regex(/^[A-Z0-9]{10}$/, 'Invalid ASIN format')

type DataSource = 'cache' | 'api'

interface ProductResponse {
  asin: string
  title: string | null
  brand: string | null
  description: string | null
  key_features: string[]
  price: number | null
  original_price: number | null
  discount_percentage: number | null
  currency: string
  availability: string | null
  rating: number | null
  ratings_count: number | null
  main_image: string | null
  images: string[]
  category: string | null
  category_hierarchy: string | null
  is_prime: boolean
  is_best_seller: boolean
  is_amazon_choice: boolean
  amazon_url: string
  variants: Array<{ asin: string; price?: number; availability?: string; attributes: Record<string, string> }>
  frequently_bought_together: Array<{ asin: string; title: string; price: number; image_url: string }>
  top_reviews: Array<{
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

interface ApiResponse<T> {
  success: boolean
  data?: T
  cached?: boolean
  cache_age_seconds?: number
  source?: DataSource
  error?: string
  message?: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asin: string }> }
): Promise<NextResponse<ApiResponse<ProductResponse>>> {
  const { asin } = await params

  try {
    const validatedAsin = asinSchema.parse(asin.toUpperCase())
    const cacheKey = `product:${validatedAsin}:full`

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
    
    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Product ${validatedAsin} not found on Amazon Saudi Arabia.`,
        },
        { status: 404 }
      )
    }

    const productData = mapDecodoProduct(product)

    safeRedisSetex(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({
        data: productData,
        metadata: { cachedAt: Date.now(), ttl: CACHE_TTL },
      })
    )

    return NextResponse.json({
      success: true,
      data: productData,
      cached: false,
      cache_age_seconds: 0,
      source: 'api',
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

    log.error('Product API error', {
      asin,
      error: error instanceof Error ? error.message : 'Unknown',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'API_ERROR',
        message: 'An error occurred while fetching product data.',
      },
      { status: 500 }
    )
  }
}