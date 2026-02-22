import { NextRequest, NextResponse } from 'next/server'
import { getMonthlyUsageStats, getDailyUsageSummary } from '@/lib/omkar/usage-tracker'
import { log } from '@/lib/utils/logger'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const secret = request.nextUrl.searchParams.get('secret')
    const apiSecret = process.env.API_SECRET_KEY
    
    if (apiSecret && secret !== apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Invalid API secret',
        },
        { status: 401 }
      )
    }

    const [monthlyStats, dailySummary] = await Promise.all([
      getMonthlyUsageStats(),
      getDailyUsageSummary(),
    ])

    const remainingPercentage = Math.round(
      (monthlyStats.remaining / monthlyStats.monthly_quota) * 100
    )

    return NextResponse.json({
      success: true,
      data: {
        monthly: {
          current_usage: monthlyStats.current_month_usage,
          quota: monthlyStats.monthly_quota,
          remaining: monthlyStats.remaining,
          percentage_used: monthlyStats.percentage_used,
          remaining_percentage: remainingPercentage,
          is_near_limit: monthlyStats.is_near_limit,
          alert_threshold: monthlyStats.alert_threshold,
          usage_by_endpoint: monthlyStats.usage_by_endpoint,
        },
        today: dailySummary,
        recommendations: generateRecommendations(monthlyStats, dailySummary),
      },
    })
  } catch (error) {
    log.error('API usage stats error', {
      error: error instanceof Error ? error.message : 'Unknown',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'API_ERROR',
        message: 'An error occurred while fetching API usage stats',
      },
      { status: 500 }
    )
  }
}

function generateRecommendations(
  monthly: { percentage_used: number; is_near_limit: boolean },
  daily: { avg_response_time: number; failed_calls: number }
): string[] {
  const recommendations: string[] = []

  if (monthly.is_near_limit) {
    recommendations.push(
      'API quota is near limit. Consider reducing request frequency or upgrading your plan.'
    )
  }

  if (monthly.percentage_used > 75) {
    recommendations.push(
      'More than 75% of monthly quota used. Monitor usage closely.'
    )
  }

  if (daily.avg_response_time > 5000) {
    recommendations.push(
      'Average response time is high. Consider implementing more aggressive caching.'
    )
  }

  if (daily.failed_calls > 10) {
    recommendations.push(
      'High number of failed API calls. Check for API issues or rate limiting.'
    )
  }

  if (recommendations.length === 0) {
    recommendations.push('API usage is within normal parameters.')
  }

  return recommendations
}