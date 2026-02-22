import Redis, { RedisOptions } from 'ioredis'
import { log } from '../utils/logger'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
  retryStrategy: (times: number): number | null => {
    if (times > 10) {
      log.error('Redis connection failed after 10 retries')
      return null
    }
    return Math.min(times * 100, 3000)
  },
}

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisOptions)

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

redis.on('connect', () => log.info('Redis connected'))
redis.on('error', (err: Error) => log.error('Redis error', { error: err.message }))
redis.on('close', () => log.warn('Redis connection closed'))

export async function disconnectRedis(): Promise<void> {
  await redis.quit()
}

export async function checkRedisConnection(): Promise<boolean> {
  try {
    const result = await redis.ping()
    return result === 'PONG'
  } catch {
    return false
  }
}

export const RedisKeys = {
  productFull: (asin: string): string => `product:${asin}:full`,
  productPrice: (asin: string): string => `product:${asin}:price`,
  search: (hash: string): string => `search:${hash}`,
  reviews: (asin: string): string => `reviews:${asin}`,
  deals: (hash: string): string => `deals:${hash}`,
  products: (hash: string): string => `products:${hash}`,
} as const

export const CacheTTL = {
  product: parseInt(process.env.CACHE_PRODUCT_TTL || '21600', 10),
  price: parseInt(process.env.CACHE_PRICE_TTL || '3600', 10),
  search: parseInt(process.env.CACHE_SEARCH_TTL || '1800', 10),
  deals: parseInt(process.env.CACHE_DEALS_TTL || '900', 10),
  reviews: parseInt(process.env.CACHE_REVIEWS_TTL || '86400', 10),
} as const