import { redis, RedisKeys, CacheTTL } from './redis-client'
import { prisma } from '../db/prisma-client'
import { log } from '../utils/logger'

export async function warmCache(): Promise<void> {
  log.info('Starting cache warm...')

  const popularProducts = await prisma.product.findMany({
    take: 50,
    orderBy: { request_count: 'desc' },
    where: { last_fetched_at: { not: null } },
  })

  for (const product of popularProducts) {
    if (product.raw_data) {
      const cacheKey = RedisKeys.productFull(product.asin)
      const exists = await redis.exists(cacheKey)
      if (!exists) {
        await redis.setex(
          cacheKey,
          CacheTTL.product,
          JSON.stringify({
            data: product.raw_data,
            metadata: { cachedAt: Date.now(), ttl: CacheTTL.product, compressed: false },
          })
        )
        log.debug('Warmed product cache', { asin: product.asin })
      }
    }
  }

  const topDeals = await prisma.product.findMany({
    take: 20,
    where: {
      discount_percentage: { gte: 10 },
      price: { not: null },
    },
    orderBy: { discount_percentage: 'desc' },
  })

  if (topDeals.length > 0) {
    const dealsKey = RedisKeys.deals('top20')
    await redis.setex(
      dealsKey,
      CacheTTL.deals,
      JSON.stringify({
        data: topDeals.map((p) => ({
          asin: p.asin,
          title: p.title,
          main_image: p.main_image,
          price: p.price?.toString(),
          original_price: p.original_price?.toString(),
          discount_percentage: p.discount_percentage,
          rating: p.rating?.toString(),
          ratings_count: p.ratings_count,
          is_prime: p.is_prime,
          is_best_seller: p.is_best_seller,
          is_amazon_choice: p.is_amazon_choice,
          currency: 'SAR',
        })),
        metadata: { cachedAt: Date.now(), ttl: CacheTTL.deals, compressed: false },
      })
    )
    log.info('Warmed deals cache', { count: topDeals.length })
  }

  log.info('Cache warm complete', { products: popularProducts.length })
}

export async function warmOnStartup(): Promise<void> {
  try {
    await warmCache()
  } catch (error) {
    log.error('Cache warm failed', { error: error instanceof Error ? error.message : 'Unknown' })
  }
}