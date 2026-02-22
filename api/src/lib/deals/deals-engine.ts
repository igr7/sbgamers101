import { prisma } from '../db/prisma-client'
import { isNearAllTimeLow, getPriceTrend7d } from '../price-history/price-analyzer'
import { log } from '../utils/logger'

export interface DealProduct {
  asin: string
  title: string | null
  main_image: string | null
  price: number | null
  original_price: number | null
  discount_percentage: number | null
  rating: number | null
  ratings_count: number | null
  is_prime: boolean | null
  is_best_seller: boolean | null
  is_amazon_choice: boolean | null
  currency: string
  is_near_all_time_low: boolean
  all_time_low_price: number | null
  price_trend_7d: number | null
}

export interface DealsQueryParams {
  min_discount?: number
  min_rating?: number
  sort?: 'biggest_discount' | 'lowest_price' | 'highest_rating' | 'most_reviewed'
  prime_only?: boolean
  best_seller_only?: boolean
  page?: number
  limit?: number
}

interface ProductFromDB {
  asin: string
  title: string | null
  main_image: string | null
  price: { toNumber(): number } | null
  original_price: { toNumber(): number } | null
  discount_percentage: number | null
  rating: { toNumber(): number } | null
  ratings_count: number | null
  is_prime: boolean | null
  is_best_seller: boolean | null
  is_amazon_choice: boolean | null
}

async function mapProductToDeal(product: ProductFromDB): Promise<DealProduct> {
  const lowInfo = await isNearAllTimeLow(product.asin)
  const trend7d = await getPriceTrend7d(product.asin)

  return {
    asin: product.asin,
    title: product.title,
    main_image: product.main_image,
    price: product.price?.toNumber() || null,
    original_price: product.original_price?.toNumber() || null,
    discount_percentage: product.discount_percentage,
    rating: product.rating?.toNumber() || null,
    ratings_count: product.ratings_count,
    is_prime: product.is_prime,
    is_best_seller: product.is_best_seller,
    is_amazon_choice: product.is_amazon_choice,
    currency: 'SAR',
    is_near_all_time_low: lowInfo.is_near,
    all_time_low_price: lowInfo.all_time_low,
    price_trend_7d: trend7d,
  }
}

export async function getDeals(params: DealsQueryParams): Promise<{
  deals: DealProduct[]
  total_count: number
  page: number
  total_pages: number
  database_building: boolean
}> {
  const {
    min_discount = 10,
    min_rating = 0,
    sort = 'biggest_discount',
    prime_only = false,
    best_seller_only = false,
    page = 1,
    limit = 20,
  } = params

  const safeLimit = Math.min(limit, 50)
  const skip = (page - 1) * safeLimit

  const where: Record<string, unknown> = {
    discount_percentage: { gte: min_discount },
    price: { not: null },
  }

  if (min_rating > 0) {
    where.rating = { gte: min_rating }
  }

  if (prime_only) {
    where.is_prime = true
  }

  if (best_seller_only) {
    where.is_best_seller = true
  }

  let orderBy: Record<string, unknown> = {}
  switch (sort) {
    case 'biggest_discount':
      orderBy = { discount_percentage: 'desc' }
      break
    case 'lowest_price':
      orderBy = { price: 'asc' }
      break
    case 'highest_rating':
      orderBy = { rating: 'desc' }
      break
    case 'most_reviewed':
      orderBy = { ratings_count: 'desc' }
      break
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: safeLimit,
    }),
    prisma.product.count({ where }),
  ])

  const deals: DealProduct[] = await Promise.all(
    products.map((product) => mapProductToDeal(product as unknown as ProductFromDB))
  )

  const totalPages = Math.ceil(totalCount / safeLimit)

  return {
    deals,
    total_count: totalCount,
    page,
    total_pages: totalPages,
    database_building: totalCount === 0,
  }
}

export interface ProductsQueryParams {
  sort?:
    | 'price_asc'
    | 'price_desc'
    | 'rating_desc'
    | 'discount_desc'
    | 'newest'
    | 'most_reviewed'
    | 'most_popular'
  min_price?: number
  max_price?: number
  min_rating?: number
  min_discount?: number
  prime_only?: boolean
  best_seller_only?: boolean
  amazon_choice_only?: boolean
  brand?: string
  page?: number
  limit?: number
}

export async function getProducts(params: ProductsQueryParams): Promise<{
  products: DealProduct[]
  total_count: number
  page: number
  total_pages: number
  filters_applied: Record<string, unknown>
}> {
  const {
    sort = 'most_popular',
    min_price,
    max_price,
    min_rating,
    min_discount,
    prime_only = false,
    best_seller_only = false,
    amazon_choice_only = false,
    brand,
    page = 1,
    limit = 20,
  } = params

  const safeLimit = Math.min(limit, 100)
  const skip = (page - 1) * safeLimit

  interface PriceFilter {
    not: null
    gte?: number
    lte?: number
  }

  const priceFilter: PriceFilter = { not: null }
  if (min_price !== undefined) {
    priceFilter.gte = min_price
  }
  if (max_price !== undefined) {
    priceFilter.lte = max_price
  }

  const where: Record<string, unknown> = {
    price: priceFilter,
  }

  if (min_rating !== undefined) {
    where.rating = { gte: min_rating }
  }

  if (min_discount !== undefined) {
    where.discount_percentage = { gte: min_discount }
  }

  if (prime_only) {
    where.is_prime = true
  }

  if (best_seller_only) {
    where.is_best_seller = true
  }

  if (amazon_choice_only) {
    where.is_amazon_choice = true
  }

  if (brand) {
    where.brand = { contains: brand, mode: 'insensitive' }
  }

  let orderBy: Record<string, unknown> = {}
  switch (sort) {
    case 'price_asc':
      orderBy = { price: 'asc' }
      break
    case 'price_desc':
      orderBy = { price: 'desc' }
      break
    case 'rating_desc':
      orderBy = { rating: 'desc' }
      break
    case 'discount_desc':
      orderBy = { discount_percentage: 'desc' }
      break
    case 'newest':
      orderBy = { created_at: 'desc' }
      break
    case 'most_reviewed':
      orderBy = { ratings_count: 'desc' }
      break
    case 'most_popular':
      orderBy = { request_count: 'desc' }
      break
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: safeLimit,
    }),
    prisma.product.count({ where }),
  ])

  const mappedProducts: DealProduct[] = await Promise.all(
    products.map((product) => mapProductToDeal(product as unknown as ProductFromDB))
  )

  const filtersApplied: Record<string, unknown> = { sort }
  if (min_price !== undefined) filtersApplied.min_price = min_price
  if (max_price !== undefined) filtersApplied.max_price = max_price
  if (min_rating !== undefined) filtersApplied.min_rating = min_rating
  if (min_discount !== undefined) filtersApplied.min_discount = min_discount
  if (prime_only) filtersApplied.prime_only = true
  if (best_seller_only) filtersApplied.best_seller_only = true
  if (amazon_choice_only) filtersApplied.amazon_choice_only = true
  if (brand) filtersApplied.brand = brand

  const totalPages = Math.ceil(totalCount / safeLimit)

  return {
    products: mappedProducts,
    total_count: totalCount,
    page,
    total_pages: totalPages,
    filters_applied: filtersApplied,
  }
}