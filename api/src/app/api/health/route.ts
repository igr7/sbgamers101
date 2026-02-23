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
  let redisError = ''
  try {
    redisOk = await withTimeout(checkRedisConnection(), 3000)
    if (!redisOk) redisError = 'ping failed'
  } catch (e) {
    redisError = e instanceof Error ? e.message : 'unknown'
  }

  let dbOk = false
  let dbError = ''
  try {
    const { prisma } = await import('@/lib/db/prisma-client')
    await withTimeout(prisma.$queryRaw`SELECT 1`, 5000)
    dbOk = true
  } catch (e) {
    dbError = e instanceof Error ? e.message : 'unknown'
  }

  const status = redisOk && dbOk ? 'healthy' : 'degraded'

  const dbUrl = process.env.DATABASE_URL
  const redisUrl = process.env.REDIS_URL

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      redis: redisOk ? 'connected' : 'unavailable',
      redis_error: redisError || undefined,
      database: dbOk ? 'connected' : 'unavailable',
      db_error: dbError || undefined,
    },
    env: {
      DATABASE_URL: dbUrl ? `${dbUrl.slice(0, 20)}...` : 'NOT SET',
      REDIS_URL: redisUrl ? `${redisUrl.slice(0, 15)}...` : 'NOT SET',
      OMKAR_API_KEY: process.env.OMKAR_API_KEY ? 'SET' : 'NOT SET',
    },
  }, { status: status === 'healthy' ? 200 : 503 })
}
