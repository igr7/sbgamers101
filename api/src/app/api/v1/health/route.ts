import { NextResponse } from 'next/server'
import { checkRedisConnection } from '@/lib/cache/redis-client'
import { log } from '@/lib/utils/logger'

export async function GET() {
  const startTime = Date.now()

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      redis: 'unknown',
      decodo_api_key: process.env.DECODO_API_KEY ? 'SET' : 'NOT SET',
    },
    responseTime: 0,
  }

  try {
    const redisHealthy = await checkRedisConnection()
    health.checks.redis = redisHealthy ? 'healthy' : 'unhealthy'
  } catch (error) {
    health.checks.redis = 'error'
    log.warn('Health check: Redis check failed', {
      error: error instanceof Error ? error.message : 'Unknown',
    })
  }

  health.responseTime = Date.now() - startTime

  const isHealthy = health.checks.redis !== 'error'

  return NextResponse.json(
    {
      success: isHealthy,
      ...health,
    },
    { status: isHealthy ? 200 : 503 }
  )
}