import { Job } from 'bull'
import { safeRedisGet, safeRedisSetex } from '../../cache/redis-client'
import { decodoApi } from '../../decodo/decodo-client'
import { log } from '../../utils/logger'

const PRICE_HISTORY_TTL = 86400 * 30

interface PriceUpdateResult {
  asin: string
  success: boolean
  oldPrice: number | null
  newPrice: number | null
  priceChange: number | null
  timestamp: string
}

export default async function processPriceUpdate(
  job: Job<{ asins?: string[] }>
): Promise<PriceUpdateResult[]> {
  log.info('Starting price update job', { jobId: job.id, asinCount: job.data.asins?.length || 'all tracked' })

  const trackedAsins = job.data.asins || await getTrackedAsins()
  
  if (trackedAsins.length === 0) {
    log.info('No tracked products found for price update')
    return []
  }

  const results: PriceUpdateResult[] = []

  for (const asin of trackedAsins.slice(0, 100)) {
    try {
      const cachedData = await safeRedisGet(`product:${asin}:full`)
      let oldPrice: number | null = null
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        oldPrice = parsed.data?.price || null
      }

      const pricing = await decodoApi.getPricing(asin)
      const latestPrice = pricing.pricing?.[0]?.price || null

      if (latestPrice !== null) {
        const historyKey = `price_history:${asin}`
        const existingHistory = await safeRedisGet(historyKey)
        
        let history: Array<{ price: number; timestamp: string }> = []
        if (existingHistory) {
          history = JSON.parse(existingHistory)
        }

        history.push({
          price: latestPrice,
          timestamp: new Date().toISOString(),
        })

        history = history.slice(-365)

        safeRedisSetex(historyKey, PRICE_HISTORY_TTL, JSON.stringify(history))

        const priceChange = oldPrice !== null && latestPrice !== oldPrice
          ? latestPrice - oldPrice
          : null

        results.push({
          asin,
          success: true,
          oldPrice,
          newPrice: latestPrice,
          priceChange,
          timestamp: new Date().toISOString(),
        })

        if (priceChange !== null && oldPrice !== null && Math.abs(priceChange) > oldPrice * 0.1) {
          log.warn('Significant price change detected', {
            asin,
            oldPrice,
            newPrice: latestPrice,
            change: `${priceChange > 0 ? '+' : ''}${priceChange}`,
          })
        }
      } else {
        results.push({
          asin,
          success: false,
          oldPrice,
          newPrice: null,
          priceChange: null,
          timestamp: new Date().toISOString(),
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      log.error('Failed to update price for product', {
        asin,
        error: error instanceof Error ? error.message : 'Unknown',
      })
      results.push({
        asin,
        success: false,
        oldPrice: null,
        newPrice: null,
        priceChange: null,
        timestamp: new Date().toISOString(),
      })
    }
  }

  log.info('Price update job completed', {
    processed: results.length,
    successful: results.filter((r) => r.success).length,
    failed: results.filter((r) => !r.success).length,
  })

  return results
}

async function getTrackedAsins(): Promise<string[]> {
  const trackedKey = 'tracked_products'
  const tracked = await safeRedisGet(trackedKey)
  if (tracked) {
    return JSON.parse(tracked)
  }
  return []
}

export async function addTrackedProduct(asin: string): Promise<void> {
  const trackedKey = 'tracked_products'
  const tracked = await getTrackedAsins()
  if (!tracked.includes(asin)) {
    tracked.push(asin)
    safeRedisSetex(trackedKey, 86400 * 365, JSON.stringify(tracked))
  }
}

export async function removeTrackedProduct(asin: string): Promise<void> {
  const trackedKey = 'tracked_products'
  const tracked = await getTrackedAsins()
  const index = tracked.indexOf(asin)
  if (index > -1) {
    tracked.splice(index, 1)
    safeRedisSetex(trackedKey, 86400 * 365, JSON.stringify(tracked))
  }
}

export async function getPriceHistory(asin: string): Promise<Array<{ price: number; timestamp: string }>> {
  const historyKey = `price_history:${asin}`
  const history = await safeRedisGet(historyKey)
  if (history) {
    return JSON.parse(history)
  }
  return []
}