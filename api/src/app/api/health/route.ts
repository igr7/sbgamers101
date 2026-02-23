import { NextResponse } from 'next/server'
import { checkRedisConnection } from '@/lib/cache/redis-client'

export async function GET() {
  const redisOk = await checkRedisConnection()

  let dbOk = false
  try {
    const { prisma } = await import('@/lib/db/prisma-client')
    await prisma.$queryRaw`SELECT 1`
    dbOk = true
  } catch {
    // DB unavailable
  }

  const status = redisOk && dbOk ? 'healthy' : 'degraded'

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      redis: redisOk ? 'connected' : 'unavailable',
      database: dbOk ? 'connected' : 'unavailable',
    },
  }, { status: status === 'healthy' ? 200 : 503 })
}
