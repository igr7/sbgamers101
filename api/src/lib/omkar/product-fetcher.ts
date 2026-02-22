import { prisma } from '../db/prisma-client'
import { omkarApi, mapOmkarToProductData, ProductData } from './omkar-client'
import { log } from '../utils/logger'

export async function fetchAndSaveProduct(asin: string): Promise<ProductData | null> {
  try {
    const raw = await omkarApi.getProduct(asin)
    const productData = mapOmkarToProductData(raw, asin)

    await prisma.product.upsert({
      where: { asin },
      create: {
        asin,
        title: productData.title,
        brand: productData.brand,
        description: productData.description,
        price: productData.price,
        original_price: productData.original_price,
        discount_percentage: productData.discount_percentage,
        rating: productData.rating,
        ratings_count: productData.ratings_count,
        main_image: productData.main_image,
        images: productData.images,
        availability: productData.availability,
        is_prime: productData.is_prime,
        is_best_seller: productData.is_best_seller,
        is_amazon_choice: productData.is_amazon_choice,
        category: productData.category_hierarchy,
        sales_volume: productData.sales_volume,
        variants: productData.variants,
        raw_data: raw as object,
        request_count: 1,
        last_fetched_at: new Date(),
      },
      update: {
        title: productData.title,
        brand: productData.brand,
        description: productData.description,
        price: productData.price,
        original_price: productData.original_price,
        discount_percentage: productData.discount_percentage,
        rating: productData.rating,
        ratings_count: productData.ratings_count,
        main_image: productData.main_image,
        images: productData.images,
        availability: productData.availability,
        is_prime: productData.is_prime,
        is_best_seller: productData.is_best_seller,
        is_amazon_choice: productData.is_amazon_choice,
        category: productData.category_hierarchy,
        sales_volume: productData.sales_volume,
        variants: productData.variants,
        raw_data: raw as object,
        request_count: { increment: 1 },
        last_fetched_at: new Date(),
      },
    })

    await savePriceSnapshot(asin, productData)

    log.info('Product fetched and saved', { asin, title: productData.title?.slice(0, 50) })
    return productData
  } catch (error) {
    log.error('Failed to fetch product', {
      asin,
      error: error instanceof Error ? error.message : 'Unknown',
    })
    return null
  }
}

export async function savePriceSnapshot(
  asin: string,
  productData: ProductData
): Promise<void> {
  await prisma.priceHistory.create({
    data: {
      asin,
      price: productData.price,
      original_price: productData.original_price,
      discount_percentage: productData.discount_percentage,
      availability: productData.availability || undefined,
      is_prime: productData.is_prime,
    },
  })
}

export async function getStoredProduct(asin: string): Promise<ProductData | null> {
  const product = await prisma.product.findUnique({
    where: { asin },
  })

  if (!product) return null

  return {
    asin: product.asin,
    title: product.title,
    brand: product.brand,
    description: product.description,
    key_features: (product.raw_data as { bullet_points?: string[] })?.bullet_points || [],
    price: product.price?.toNumber() || null,
    original_price: product.original_price?.toNumber() || null,
    discount_percentage: product.discount_percentage,
    currency: 'SAR',
    availability: product.availability,
    rating: product.rating?.toNumber() || null,
    ratings_count: product.ratings_count,
    detailed_rating:
      (product.raw_data as { rating_distribution?: Record<string, string> })
        ?.rating_distribution || {},
    main_image: product.main_image,
    images: (product.images as string[]) || [],
    category_hierarchy: product.category,
    variants: (product.variants as ProductData['variants']) || [],
    all_variants: {},
    is_prime: product.is_prime || false,
    is_best_seller: product.is_best_seller || false,
    is_amazon_choice: product.is_amazon_choice || false,
    sales_volume: product.sales_volume,
    frequently_bought_together: [],
    top_reviews: [],
    country: 'SA',
    marketplace: 'amazon.sa',
    fetched_at: product.last_fetched_at?.toISOString() || new Date().toISOString(),
  }
}