import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import md5 from 'md5'

const GAMING_SEARCH_QUERIES = [
  'gaming headset',
  'gaming keyboard',
  'gaming mouse',
  'RTX graphics card',
  'gaming monitor',
  'gaming chair',
  'RGB RAM',
  'gaming laptop',
]

const CACHE_TTL = 900

const dealsQuerySchema = z.object({
  min_discount: z.coerce.number().int().min(0).max(100).default(0),
  min_rating: z.coerce.number().min(0).max(5).default(0),
  sort: z
    .enum(['biggest_discount', 'lowest_price', 'highest_rating', 'most_reviewed'])
    .default('biggest_discount'),
  prime_only: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  best_seller_only: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

interface DealProduct {
  asin: string
  title: string
  main_image: string
  price: number | null
  original_price: number | null
  discount_percentage: number | null
  rating: number | null
  ratings_count: number | null
  is_prime: boolean
  is_best_seller: boolean
  is_amazon_choice: boolean
  currency: string
  is_near_all_time_low: boolean
  all_time_low_price: number | null
  price_trend_7d: string | null
}

interface DealsResponse {
  success: boolean
  data?: {
    total_count: number
    page: number
    total_pages: number
    filters_applied: Record<string, unknown>
    deals: DealProduct[]
  }
  cached?: boolean
  cache_age_seconds?: number
  source?: string
  error?: string
  message?: string
}

function generateSearchHash(params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return md5(sorted)
}

const OMKAR_API_BASE = process.env.OMKAR_API_BASE || 'https://amazon-scraper-api.omkar.cloud'
const OMKAR_API_KEY = process.env.OMKAR_API_KEY || ''

async function fetchFromOmkar(query: string, page: number): Promise<{
  results: Array<{
    asin?: string
    title?: string
    price?: string | number
    original_price?: string | number
    rating?: string | number
    ratings_count?: number
    image_url?: string
    is_prime?: boolean
    is_best_seller?: boolean
    is_amazon_choice?: boolean
  }>
  total_results?: number
}> {
  const url = new URL(`${OMKAR_API_BASE}/amazon/search`)
  url.searchParams.set('query', query)
  url.searchParams.set('country_code', 'SA')
  url.searchParams.set('page', String(page))
  url.searchParams.set('sort_by', 'best_sellers')
  
  const res = await fetch(url.toString(), {
    headers: { 'API-Key': OMKAR_API_KEY },
    signal: AbortSignal.timeout(15000),
  })
  
  if (!res.ok) {
    throw new Error(`Omkar API error: ${res.status}`)
  }
  
  return res.json()
}

function parsePrice(price: string | number | undefined): number | null {
  if (price === undefined || price === null) return null
  if (typeof price === 'number') return price
  const cleaned = price.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

function mapProduct(item: NonNullable<ReturnType<typeof fetchFromOmkar> extends Promise<infer R> ? R['results'] : never>): DealProduct {
  const price = parsePrice(item.price)
  const originalPrice = parsePrice(item.original_price)
  let discountPercentage: number | null = null
  if (price !== null && originalPrice !== null && originalPrice > price) {
    discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100)
  }
  
  return {
    asin: item.asin || '',
    title: item.title || '',
    main_image: item.image_url || '',
    price,
    original_price: originalPrice,
    discount_percentage: discountPercentage,
    rating: item.rating ? parseFloat(String(item.rating)) : null,
    ratings_count: item.ratings_count || null,
    is_prime: item.is_prime || false,
    is_best_seller: item.is_best_seller || false,
    is_amazon_choice: item.is_amazon_choice || false,
    currency: 'SAR',
    is_near_all_time_low: false,
    all_time_low_price: null,
    price_trend_7d: null,
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<DealsResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      min_discount: searchParams.get('min_discount') || '0',
      min_rating: searchParams.get('min_rating') || '0',
      sort: searchParams.get('sort') || 'biggest_discount',
      prime_only: searchParams.get('prime_only') || 'false',
      best_seller_only: searchParams.get('best_seller_only') || 'false',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    }

    const validated = dealsQuerySchema.parse(params)
    const searchHash = generateSearchHash({ ...validated, endpoint: 'deals' })
    const cacheKey = `deals:${searchHash}`

    const cachedData = await safeRedisGet(cacheKey)
    if (cachedData) {
      const parsed = JSON.parse(cachedData) as {
        data: {
          deals: DealProduct[]
          total_count: number
          page: number
          total_pages: number
          filters_applied: Record<string, unknown>
        }
        metadata: { cachedAt: number }
      }
      const cacheAge = Math.floor((Date.now() - parsed.metadata.cachedAt) / 1000)

      return NextResponse.json({
        success: true,
        data: parsed.data,
        cached: true,
        cache_age_seconds: cacheAge,
        source: 'cache',
      })
    }

    const queryIndex = ((validated.page - 1) % GAMING_SEARCH_QUERIES.length)
    const searchQuery = GAMING_SEARCH_QUERIES[queryIndex]
    const searchResult = await fetchFromOmkar(searchQuery, validated.page)
    
    const deals: DealProduct[] = (searchResult.results || [])
      .map(mapProduct)
      .filter((p) => {
        if (validated.min_discount > 0 && (p.discount_percentage || 0) < validated.min_discount) return false
        if (validated.min_rating > 0 && (p.rating || 0) < validated.min_rating) return false
        if (validated.prime_only && !p.is_prime) return false
        if (validated.best_seller_only && !p.is_best_seller) return false
        return true
      })
      .slice(0, validated.limit)

    const responseData = {
      total_count: searchResult.total_results || deals.length,
      page: validated.page,
      total_pages: Math.max(1, Math.ceil((searchResult.total_results || deals.length) / validated.limit)),
      filters_applied: {
        min_discount: validated.min_discount,
        sort: validated.sort,
      },
      deals,
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
      source: 'omkar_api',
    })
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
