import { Job } from 'bull'
import {
  getMonthlyUsageStats,
  getDailyUsageSummary,
  checkQuotaAndAlert,
} from '../../omkar/usage-tracker'
import { log } from '../../utils/logger'

interface UsageMonitorResult {
  daily: {
    total_calls: number
    successful_calls: number
    failed_calls: number
    avg_response_time: number
  }
  monthly: {
    current_usage: number
    quota: number
    remaining: number
    percentage_used: number
  }
  alertTriggered: boolean
}

export default async function processUsageMonitor(
  job: Job
): Promise<UsageMonitorResult> {
  log.info('Starting usage monitor job', { jobId: job.id })

  try {
    const [dailySummary, monthlyStats, alertTriggered] = await Promise.all([
      getDailyUsageSummary(),
      getMonthlyUsageStats(),
      checkQuotaAndAlert(),
    ])

    log.info('Usage monitor summary', {
      daily: {
        total: dailySummary.total_calls,
        success: dailySummary.successful_calls,
        failed: dailySummary.failed_calls,
        avgMs: dailySummary.avg_response_time,
      },
      monthly: {
        usage: monthlyStats.current_month_usage,
        quota: monthlyStats.monthly_quota,
        percentage: `${monthlyStats.percentage_used}%`,
      },
    })

    return {
      daily: {
        total_calls: dailySummary.total_calls,
        successful_calls: dailySummary.successful_calls,
        failed_calls: dailySummary.failed_calls,
        avg_response_time: dailySummary.avg_response_time,
      },
      monthly: {
        current_usage: monthlyStats.current_month_usage,
        quota: monthlyStats.monthly_quota,
        remaining: monthlyStats.remaining,
        percentage_used: monthlyStats.percentage_used,
      },
      alertTriggered,
    }
  } catch (error) {
    log.error('Usage monitor job failed', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
    throw error
  }
}