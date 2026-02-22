import axios, { AxiosError } from 'axios'
import { prisma } from '../db/prisma-client'
import { log } from '../utils/logger'

const OMKAR_API_BASE = process.env.OMKAR_API_BASE || 'https://amazon-scraper-api.omkar.cloud'
const OMKAR_API_KEY = process.env.OMKAR_API_KEY || ''

const client = axios.create({
  baseURL: OMKAR_API_BASE,
  headers: { 'API-Key': OMKAR_API_KEY },
  timeout: 25000,
})

interface OmkarProductResponse {
  asin?: string
  title?: string
  brand?: string
  description?: string
  bullet_points?: string[]
  price?: string | number
  original_price?: string | number
  main_image_url?: string
  additional_image_urls?: string[]
  availability?: string
  rating?: string | number
  ratings_count?: number
  rating_distribution?: Record<string, number | string>
  is_prime?: boolean
  is_best_seller?: boolean
  is_amazon_choice?: boolean
  sales_volume?: string
  category?: { name?: string; path?: string } | string
  variants?: Array<{
    asin?: string
    size?: string
    color?: string
    style?: string
    price?: string | number
    availability?: string
  }>
  frequently_bought_together?: Array<{
    asin?: string
    title?: string
    price?: string | number
    image_url?: string
  }>
  top_reviews?: Array<{
    id?: string
    author?: string
    rating?: number
    title?: string
    text?: string
    date?: string
    verified?: boolean
    helpful_votes?: number
    images?: string[]
  }>
}

interface OmkarSearchResponse {
  results?: Array<{
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
    delivery_info?: string
    sales_volume?: string
    number_of_offers?: number
    lowest_offer_price?: string | number
  }>
  total_results?: number
  page?: number
}

interface OmkarReviewsResponse {
  reviews?: Array<{
    id?: string
    author?: string
    rating?: number
    title?: string
    text?: string
    date?: string
    verified?: boolean
    helpful_votes?: number
    images?: string[]
    is_vine?: boolean
    variant?: string
  }>
  overall_rating?: string | number
  total_reviews?: number
  ratings_breakdown?: Record<string, number | string>
}

async function logUsage(
  endpoint: string,
  params: { asin?: string; query?: string },
  status: string,
  responseMs: number
): Promise<void> {
  try {
    await prisma.apiUsageLog.create({
      data: {
        endpoint,
        asin: params.asin,
        query: params.query,
        status,
        response_ms: responseMs,
      },
    })
  } catch (error) {
    log.error('Failed to log API usage', {
      endpoint,
      error: error instanceof Error ? error.message : 'Unknown',
    })
  }
}

