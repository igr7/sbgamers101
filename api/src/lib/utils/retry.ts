import { log } from './logger'

export interface RetryOptions {
  maxAttempts: number
  delayMs: number
  backoffMultiplier?: number
  maxDelayMs?: number
}

const defaultOptions: RetryOptions = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options }
  let lastError: Error | undefined
  let delay = opts.delayMs

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      log.warn(`Attempt ${attempt}/${opts.maxAttempts} failed`, {
        error: lastError.message,
        nextDelay: attempt < opts.maxAttempts ? delay : undefined,
      })

      if (attempt < opts.maxAttempts) {
        await sleep(delay)
        delay = Math.min(delay * (opts.backoffMultiplier || 2), opts.maxDelayMs || 30000)
      }
    }
  }

  throw lastError || new Error('Retry failed')
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function exponentialBackoff(attempt: number, baseDelay: number = 1000): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 30000)
}