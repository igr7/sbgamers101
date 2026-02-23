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

  const dbUrl = process.env.DATABASE_URL
  const redisUrl = process.env.REDIS_URL

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      redis: redisOk ? 'connected' : 'unavailable',
      database: dbOk ? 'connected' : 'unavailable',
    },
    env: {
      DATABASE_URL: dbUrl ? `${dbUrl.slice(0, 20)}...` : 'NOT SET',
      REDIS_URL: redisUrl ? `${redisUrl.slice(0, 15)}...` : 'NOT SET',
      OMKAR_API_KEY: process.env.OMKAR_API_KEY ? 'SET' : 'NOT SET',
    },
  }, { status: status === 'healthy' ? 200 : 503 })
}
