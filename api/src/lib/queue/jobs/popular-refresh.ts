import { Job } from 'bull'
import { prisma } from '../../db/prisma-client'
import { omkarApi, mapOmkarToProductData } from '../../omkar/omkar-client'
import { redis, RedisKeys, CacheTTL } from '../../cache/redis-client'
import { log } from '../../utils/logger'

interface PopularRefreshResult {
  asin: string
  success: boolean
  error?: string
}

export default async function processPopularRefresh(
  job: Job
): Promise<PopularRefreshResult[]> {
  log.info('Starting popular products refresh job', { jobId: job.id })

  const popularProducts = await prisma.product.findMany({
    take: 50,
    orderBy: { request_count: 'desc' },
    select: { asin: true, title: true },
  })

  if (popularProducts.length === 0) {
    log.info('No popular products found for refresh')
    return []
  }

  const results: PopularRefreshResult[] = []

  for (const product of popularProducts) {
    try {
      const raw = await omkarApi.getProduct(product.asin)
      const productData = mapOmkarToProductData(raw, product.asin)

      await prisma.product.update({
        where: { asin: product.asin },
        data: {
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
          sales_volume: productData.sales_volume,
          raw_data: raw as object,
          last_fetched_at: new Date(),
        },
      })

      await prisma.priceHistory.create({
        data: {
          asin: product.asin,
          price: productData.price,
          original_price: productData.original_price,
          discount_percentage: productData.discount_percentage,
          availability: productData.availability || undefined,
          is_prime: productData.is_prime,
        },
      })

      await redis.setex(
        RedisKeys.productFull(product.asin),
        CacheTTL.product,
        JSON.stringify({
          data: productData,
          metadata: { cachedAt: Date.now(), ttl: CacheTTL.product, compressed: false },
        })
      )

      results.push({ asin: product.asin, success: true })
      log.debug('Refreshed popular product', { asin: product.asin })

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      log.error('Failed to refresh popular product', {
        asin: product.asin,
        error: error instanceof Error ? error.message : 'Unknown',
      })
      results.push({
        asin: product.asin,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }
  }

  log.info('Popular refresh job completed', {
    processed: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  })

  return results
}