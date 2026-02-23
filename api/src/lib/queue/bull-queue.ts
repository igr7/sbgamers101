import Bull, { Job } from 'bull'
import { log } from '../utils/logger'

export interface PriceSnapshotJobData {
  type: 'price-snapshot'
}

export interface PopularRefreshJobData {
  type: 'popular-refresh'
}

export interface CacheWarmerJobData {
  type: 'cache-warmer'
}

export interface UsageMonitorJobData {
  type: 'usage-monitor'
}

export type JobData =
  | PriceSnapshotJobData
  | PopularRefreshJobData
  | CacheWarmerJobData
  | UsageMonitorJobData

function getRedisConfig() {
  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
  try {
    const url = new URL(REDIS_URL)
    return {
      host: url.hostname || 'localhost',
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
    }
  } catch {
    return {
      host: 'localhost',
      port: 6379,
    }
  }
}

let _priceSnapshotQueue: Bull.Queue<PriceSnapshotJobData> | null = null
let _popularRefreshQueue: Bull.Queue<PopularRefreshJobData> | null = null
let _cacheWarmerQueue: Bull.Queue<CacheWarmerJobData> | null = null
let _usageMonitorQueue: Bull.Queue<UsageMonitorJobData> | null = null

function createQueue<T>(name: string, defaultJobOptions: Bull.QueueOptions['defaultJobOptions'] = {}): Bull.Queue<T> {
  const redisConfig = getRedisConfig()
  return new Bull<T>(name, {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 10,
      removeOnFail: 5,
      attempts: 3,
      ...defaultJobOptions,
    },
  })
}

export function getPriceSnapshotQueue(): Bull.Queue<PriceSnapshotJobData> {
  if (!_priceSnapshotQueue) {
    _priceSnapshotQueue = createQueue<PriceSnapshotJobData>('price-snapshot', {
      backoff: { type: 'exponential', delay: 5000 },
    })
    _priceSnapshotQueue.on('completed', (job: Job<PriceSnapshotJobData>) => {
      log.debug('Price snapshot job completed', { jobId: job.id })
    })
    _priceSnapshotQueue.on('failed', (job: Job<PriceSnapshotJobData> | undefined, err: Error) => {
      log.error('Price snapshot job failed', { jobId: job?.id, error: err.message })
    })
  }
  return _priceSnapshotQueue
}

export function getPopularRefreshQueue(): Bull.Queue<PopularRefreshJobData> {
  if (!_popularRefreshQueue) {
    _popularRefreshQueue = createQueue<PopularRefreshJobData>('popular-refresh', {
      backoff: { type: 'exponential', delay: 5000 },
    })
    _popularRefreshQueue.on('completed', (job: Job<PopularRefreshJobData>) => {
      log.debug('Popular refresh job completed', { jobId: job.id })
    })
    _popularRefreshQueue.on('failed', (job: Job<PopularRefreshJobData> | undefined, err: Error) => {
      log.error('Popular refresh job failed', { jobId: job?.id, error: err.message })
    })
  }
  return _popularRefreshQueue
}

export function getCacheWarmerQueue(): Bull.Queue<CacheWarmerJobData> {
  if (!_cacheWarmerQueue) {
    _cacheWarmerQueue = createQueue<CacheWarmerJobData>('cache-warmer')
    _cacheWarmerQueue.on('completed', (job: Job<CacheWarmerJobData>) => {
      log.debug('Cache warmer job completed', { jobId: job.id })
    })
    _cacheWarmerQueue.on('failed', (job: Job<CacheWarmerJobData> | undefined, err: Error) => {
      log.error('Cache warmer job failed', { jobId: job?.id, error: err.message })
    })
  }
  return _cacheWarmerQueue
}

export function getUsageMonitorQueue(): Bull.Queue<UsageMonitorJobData> {
  if (!_usageMonitorQueue) {
    _usageMonitorQueue = createQueue<UsageMonitorJobData>('usage-monitor')
    _usageMonitorQueue.on('completed', (job: Job<UsageMonitorJobData>) => {
      log.debug('Usage monitor job completed', { jobId: job.id })
    })
    _usageMonitorQueue.on('failed', (job: Job<UsageMonitorJobData> | undefined, err: Error) => {
      log.error('Usage monitor job failed', { jobId: job?.id, error: err.message })
    })
  }
  return _usageMonitorQueue
}

export const priceSnapshotQueue = new Proxy({} as Bull.Queue<PriceSnapshotJobData>, {
  get(target, prop) {
    return Reflect.get(getPriceSnapshotQueue() as unknown as Record<string, unknown>, prop)
  },
})

