import { prisma } from '../db/prisma-client'
import { log } from '../utils/logger'

const MONTHLY_QUOTA = parseInt(process.env.OMKAR_MONTHLY_QUOTA || '5000', 10)
const ALERT_THRESHOLD = parseInt(process.env.OMKAR_QUOTA_ALERT_THRESHOLD || '4500', 10)

export interface UsageStats {
  current_month_usage: number
  monthly_quota: number
  remaining: number
  percentage_used: number
  alert_threshold: number
  is_near_limit: boolean
  usage_by_endpoint: Record<string, number>
}

export async function getMonthlyUsageStats(): Promise<UsageStats> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const logs = await prisma.apiUsageLog.findMany({
    where: {
      created_at: {
        gte: startOfMonth,
      },
    },
    select: {
      endpoint: true,
      status: true,
    },
  })

  const successLogs = logs.filter((l) => l.status === 'success')
  const usageByEndpoint: Record<string, number> = {}

  for (const logEntry of successLogs) {
    usageByEndpoint[logEntry.endpoint] = (usageByEndpoint[logEntry.endpoint] || 0) + 1
  }

  const totalUsage = successLogs.length
  const remaining = Math.max(0, MONTHLY_QUOTA - totalUsage)
  const percentageUsed = Math.round((totalUsage / MONTHLY_QUOTA) * 100)

  return {
    current_month_usage: totalUsage,
    monthly_quota: MONTHLY_QUOTA,
    remaining,
    percentage_used: percentageUsed,
    alert_threshold: ALERT_THRESHOLD,
    is_near_limit: totalUsage >= ALERT_THRESHOLD,
    usage_by_endpoint: usageByEndpoint,
  }
}

export async function checkQuotaAndAlert(): Promise<boolean> {
  const stats = await getMonthlyUsageStats()

  if (stats.is_near_limit) {
    log.warn('API quota near limit', {
      usage: stats.current_month_usage,
      quota: stats.monthly_quota,
      threshold: ALERT_THRESHOLD,
    })

    if (process.env.ALERT_WEBHOOK_URL) {
      try {
        await fetch(process.env.ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alert: 'omkar_cloud_quota_warning',
            message: `API usage at ${stats.percentage_used}% (${stats.current_month_usage}/${stats.monthly_quota})`,
            stats,
          }),
        })
      } catch (error) {
        log.error('Failed to send quota alert', {
          error: error instanceof Error ? error.message : 'Unknown',
        })
      }
    }
    return true
  }

  return false
}

export async function getDailyUsageSummary(): Promise<{
  date: string
  total_calls: number
  successful_calls: number
  failed_calls: number
  avg_response_time: number
}> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const logs = await prisma.apiUsageLog.findMany({
    where: {
      created_at: {
        gte: today,
      },
    },
  })

  const successful = logs.filter((l) => l.status === 'success')
  const failed = logs.filter((l) => l.status === 'error')
  const totalResponseTime = logs.reduce((sum, l) => sum + (l.response_ms || 0), 0)

  return {
    date: today.toISOString().split('T')[0],
    total_calls: logs.length,
    successful_calls: successful.length,
    failed_calls: failed.length,
    avg_response_time: logs.length > 0 ? Math.round(totalResponseTime / logs.length) : 0,
  }
}