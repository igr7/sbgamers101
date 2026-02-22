import { NextRequest, NextResponse } from 'next/server'
import { getCacheStats } from '@/lib/cache/cache-manager'
import { getQueueStats } from '@/lib/queue/bull-queue'
import { checkRedisConnection } from '@/lib/cache/redis-client'
import { checkDatabaseConnection } from '@/lib/db/prisma-client'
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

    const [cacheStats, queueStats, redisConnected, dbConnected] = await Promise.all([
      getCacheStats(),
      getQueueStats().catch(() => null),
      checkRedisConnection(),
      checkDatabaseConnection(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        status: redisConnected && dbConnected ? 'healthy' : 'degraded',
        connections: {
          redis: redisConnected ? 'connected' : 'disconnected',
          database: dbConnected ? 'connected' : 'disconnected',
        },
        cache: cacheStats,
        queues: queueStats,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    log.error('Cache stats error', {
      error: error instanceof Error ? error.message : 'Unknown',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'API_ERROR',
        message: 'An error occurred while fetching cache stats',
      },
      { status: 500 }
    )
  }
}