function parsePrice(price: string | number | undefined): number | null {
  if (price === undefined || price === null) return null
  if (typeof price === 'number') return price
  const cleaned = price.replace(/[^0-9.]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

export const omkarApi = {
  getProduct: async (asin: string): Promise<OmkarProductResponse> => {
    const start = Date.now()
    try {
      const res = await client.get('/amazon/product-details', {
        params: { asin, country_code: 'SA' },
      })
      await logUsage('product-details', { asin }, 'success', Date.now() - start)
      return res.data
    } catch (error) {
      await logUsage('product-details', { asin }, 'error', Date.now() - start)
      const axiosError = error as AxiosError
      log.error('omkar.cloud product fetch failed', {
        asin,
        status: axiosError.response?.status,
        message: axiosError.message,
      })
      throw error
    }
  },

  search: async (
    query: string,
    page = 1,
    sortBy = 'relevance'
  ): Promise<OmkarSearchResponse> => {
    const start = Date.now()
    try {
      const res = await client.get('/amazon/search', {
        params: {
          query,
          country_code: 'SA',
          page,
          sort_by: sortBy,
        },
      })
      await logUsage('search', { query }, 'success', Date.now() - start)
      return res.data
    } catch (error) {
      await logUsage('search', { query }, 'error', Date.now() - start)
      const axiosError = error as AxiosError
      log.error('omkar.cloud search failed', {
        query,
        status: axiosError.response?.status,
        message: axiosError.message,
      })
      throw error
    }
  },

  getReviews: async (asin: string): Promise<OmkarReviewsResponse> => {
    const start = Date.now()
    try {
      const res = await client.get('/amazon/product-reviews/top', {
        params: { asin, country_code: 'SA' },
      })
      await logUsage('reviews', { asin }, 'success', Date.now() - start)
      return res.data
    } catch (error) {
      await logUsage('reviews', { asin }, 'error', Date.now() - start)
      const axiosError = error as AxiosError
      log.error('omkar.cloud reviews fetch failed', {
        asin,
        status: axiosError.response?.status,
        message: axiosError.message,
      })
      throw error
    }
  },

  getByCategory: async (categoryId: string, page = 1): Promise<OmkarSearchResponse> => {
    const start = Date.now()
    try {
      const res = await client.get('/amazon/products/category', {
        params: {
          category_id: categoryId,
          country_code: 'SA',
          page,
        },
      })
      await logUsage('category', { query: categoryId }, 'success', Date.now() - start)
      return res.data
    } catch (error) {
      await logUsage('category', { query: categoryId }, 'error', Date.now() - start)
      const axiosError = error as AxiosError
      log.error('omkar.cloud category fetch failed', {
        categoryId,
        status: axiosError.response?.status,
        message: axiosError.message,
      })
      throw error
    }
  },
}

export interface ProductData {
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
  detailed_rating: Record<string, string>
  main_image: string | null
  images: string[]
  category_hierarchy: string | null
  variants: Array<{
    asin: string
    size?: string
    color?: string
    style?: string
    price?: number
    availability?: string
  }>
  all_variants: Record<
    string,
    { size?: string; color?: string; style?: string; price?: number; availability?: string }
  >
  is_prime: boolean
  is_best_seller: boolean
  is_amazon_choice: boolean
  sales_volume: string | null
  frequently_bought_together: Array<{
    asin: string
    title: string
    price: number
    image_url: string
  }>
  top_reviews: Array<{
    review_id: string
    reviewer_name: string
    rating: number
    review_title: string
    review_text: string
    review_date: string
    is_verified_purchase: boolean
    helpful_votes: number
    review_images: string[]
  }>
  country: string
  marketplace: string
  fetched_at: string
}

export function mapOmkarToProductData(raw: OmkarProductResponse, asin: string): ProductData {
  const price = parsePrice(raw.price)
  const originalPrice = parsePrice(raw.original_price)
  let discountPercentage: number | null = null
  if (price !== null && originalPrice !== null && originalPrice > price) {
    discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100)
  }

  const rating =
    raw.rating !== undefined ? parseFloat(String(raw.rating)) || null : null

  const detailedRating: Record<string, string> = {}
  if (raw.rating_distribution) {
    for (const [key, value] of Object.entries(raw.rating_distribution)) {
      detailedRating[key] = String(value)
    }
  }

  const categoryHierarchy =
    typeof raw.category === 'string'
      ? raw.category
      : raw.category?.path || raw.category?.name || null

  const variants =
    raw.variants?.map((v) => ({
      asin: v.asin || '',
      size: v.size,
      color: v.color,
      style: v.style,
      price: parsePrice(v.price) || undefined,
      availability: v.availability,
    })) || []

  const allVariants: Record<string, Record<string, unknown>> = {}
  for (const v of variants) {
    if (v.asin) {
      allVariants[v.asin] = {
        size: v.size,
        color: v.color,
        style: v.style,
        price: v.price,
        availability: v.availability,
      }
    }
  }

  const frequentlyBoughtTogether =
    raw.frequently_bought_together?.map((item) => ({
      asin: item.asin || '',
      title: item.title || '',
      price: parsePrice(item.price) || 0,
      image_url: item.image_url || '',
    })) || []

  const topReviews =
    raw.top_reviews?.map((review) => ({
      review_id: review.id || '',
      reviewer_name: review.author || '',
      rating: review.rating || 0,
      review_title: review.title || '',
      review_text: review.text || '',
      review_date: review.date || '',
      is_verified_purchase: review.verified || false,
      helpful_votes: review.helpful_votes || 0,
      review_images: review.images || [],
    })) || []

  return {
    asin,
    title: raw.title || null,
    brand: raw.brand || null,
    description: raw.description || null,
    key_features: raw.bullet_points || [],
    price,
    original_price: originalPrice,
    discount_percentage: discountPercentage,
    currency: 'SAR',
    availability: raw.availability || null,
    rating,
    ratings_count: raw.ratings_count || null,
    detailed_rating: detailedRating,
    main_image: raw.main_image_url || null,
    images: raw.additional_image_urls || [],
    category_hierarchy: categoryHierarchy,
    variants,
    all_variants: allVariants,
    is_prime: raw.is_prime || false,
    is_best_seller: raw.is_best_seller || false,
    is_amazon_choice: raw.is_amazon_choice || false,
    sales_volume: raw.sales_volume || null,
    frequently_bought_together: frequentlyBoughtTogether,
    top_reviews: topReviews,
    country: 'SA',
    marketplace: 'amazon.sa',
    fetched_at: new Date().toISOString(),
  }
}

export interface SearchProductResult {
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
  delivery_info: string | null
  sales_volume: string | null
  number_of_offers: number | null
  lowest_offer_price: number | null
}

export function mapOmkarSearchResult(
  results: OmkarSearchResponse['results']
): SearchProductResult[] {
  if (!results) return []

  return results.map((item) => {
    const price = parsePrice(item.price)
    const originalPrice = parsePrice(item.original_price)
    let discountPercentage: number | null = null
    if (price !== null && originalPrice !== null && originalPrice > price) {
      discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100)
    }

    return {
      asin: item.asin || '',
      title: item.title || '',
      price,
      original_price: originalPrice,
      discount_percentage: discountPercentage,
      rating: item.rating ? parseFloat(String(item.rating)) : null,
      ratings_count: item.ratings_count || null,
      image_url: item.image_url || '',
      is_prime: item.is_prime || false,
      is_best_seller: item.is_best_seller || false,
      is_amazon_choice: item.is_amazon_choice || false,
      currency: 'SAR',
      delivery_info: item.delivery_info || null,
      sales_volume: item.sales_volume || null,
      number_of_offers: item.number_of_offers || null,
      lowest_offer_price: parsePrice(item.lowest_offer_price),
    }
  })
}

