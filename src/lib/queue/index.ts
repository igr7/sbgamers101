import processPriceSnapshot from './jobs/price-snapshot'
import processPopularRefresh from './jobs/popular-refresh'
import processCacheWarmer from './jobs/cache-warmer-job'
import processUsageMonitor from './jobs/usage-monitor'
import {
  priceSnapshotQueue,
  popularRefreshQueue,
  cacheWarmerQueue,
  usageMonitorQueue,
  scheduleRecurringJobs,
} from './bull-queue'
import { log } from '../utils/logger'

export function initializeQueues(): void {
  priceSnapshotQueue.process(processPriceSnapshot)
  popularRefreshQueue.process(processPopularRefresh)
  cacheWarmerQueue.process(processCacheWarmer)
  usageMonitorQueue.process(processUsageMonitor)

  log.info('Queue processors initialized')

  scheduleRecurringJobs().catch((err) => {
    log.error('Failed to schedule recurring jobs', { error: err.message })
  })
}

export {
  priceSnapshotQueue,
  popularRefreshQueue,
  cacheWarmerQueue,
  usageMonitorQueue,
  scheduleRecurringJobs,
  closeQueues,
  getQueueStats,
} from './bull-queue'