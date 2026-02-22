import { warmOnStartup } from '@/lib/cache/cache-warmer'
import { initializeQueues } from '@/lib/queue'
import { log } from '@/lib/utils/logger'

let initialized = false

export function initializeApp(): void {
  if (initialized) return
  initialized = true

  log.info('Initializing Amazon SA API...')

  try {
    initializeQueues()
  } catch (error) {
    log.error('Failed to initialize queues', { error: error instanceof Error ? error.message : 'Unknown' })
  }

  if (process.env.NODE_ENV === 'production') {
    warmOnStartup().catch((err) => {
      log.error('Failed to warm cache', { error: err instanceof Error ? err.message : 'Unknown' })
    })
  }

  log.info('Amazon SA API initialized')
}