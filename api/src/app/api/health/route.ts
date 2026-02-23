import { NextResponse } from 'next/server'
import { checkRedisConnection } from '@/lib/cache/redis-client'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

export async function GET() {
  let redisOk = false
  try {
    redisOk = await withTimeout(checkRedisConnection(), 3000)
  } catch {
    // Redis unavailable or timeout
  }

  let dbOk = false
  try {
    const { prisma } = await import('@/lib/db/prisma-client')
    await withTimeout(prisma.$queryRaw`SELECT 1`, 3000)
    dbOk = true
  } catch {
    // DB unavailable or timeout
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
