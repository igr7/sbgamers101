import Bull, { Job } from 'bull'
import { log } from '../utils/logger'

export interface PriceUpdateJobData {
  type: 'price-update'
  asins?: string[]
}

export type JobData = PriceUpdateJobData

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

let _priceUpdateQueue: Bull.Queue<PriceUpdateJobData> | null = null

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

export function getPriceUpdateQueue(): Bull.Queue<PriceUpdateJobData> {
  if (!_priceUpdateQueue) {
    _priceUpdateQueue = createQueue<PriceUpdateJobData>('price-update', {
      backoff: { type: 'exponential', delay: 5000 },
    })
    _priceUpdateQueue.on('completed', (job: Job<PriceUpdateJobData>) => {
      log.debug('Price update job completed', { jobId: job.id })
    })
    _priceUpdateQueue.on('failed', (job: Job<PriceUpdateJobData> | undefined, err: Error) => {
      log.error('Price update job failed', { jobId: job?.id, error: err.message })
    })
  }
  return _priceUpdateQueue
}

export async function scheduleRecurringJobs(): Promise<void> {
  const queue = getPriceUpdateQueue()
  
  const existingJobs = await queue.getRepeatableJobs()
  if (existingJobs.length === 0) {
    await queue.add(
      { type: 'price-update' },
      {
        repeat: { every: 24 * 60 * 60 * 1000 },
        jobId: 'daily-price-update',
      }
    )
    log.info('Scheduled daily price update job')
  }
}

export async function closeQueues(): Promise<void> {
  if (_priceUpdateQueue) {
    await _priceUpdateQueue.close()
  }
  log.info('All queues closed')
}

export async function getQueueStats(): Promise<{
  price_update: { waiting: number; active: number; failed: number }
}> {
  const queue = getPriceUpdateQueue()
  const [waiting, active, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getFailedCount(),
  ])

  return {
    price_update: { waiting, active, failed },
  }
}
