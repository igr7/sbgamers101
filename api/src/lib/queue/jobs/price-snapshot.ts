import { Job } from 'bull'
import { prisma } from '../../db/prisma-client'
import { omkarApi, mapOmkarToProductData } from '../../omkar/omkar-client'
import { redis, RedisKeys, CacheTTL } from '../../cache/redis-client'
import { log } from '../../utils/logger'

const MAX_TRACKED_PRODUCTS = parseInt(process.env.MAX_TRACKED_PRODUCTS || '100', 10)
const MAX_PRODUCTS_PER_HOUR = 50

interface PriceSnapshotResult {
  asin: string
  success: boolean
  price: number | null
  previousPrice: number | null
  priceDrop: number | null
  error?: string
}

export default async function processPriceSnapshot(
  job: Job
): Promise<PriceSnapshotResult[]> {
  log.info('Starting price snapshot job', { jobId: job.id })

  const trackedProducts = await prisma.trackedProduct.findMany({
    where: { is_active: true },
    take: MAX_PRODUCTS_PER_HOUR,
    orderBy: { last_fetched_at: 'asc' },
  })

  if (trackedProducts.length === 0) {
    log.info('No tracked products found for price snapshot')
    return []
  }

  const results: PriceSnapshotResult[] = []

  for (const tracked of trackedProducts) {
    try {
      const raw = await omkarApi.getProduct(tracked.asin)
      const productData = mapOmkarToProductData(raw, tracked.asin)

      const lastSnapshot = await prisma.priceHistory.findFirst({
        where: { asin: tracked.asin },
        orderBy: { recorded_at: 'desc' },
      })

      const currentPrice = productData.price
      const previousPrice = lastSnapshot?.price?.toNumber() || null

      let priceDrop: number | null = null
      if (currentPrice !== null && previousPrice !== null && previousPrice > currentPrice) {
        priceDrop = Math.round(((previousPrice - currentPrice) / previousPrice) * 100)
      }

      await prisma.priceHistory.create({
        data: {
          asin: tracked.asin,
          price: productData.price,
          original_price: productData.original_price,
          discount_percentage: productData.discount_percentage,
          availability: productData.availability || undefined,
          is_prime: productData.is_prime,
        },
      })

      await prisma.product.upsert({
        where: { asin: tracked.asin },
        create: {
          asin: tracked.asin,
          title: productData.title,
          brand: productData.brand,
          price: productData.price,
          original_price: productData.original_price,
          discount_percentage: productData.discount_percentage,
          rating: productData.rating,
          ratings_count: productData.ratings_count,
          main_image: productData.main_image,
          availability: productData.availability,
          is_prime: productData.is_prime,
          is_best_seller: productData.is_best_seller,
          is_amazon_choice: productData.is_amazon_choice,
          raw_data: raw as object,
          last_fetched_at: new Date(),
        },
        update: {
          price: productData.price,
          original_price: productData.original_price,
          discount_percentage: productData.discount_percentage,
          availability: productData.availability,
          is_prime: productData.is_prime,
          last_fetched_at: new Date(),
        },
      })

      await prisma.trackedProduct.update({
        where: { asin: tracked.asin },
        data: {
          last_fetched_at: new Date(),
          fetch_count: { increment: 1 },
        },
      })

      if (productData) {
        await redis.setex(
          RedisKeys.productFull(tracked.asin),
          CacheTTL.product,
          JSON.stringify({
            data: productData,
            metadata: { cachedAt: Date.now(), ttl: CacheTTL.product, compressed: false },
          })
        )
      }

      if (priceDrop !== null && priceDrop >= 10) {
        log.warn('Significant price drop detected', {
          asin: tracked.asin,
          previousPrice,
          currentPrice,
          dropPercentage: `${priceDrop}%`,
        })

        if (process.env.ALERT_WEBHOOK_URL) {
          try {
            await fetch(process.env.ALERT_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                alert: 'price_drop',
                asin: tracked.asin,
                title: productData.title,
                previousPrice,
                currentPrice,
                dropPercentage: priceDrop,
              }),
            })
          } catch (webhookError) {
            log.error('Failed to send price drop alert', {
              error: webhookError instanceof Error ? webhookError.message : 'Unknown',
            })
          }
        }
      }

      results.push({
        asin: tracked.asin,
        success: true,
        price: currentPrice,
        previousPrice,
        priceDrop,
      })

      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      log.error('Failed to process tracked product', {
        asin: tracked.asin,
        error: error instanceof Error ? error.message : 'Unknown',
      })
      results.push({
        asin: tracked.asin,
        success: false,
        price: null,
        previousPrice: null,
        priceDrop: null,
        error: error instanceof Error ? error.message : 'Unknown',
      })
    }
  }

  log.info('Price snapshot job completed', {
    processed: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  })

  return results
}