export interface ReviewData {
  review_id: string
  reviewer_name: string
  rating: number
  review_title: string
  review_text: string
  review_date: string
  is_verified_purchase: boolean
  helpful_votes: number
  review_images: string[]
  is_vine_review: boolean
  reviewed_variant: string | null
}

export interface ReviewsResponse {
  asin: string
  overall_rating: number | null
  ratings_breakdown: Record<string, string>
  total_reviews: number
  reviews: ReviewData[]
}

export function mapOmkarReviewsResponse(
  raw: OmkarReviewsResponse,
  asin: string
): ReviewsResponse {
  const ratingsBreakdown: Record<string, string> = {}
  if (raw.ratings_breakdown) {
    for (const [key, value] of Object.entries(raw.ratings_breakdown)) {
      ratingsBreakdown[key] = String(value)
    }
  }

  const reviews: ReviewData[] =
    raw.reviews?.map((review) => ({
      review_id: review.id || '',
      reviewer_name: review.author || '',
      rating: review.rating || 0,
      review_title: review.title || '',
      review_text: review.text || '',
      review_date: review.date || '',
      is_verified_purchase: review.verified || false,
      helpful_votes: review.helpful_votes || 0,
      review_images: review.images || [],
      is_vine_review: review.is_vine || false,
      reviewed_variant: review.variant || null,
    })) || []

  return {
    asin,
    overall_rating: raw.overall_rating
      ? parseFloat(String(raw.overall_rating))
      : null,
    ratings_breakdown: ratingsBreakdown,
    total_reviews: raw.total_reviews || 0,
    reviews,
  }
}