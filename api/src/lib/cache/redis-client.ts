import Redis, { RedisOptions } from 'ioredis'
import { log } from '../utils/logger'

const globalForRedis = globalThis as unknown as {
  redis: Redis | null
}

const redisOptions: RedisOptions = {
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  lazyConnect: true,
  connectTimeout: 3000,
  commandTimeout: 2000,
  retryStrategy: (): null => null,
}

let _redis: Redis | null = null
let _redisError: Error | null = null

async function getRedis(): Promise<Redis | null> {
  if (_redis) return _redis
  if (_redisError) return null
  
  try {
    const client = globalForRedis.redis || new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisOptions)
    
    await client.ping()
    
    _redis = client
    if (process.env.NODE_ENV !== 'production') {
      globalForRedis.redis = _redis
    }
    _redis.on('error', (err: Error) => log.error('Redis error', { error: err.message }))
    _redis.on('close', () => log.warn('Redis connection closed'))
    log.info('Redis connected')
    return _redis
  } catch (err) {
    log.warn('Redis unavailable, caching disabled', { error: err instanceof Error ? err.message : 'Unknown' })
    _redisError = err as Error
    return null
  }
}

export async function safeRedisGet(key: string): Promise<string | null> {
  try {
    const client = await getRedis()
    if (!client) return null
    
    return await Promise.race([
      client.get(key),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ])
  } catch {
    return null
  }
}

export async function safeRedisSetex(key: string, ttl: number, value: string): Promise<void> {
  try {
    const client = await getRedis()
    if (!client) return
    
    await Promise.race([
      client.setex(key, ttl, value),
      new Promise<void>((resolve) => setTimeout(() => resolve(), 2000)),
    ])
  } catch {
    // silently fail - caching is optional
  }
}

export async function disconnectRedis(): Promise<void> {
  if (_redis) {
    await _redis.quit()
  }
}

export async function checkRedisConnection(): Promise<boolean> {
  const client = await getRedis()
  if (!client) return false
  try {
    const result = await client.ping()
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
  categories: parseInt(process.env.CACHE_CATEGORIES_TTL || '86400', 10),
} as const