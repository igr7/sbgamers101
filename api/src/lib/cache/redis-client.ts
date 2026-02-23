import Redis, { RedisOptions } from 'ioredis'
import { log } from '../utils/logger'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  lazyConnect: true,
  connectTimeout: 5000,
  commandTimeout: 3000,
  retryStrategy: (times: number): number | null => {
    if (times > 3) {
      log.error('Redis connection failed after 3 retries')
      return null
    }
    return Math.min(times * 200, 2000)
  },
}

let _redis: Redis | undefined = undefined

function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379'
    _redis = globalForRedis.redis || new Redis(url, redisOptions)
    if (process.env.NODE_ENV !== 'production') {
      globalForRedis.redis = _redis
    }
    _redis.on('connect', () => log.info('Redis connected'))
    _redis.on('error', (err: Error) => log.error('Redis error', { error: err.message }))
    _redis.on('close', () => log.warn('Redis connection closed'))
  }
  return _redis
}

export const redis = new Proxy({} as Redis, {
  get(target, prop) {
    return Reflect.get(getRedis() as unknown as Record<string, unknown>, prop)
  },
}) as Redis

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

export async function safeRedisGet(key: string): Promise<string | null> {
  try {
    return await Promise.race([
      redis.get(key),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ])
  } catch {
    return null
  }
}

export async function safeRedisSetex(key: string, ttl: number, value: string): Promise<void> {
  try {
    await Promise.race([
      redis.setex(key, ttl, value),
      new Promise<void>((resolve) => setTimeout(() => resolve(), 2000)),
    ])
  } catch {
    // silently fail - caching is optional
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
  categories: parseInt(process.env.CACHE_CATEGORIES_TTL || '86400', 10),
} as const
