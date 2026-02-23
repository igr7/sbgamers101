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
    _redis = globalForRedis.redis || new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisOptions)
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

// Safe Redis operations that fail fast (2s timeout) and return null instead of hanging
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ])
}

export async function safeRedisGet(key: string): Promise<string | null> {
  try {
    return await withTimeout(redis.get(key), 2000)
  } catch {
    return null
  }
}

export async function safeRedisSetex(key: string, ttl: number, value: string): Promise<void> {
  try {
    await withTimeout(redis.setex(key, ttl, value), 2000)
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