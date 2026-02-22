import { redis, RedisKeys, CacheTTL } from './redis-client'
import { prisma } from '../db/prisma-client'
import { compress, decompress, shouldCompress } from '../utils/compress'
import { log } from '../utils/logger'
import md5 from 'md5'

export interface CacheResult<T> {
  data: T
  cached: boolean
  stale: boolean
  cacheAgeSeconds: number
  source: 'cache' | 'api' | 'database'
}

export interface CacheMetadata {
  cachedAt: number
  ttl: number
  compressed: boolean
}

export async function getCachedOrFetch<T>(
  cacheKey: string,
  ttl: number,
  fetchFn: () => Promise<T>,
  dbSnapshotKey?: string
): Promise<CacheResult<T>> {
  const start = Date.now()

  const cachedData = await redis.get(cacheKey)
  if (cachedData) {
    const parsed = JSON.parse(cachedData) as { data: T; metadata: CacheMetadata }
    const age = Math.floor((Date.now() - parsed.metadata.cachedAt) / 1000)
    log.debug('Cache HIT', { key: cacheKey, age: `${age}s` })
    return {
      data: parsed.data,
      cached: true,
      stale: false,
      cacheAgeSeconds: age,
      source: 'cache',
    }
  }

  const searchCache = await prisma.searchCache.findFirst({
    where: {
      cache_key: dbSnapshotKey || cacheKey,
      expires_at: { gt: new Date() },
    },
    orderBy: { saved_at: 'desc' },
  })

  if (searchCache) {
    const staleTtl = ttl * 2
    const ageSeconds = Math.floor((Date.now() - searchCache.saved_at.getTime()) / 1000)
    if (ageSeconds < staleTtl) {
      log.debug('Stale-while-revalidate: returning DB snapshot', { key: cacheKey })
      triggerBackgroundRefresh(cacheKey, ttl, fetchFn, dbSnapshotKey)
      return {
        data: searchCache.results as T,
        cached: true,
        stale: true,
        cacheAgeSeconds: ageSeconds,
        source: 'database',
      }
    }
  }

  try {
    const freshData = await fetchFn()
    const metadata: CacheMetadata = {
      cachedAt: Date.now(),
      ttl,
      compressed: false,
    }

    const cacheValue = JSON.stringify({ data: freshData, metadata })
    if (shouldCompress(cacheValue)) {
      const compressed = await compress(cacheValue)
      await redis.setex(cacheKey, ttl, compressed.toString('base64'))
      metadata.compressed = true
    } else {
      await redis.setex(cacheKey, ttl, cacheValue)
    }

    if (dbSnapshotKey) {
      await saveDBSnapshot(dbSnapshotKey, freshData, ttl)
    }

    log.debug('Cache MISS - fetched fresh', {
      key: cacheKey,
      duration: `${Date.now() - start}ms`,
    })

    return {
      data: freshData,
      cached: false,
      stale: false,
      cacheAgeSeconds: 0,
      source: 'api',
    }
  } catch (error) {
    if (searchCache) {
      log.warn('Fetch failed, returning stale data', {
        key: cacheKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return {
        data: searchCache.results as T,
        cached: true,
        stale: true,
        cacheAgeSeconds: Math.floor((Date.now() - searchCache.saved_at.getTime()) / 1000),
        source: 'database',
      }
    }
    throw error
  }
}

function triggerBackgroundRefresh<T>(
  cacheKey: string,
  ttl: number,
  fetchFn: () => Promise<T>,
  dbSnapshotKey?: string
): void {
  setImmediate(async () => {
    try {
      const freshData = await fetchFn()
      const metadata: CacheMetadata = {
        cachedAt: Date.now(),
        ttl,
        compressed: false,
      }
      await redis.setex(cacheKey, ttl, JSON.stringify({ data: freshData, metadata }))
      if (dbSnapshotKey) {
        await saveDBSnapshot(dbSnapshotKey, freshData, ttl)
      }
      log.debug('Background refresh complete', { key: cacheKey })
    } catch (error) {
      log.error('Background refresh failed', {
        key: cacheKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  })
}

async function saveDBSnapshot<T>(key: string, data: T, ttl: number): Promise<void> {
  await prisma.searchCache.upsert({
    where: { cache_key: key },
    create: {
      cache_key: key,
      params: {},
      results: data as object,
      expires_at: new Date(Date.now() + ttl * 1000 * 2),
    },
    update: {
      results: data as object,
      saved_at: new Date(),
      expires_at: new Date(Date.now() + ttl * 1000 * 2),
    },
  })
}

export async function invalidateCache(pattern: string): Promise<number> {
  const keys = await redis.keys(pattern)
  if (keys.length === 0) return 0

  await redis.del(...keys)
  log.info('Cache invalidated', { pattern, count: keys.length })
  return keys.length
}

export async function getCacheStats(): Promise<{
  totalKeys: number
  memoryUsage: string
  keysByType: Record<string, number>
}> {
  const dbSize = await redis.dbsize()
  const info = await redis.info('memory')
  const memoryMatch = info.match(/used_memory_human:(\S+)/)
  const memoryUsage = memoryMatch ? memoryMatch[1] : 'unknown'

  const productKeys = await redis.keys('product:*')
  const searchKeys = await redis.keys('search:*')
  const reviewsKeys = await redis.keys('reviews:*')
  const dealsKeys = await redis.keys('deals:*')

  return {
    totalKeys: dbSize,
    memoryUsage,
    keysByType: {
      products: productKeys.length,
      searches: searchKeys.length,
      reviews: reviewsKeys.length,
      deals: dealsKeys.length,
    },
  }
}

export function generateSearchHash(params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&')
  return md5(sorted)
}

export { RedisKeys, CacheTTL }