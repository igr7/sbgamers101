import { prisma } from '../db/prisma-client'
import { log } from '../utils/logger'

export interface PriceHistoryPoint {
  timestamp: string
  price: number | null
  original_price: number | null
  discount_pct: number | null
  availability: string | null
}

export interface PriceHistoryStats {
  asin: string
  current_price: number | null
  all_time_low: { price: number; date: string } | null
  all_time_high: { price: number; date: string } | null
  average_price_30d: number | null
  average_price_90d: number | null
  price_change_percentage: number | null
  price_drop_from_high: number | null
  tracking_since: string | null
  data_points_count: number
  tracking_started: boolean
  history: PriceHistoryPoint[]
}

interface PriceHistoryRecord {
  price: { toNumber(): number } | null
  original_price: { toNumber(): number } | null
  discount_percentage: number | null
  availability: string | null
  recorded_at: Date
}

export async function getPriceHistory(
  asin: string,
  days: number = 30,
  interval: 'hourly' | 'daily' | 'weekly' = 'daily'
): Promise<PriceHistoryStats> {
  const now = new Date()
  let startDate: Date

  switch (days) {
    case 7:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 30:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 90:
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 180:
      startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date(0)
  }

  const history = await prisma.priceHistory.findMany({
    where: {
      asin,
      recorded_at: {
        gte: startDate,
      },
    },
    orderBy: {
      recorded_at: 'asc',
    },
  })

  if (history.length === 0) {
    return {
      asin,
      current_price: null,
      all_time_low: null,
      all_time_high: null,
      average_price_30d: null,
      average_price_90d: null,
      price_change_percentage: null,
      price_drop_from_high: null,
      tracking_since: null,
      data_points_count: 0,
      tracking_started: true,
      history: [],
    }
  }

  const historyRecords = history as unknown as PriceHistoryRecord[]
  
  const prices = historyRecords
    .filter((h) => h.price !== null)
    .map((h) => ({ price: h.price!.toNumber(), date: h.recorded_at }))

  const currentPrice = historyRecords[historyRecords.length - 1]?.price?.toNumber() || null
  const firstPrice = historyRecords[0]?.price?.toNumber() || null

  let allTimeLow: { price: number; date: string } | null = null
  let allTimeHigh: { price: number; date: string } | null = null

  if (prices.length > 0) {
    const sorted = [...prices].sort((a, b) => a.price - b.price)
    allTimeLow = { price: sorted[0].price, date: sorted[0].date.toISOString() }
    allTimeHigh = {
      price: sorted[sorted.length - 1].price,
      date: sorted[sorted.length - 1].date.toISOString(),
    }
  }

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

  const prices30d = prices.filter((p) => p.date >= thirtyDaysAgo)
  const prices90d = prices.filter((p) => p.date >= ninetyDaysAgo)

  const avg30d =
    prices30d.length > 0
      ? prices30d.reduce((sum, p) => sum + p.price, 0) / prices30d.length
      : null

  const avg90d =
    prices90d.length > 0
      ? prices90d.reduce((sum, p) => sum + p.price, 0) / prices90d.length
      : null

  let priceChangePercentage: number | null = null
  if (currentPrice !== null && firstPrice !== null && firstPrice > 0) {
    priceChangePercentage = Math.round(((currentPrice - firstPrice) / firstPrice) * 100)
  }

  let priceDropFromHigh: number | null = null
  if (currentPrice !== null && allTimeHigh && allTimeHigh.price > 0) {
    priceDropFromHigh = Math.round(
      ((allTimeHigh.price - currentPrice) / allTimeHigh.price) * 100
    )
  }

  const aggregatedHistory = aggregateByInterval(
    historyRecords.map((h) => ({
      timestamp: h.recorded_at.toISOString(),
      price: h.price?.toNumber() || null,
      original_price: h.original_price?.toNumber() || null,
      discount_pct: h.discount_percentage,
      availability: h.availability,
    })),
    interval
  )

  return {
    asin,
    current_price: currentPrice,
    all_time_low: allTimeLow,
    all_time_high: allTimeHigh,
    average_price_30d: avg30d ? Math.round(avg30d * 100) / 100 : null,
    average_price_90d: avg90d ? Math.round(avg90d * 100) / 100 : null,
    price_change_percentage: priceChangePercentage,
    price_drop_from_high: priceDropFromHigh,
    tracking_since: history[0]?.recorded_at.toISOString() || null,
    data_points_count: history.length,
    tracking_started: false,
    history: aggregatedHistory,
  }
}

function aggregateByInterval(
  history: PriceHistoryPoint[],
  interval: 'hourly' | 'daily' | 'weekly'
): PriceHistoryPoint[] {
  if (history.length === 0) return []

  const groups: Map<string, PriceHistoryPoint[]> = new Map()

  for (const point of history) {
    const date = new Date(point.timestamp)
    let key: string

    switch (interval) {
      case 'hourly':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`
        break
      case 'daily':
        key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        break
      case 'weekly':
        const weekNum = getWeekNumber(date)
        key = `${date.getFullYear()}-W${weekNum}`
        break
    }

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(point)
  }

  const aggregated: PriceHistoryPoint[] = []
  const groupEntries = Array.from(groups.entries())

  for (const [, points] of groupEntries) {
    const prices = points.filter((p) => p.price !== null)
    const avgPrice =
      prices.length > 0
        ? prices.reduce((sum, p) => sum + (p.price || 0), 0) / prices.length
        : null

    const origPrices = points.filter((p) => p.original_price !== null)
    const avgOrigPrice =
      origPrices.length > 0
        ? origPrices.reduce((sum, p) => sum + (p.original_price || 0), 0) / origPrices.length
        : null

    const discounts = points.filter((p) => p.discount_pct !== null)
    const avgDiscount =
      discounts.length > 0
        ? Math.round(discounts.reduce((sum, p) => sum + (p.discount_pct || 0), 0) / discounts.length)
        : null

    aggregated.push({
      timestamp: points[points.length - 1].timestamp,
      price: avgPrice ? Math.round(avgPrice * 100) / 100 : null,
      original_price: avgOrigPrice ? Math.round(avgOrigPrice * 100) / 100 : null,
      discount_pct: avgDiscount,
      availability: points[points.length - 1].availability,
    })
  }

  return aggregated
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export async function isNearAllTimeLow(asin: string, thresholdPercent: number = 5): Promise<{
  is_near: boolean
  all_time_low: number | null
  current_price: number | null
  percentage_diff: number | null
}> {
  const stats = await getPriceHistory(asin, 180, 'daily')

  if (!stats.all_time_low || !stats.current_price) {
    return {
      is_near: false,
      all_time_low: null,
      current_price: null,
      percentage_diff: null,
    }
  }

  const percentageDiff =
    ((stats.current_price - stats.all_time_low.price) / stats.all_time_low.price) * 100

  return {
    is_near: percentageDiff <= thresholdPercent,
    all_time_low: stats.all_time_low.price,
    current_price: stats.current_price,
    percentage_diff: Math.round(percentageDiff * 100) / 100,
  }
}

export async function getPriceTrend7d(asin: string): Promise<number | null> {
  const stats = await getPriceHistory(asin, 7, 'daily')

  if (stats.history.length < 2) return null

  const first = stats.history[0].price
  const last = stats.history[stats.history.length - 1].price

  if (!first || !last) return null

  return Math.round(((last - first) / first) * 100)
}