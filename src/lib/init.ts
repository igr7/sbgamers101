import { warmOnStartup } from '@/lib/cache/cache-warmer'
import { initializeQueues } from '@/lib/queue'
import { log } from '@/lib/utils/logger'

let initialized = false

export function initializeApp(): void {
  if (initialized) return
  initialized = true

  log.info('Initializing Amazon SA API...')

  initializeQueues()

  if (process.env.NODE_ENV === 'production') {
    warmOnStartup()
  }

  log.info('Amazon SA API initialized')
}