export const popularRefreshQueue = new Proxy({} as Bull.Queue<PopularRefreshJobData>, {
  get(target, prop) {
    return Reflect.get(getPopularRefreshQueue() as unknown as Record<string, unknown>, prop)
  },
})

export const cacheWarmerQueue = new Proxy({} as Bull.Queue<CacheWarmerJobData>, {
  get(target, prop) {
    return Reflect.get(getCacheWarmerQueue() as unknown as Record<string, unknown>, prop)
  },
})

export const usageMonitorQueue = new Proxy({} as Bull.Queue<UsageMonitorJobData>, {
  get(target, prop) {
    return Reflect.get(getUsageMonitorQueue() as unknown as Record<string, unknown>, prop)
  },
})

export async function scheduleRecurringJobs(): Promise<void> {
  const snapshotIntervalHours = parseInt(process.env.PRICE_SNAPSHOT_INTERVAL_HOURS || '1', 10)

  const existingSnapshot = await priceSnapshotQueue.getRepeatableJobs()
  if (existingSnapshot.length === 0) {
    await priceSnapshotQueue.add(
      { type: 'price-snapshot' },
      { repeat: { every: snapshotIntervalHours * 60 * 60 * 1000 }, jobId: 'recurring-price-snapshot' }
    )
    log.info('Scheduled price snapshot job', { interval: `${snapshotIntervalHours}h` })
  }

  const existingPopular = await popularRefreshQueue.getRepeatableJobs()
  if (existingPopular.length === 0) {
    await popularRefreshQueue.add(
      { type: 'popular-refresh' },
      { repeat: { every: 6 * 60 * 60 * 1000 }, jobId: 'recurring-popular-refresh' }
    )
    log.info('Scheduled popular refresh job', { interval: '6h' })
  }

  const existingWarmer = await cacheWarmerQueue.getRepeatableJobs()
  if (existingWarmer.length === 0) {
    await cacheWarmerQueue.add(
      { type: 'cache-warmer' },
      { repeat: { every: 12 * 60 * 60 * 1000 }, jobId: 'recurring-cache-warmer' }
    )
    log.info('Scheduled cache warmer job', { interval: '12h' })
  }

  const existingMonitor = await usageMonitorQueue.getRepeatableJobs()
  if (existingMonitor.length === 0) {
    await usageMonitorQueue.add(
      { type: 'usage-monitor' },
      { repeat: { every: 24 * 60 * 60 * 1000 }, jobId: 'recurring-usage-monitor' }
    )
    log.info('Scheduled usage monitor job', { interval: '24h' })
  }
}

export async function closeQueues(): Promise<void> {
  await Promise.all([
    _priceSnapshotQueue?.close(),
    _popularRefreshQueue?.close(),
    _cacheWarmerQueue?.close(),
    _usageMonitorQueue?.close(),
  ].filter(Boolean))
  log.info('All queues closed')
}

export async function getQueueStats(): Promise<{
  price_snapshot: { waiting: number; active: number; failed: number }
  popular_refresh: { waiting: number; active: number; failed: number }
  cache_warmer: { waiting: number; active: number; failed: number }
  usage_monitor: { waiting: number; active: number; failed: number }
}> {
  const [snapshot, popular, warmer, monitor] = await Promise.all([
    Promise.all([
      priceSnapshotQueue.getWaitingCount(),
      priceSnapshotQueue.getActiveCount(),
      priceSnapshotQueue.getFailedCount(),
    ]),
    Promise.all([
      popularRefreshQueue.getWaitingCount(),
      popularRefreshQueue.getActiveCount(),
      popularRefreshQueue.getFailedCount(),
    ]),
    Promise.all([
      cacheWarmerQueue.getWaitingCount(),
      cacheWarmerQueue.getActiveCount(),
      cacheWarmerQueue.getFailedCount(),
    ]),
    Promise.all([
      usageMonitorQueue.getWaitingCount(),
      usageMonitorQueue.getActiveCount(),
      usageMonitorQueue.getFailedCount(),
    ]),
  ])

  return {
    price_snapshot: { waiting: snapshot[0], active: snapshot[1], failed: snapshot[2] },
    popular_refresh: { waiting: popular[0], active: popular[1], failed: popular[2] },
    cache_warmer: { waiting: warmer[0], active: warmer[1], failed: warmer[2] },
    usage_monitor: { waiting: monitor[0], active: monitor[1], failed: monitor[2] },
  }
}
