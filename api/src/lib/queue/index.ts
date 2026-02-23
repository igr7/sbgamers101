import processPriceUpdate from './jobs/price-update'
import {
  getPriceUpdateQueue,
  scheduleRecurringJobs,
  closeQueues,
  getQueueStats,
} from './bull-queue'
import { log } from '../utils/logger'

let queuesInitialized = false

export function initializeQueues(): void {
  if (queuesInitialized) return
  queuesInitialized = true

  const priceUpdateQueue = getPriceUpdateQueue()
  priceUpdateQueue.process(processPriceUpdate)

  log.info('Queue processors initialized')

  scheduleRecurringJobs().catch((err) => {
    log.error('Failed to schedule recurring jobs', { error: err.message })
  })
}

export const priceUpdateQueue = getPriceUpdateQueue()

export {
  scheduleRecurringJobs,
  closeQueues,
  getQueueStats,
}

export { addTrackedProduct, removeTrackedProduct, getPriceHistory } from './jobs/price-update'
