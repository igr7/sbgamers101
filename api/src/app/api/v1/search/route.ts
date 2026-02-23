import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { decodoApi, mapDecodoSearchResult } from '@/lib/decodo/decodo-client'
import { log } from '@/lib/utils/logger'

const CACHE_TTL = 1800

const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  page: z.coerce.number().int().min(1).max(100).default(1),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'rating', 'newest']).default('relevance'),
})

interface SearchResponse {
  success: boolean
  data?: {
    query: string
    page: number
    sort: string
    total_results: number
    filters_applied: Record<string, unknown>
    products: Array<{
      asin: string
      title: string
      price: number | null
      original_price: number | null
      discount_percentage: number | null
      rating: number | null
      ratings_count: number | null
      image_url: string
      is_prime: boolean
      is_best_seller: boolean
      is_amazon_choice: boolean
      currency: string
      amazon_url: string
      delivery: string | null
    }>
  }
  cached?: boolean
  cache_age_seconds?: number
  source?: string
  error?: string
  message?: string
}

export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse>> {
  try {
    const { searchParams } = new URL(request.url)
    const params = {
      q: searchParams.get('q') || '',
      page: searchParams.get('page') || '1',
      sort: searchParams.get('sort') || 'relevance',
    }

    const validated = searchQuerySchema.parse(params)
    const cacheKey = `search:${validated.q}:${validated.page}:${validated.sort}`

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

    const searchResult = await decodoApi.search(validated.q, validated.page)
    const organicResults = searchResult.results?.[0]?.content?.results?.results?.organic || []

    const products = organicResults.map((item) => {
      const mapped = mapDecodoSearchResult(item)
      return {
        asin: mapped.asin,
        title: mapped.title,
        price: mapped.price,
        original_price: mapped.original_price,
        discount_percentage: mapped.discount_percentage,
        rating: mapped.rating,
        ratings_count: mapped.ratings_count,
        image_url: mapped.image_url,
        is_prime: mapped.is_prime,
        is_best_seller: mapped.is_best_seller,
        is_amazon_choice: mapped.is_amazon_choice,
        currency: mapped.currency,
        amazon_url: mapped.amazon_url,
        delivery: mapped.delivery,
      }
    })

    let sortedProducts = products
    switch (validated.sort) {
      case 'price_asc':
        sortedProducts = products.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price_desc':
        sortedProducts = products.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'rating':
        sortedProducts = products.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
    }

    const responseData = {
      query: validated.q,
      page: validated.page,
      sort: validated.sort,
      total_results: products.length,
      filters_applied: {},
      products: sortedProducts,
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
      source: 'decodo_api',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'VALIDATION_ERROR', message: error.errors[0].message },
        { status: 400 }
      )
    }

    log.error('Search API error', { error: error instanceof Error ? error.message : 'Unknown' })
    return NextResponse.json(
      { success: false, error: 'API_ERROR', message: 'An error occurred while searching.' },
      { status: 500 }
    )
  }
}