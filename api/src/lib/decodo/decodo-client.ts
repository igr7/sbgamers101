import axios, { AxiosError } from 'axios'
import { log } from '../utils/logger'

const DECODO_API_URL = 'https://scraper-api.decodo.com/v2/scrape'
const DECODO_API_KEY = process.env.DECODO_API_KEY || ''

const client = axios.create({
  baseURL: DECODO_API_URL,
  headers: {
    'Authorization': `Basic ${DECODO_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 60000,
})

async function decodoRequest<T>(payload: Record<string, unknown>): Promise<T> {
  const start = Date.now()
  try {
    const res = await client.post('', payload)
    log.debug('Decodo API success', { 
      target: payload.target, 
      query: payload.query,
      duration: `${Date.now() - start}ms` 
    })
    return res.data
  } catch (error) {
    const axiosError = error as AxiosError
    log.error('Decodo API error', {
      target: payload.target,
      query: payload.query,
      status: axiosError.response?.status,
      message: axiosError.message,
    })
    throw error
  }
}

export interface DecodoProductResult {
  asin: string
  title: string
  brand?: string
  description?: string
  bullet_points?: string[]
  price?: number
  price_strikethrough?: number
  currency?: string
  availability?: string
  rating?: number
  ratings_total?: number
  main_image?: string
  images?: string[]
  category?: string
  category_path?: string[]
  is_prime?: boolean
  is_best_seller?: boolean
  is_amazon_choice?: boolean
  url: string
  variants?: Array<{
    asin: string
    price?: number
    availability?: string
    attributes?: Record<string, string>
  }>
  frequently_bought_together?: Array<{
    asin: string
    title: string
    price?: number
    image?: string
  }>
  top_reviews?: Array<{
    id: string
    author: string
    rating: number
    title: string
    body: string
    date: string
    verified: boolean
    helpful_votes?: number
  }>
}

export interface DecodoSearchResult {
  asin: string
  title: string
  price?: number
  price_strikethrough?: number
  currency?: string
  rating?: number
  ratings_total?: number
  image?: string
  url: string
  is_prime?: boolean
  is_best_seller?: boolean
  is_amazon_choice?: boolean
  delivery?: string
  position?: number
}

export interface DecodoSearchResponse {
  results: {
    url: string
    page: number
    query: string
    results: {
      organic: DecodoSearchResult[]
      paid?: DecodoSearchResult[]
    }
  }
}

export interface DecodoProductResponse {
  results: Array<{
    content: {
      results: DecodoProductResult
    }
  }>
}

export interface DecodoPricingResult {
  asin: string
  pricing: Array<{
    price: number
    currency: string
    timestamp?: string
    seller?: string
  }>
}

export interface DecodoPricingResponse {
  results: Array<{
    content: {
      results: {
        pricing: Array<{
          price: number
          currency: string
          timestamp?: string
          seller?: string
        }>
      }
    }
  }>
}

export const decodoApi = {
  search: async (query: string, page = 1, domain = 'sa'): Promise<DecodoSearchResponse> => {
    return decodoRequest<DecodoSearchResponse>({
      target: 'amazon_search',
      query,
      domain,
      page_from: page,
      parse: true,
    })
  },

  getProduct: async (asin: string, domain = 'sa'): Promise<DecodoProductResult> => {
    const response = await decodoRequest<DecodoProductResponse>({
      target: 'amazon_product',
      query: asin,
      domain,
      parse: true,
      autoselect_variant: false,
    })
    return response.results?.[0]?.content?.results || null
  },

  getPricing: async (asin: string, domain = 'sa'): Promise<DecodoPricingResult> => {
    const response = await decodoRequest<DecodoPricingResponse>({
      target: 'amazon_pricing',
      query: asin,
      domain,
      parse: true,
    })
    const pricingData = response.results?.[0]?.content?.results
    return {
      asin,
      pricing: pricingData?.pricing || [],
    }
  },

  getBestSellers: async (categoryId: string, page = 1, domain = 'sa'): Promise<DecodoSearchResult[]> => {
    const response = await decodoRequest<{ results: DecodoSearchResult[] }>({
      target: 'amazon_bestsellers',
      query: categoryId,
      domain,
      page_from: page,
      parse: true,
    })
    return response.results || []
  },
}

export function mapDecodoProduct(product: DecodoProductResult) {
  let discountPercentage: number | null = null
  if (product.price && product.price_strikethrough && product.price_strikethrough > product.price) {
    discountPercentage = Math.round(((product.price_strikethrough - product.price) / product.price_strikethrough) * 100)
  }

  return {
    asin: product.asin,
    title: product.title || '',
    brand: product.brand || null,
    description: product.description || null,
    key_features: product.bullet_points || [],
    price: product.price || null,
    original_price: product.price_strikethrough || null,
    discount_percentage: discountPercentage,
    currency: product.currency || 'SAR',
    availability: product.availability || null,
    rating: product.rating || null,
    ratings_count: product.ratings_total || null,
    main_image: product.main_image || null,
    images: product.images || [],
    category: product.category || null,
    category_hierarchy: product.category_path?.join(' > ') || null,
    is_prime: product.is_prime || false,
    is_best_seller: product.is_best_seller || false,
    is_amazon_choice: product.is_amazon_choice || false,
    amazon_url: product.url || `https://www.amazon.sa/dp/${product.asin}`,
    variants: (product.variants || []).map((v) => ({
      asin: v.asin,
      price: v.price || undefined,
      availability: v.availability || undefined,
      attributes: v.attributes || {},
    })),
    frequently_bought_together: (product.frequently_bought_together || []).map((item) => ({
      asin: item.asin,
      title: item.title || '',
      price: item.price || 0,
      image_url: item.image || '',
    })),
    top_reviews: (product.top_reviews || []).map((review) => ({
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
}

export function mapDecodoSearchResult(result: DecodoSearchResult) {
  let discountPercentage: number | null = null
  if (result.price && result.price_strikethrough && result.price_strikethrough > result.price) {
    discountPercentage = Math.round(((result.price_strikethrough - result.price) / result.price_strikethrough) * 100)
  }

  return {
    asin: result.asin,
    title: result.title || '',
    price: result.price || null,
    original_price: result.price_strikethrough || null,
    discount_percentage: discountPercentage,
    rating: result.rating || null,
    ratings_count: result.ratings_total || null,
    image_url: result.image || '',
    is_prime: result.is_prime || false,
    is_best_seller: result.is_best_seller || false,
    is_amazon_choice: result.is_amazon_choice || false,
    currency: result.currency || 'SAR',
    amazon_url: result.url || `https://www.amazon.sa/dp/${result.asin}`,
    delivery: result.delivery || null,
    position: result.position || null,
  }
}

export const AMAZON_SA_CATEGORIES = {
  gpu: { id: '13896617031', name_en: 'Graphics Cards', name_ar: 'كرت الشاشة' },
  cpu: { id: '13896616031', name_en: 'Processors', name_ar: 'المعالجات' },
  monitor: { id: '13896615031', name_en: 'Monitors', name_ar: 'الشاشات' },
  keyboard: { id: '13896611031', name_en: 'Keyboards', name_ar: 'لوحات المفاتيح' },
  mouse: { id: '13896610031', name_en: 'Mice', name_ar: 'الفأرة' },
  headset: { id: '13896613031', name_en: 'Headsets', name_ar: 'سماعات الرأس' },
  ram: { id: '13896619031', name_en: 'Memory', name_ar: 'الذاكرة' },
  motherboard: { id: '13896618031', name_en: 'Motherboards', name_ar: 'لوحات الأم' },
  psu: { id: '13896620031', name_en: 'Power Supplies', name_ar: 'مزود الطاقة' },
  case: { id: '13896621031', name_en: 'PC Cases', name_ar: 'صناديق الحاسوب' },
  cooling: { id: '13896622031', name_en: 'Cooling', name_ar: 'التبريد' },
  chair: { id: '13896591031', name_en: 'Gaming Chairs', name_ar: 'كراسي الألعاب' },
  laptop: { id: '13896603031', name_en: 'Gaming Laptops', name_ar: 'أجهزة لابتوب للألعاب' },
  speaker: { id: '13896614031', name_en: 'Speakers', name_ar: 'مكبرات الصوت' },
  controller: { id: '13896596031', name_en: 'Controllers', name_ar: 'وحدات التحكم' },
}