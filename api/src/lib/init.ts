import { log } from '@/lib/utils/logger'

let initialized = false

export function initializeApp(): void {
  if (initialized) return
  initialized = true
  log.info('Amazon SA API initialized (queues lazy-loaded)')
}
