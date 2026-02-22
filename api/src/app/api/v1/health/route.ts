import { NextResponse } from 'next/server'

export async function GET() {
  const checks: Record<string, string> = {}

  // Test Redis with timeout
  try {
    const { redis } = await import('@/lib/cache/redis-client')
    const pong = await Promise.race([
      redis.ping(),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ])
    checks.redis = pong === 'PONG' ? 'ok' : `unexpected: ${pong}`
  } catch (err) {
    checks.redis = `error: ${err instanceof Error ? err.message : String(err)}`
  }

  // Test DB with timeout
  try {
    const { prisma } = await import('@/lib/db/prisma-client')
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
    ])
    checks.database = 'ok'
  } catch (err) {
    checks.database = `error: ${err instanceof Error ? err.message : String(err)}`
  }

  checks.omkar_key = process.env.OMKAR_API_KEY ? `set (${process.env.OMKAR_API_KEY.substring(0, 6)}...)` : 'NOT SET'
  checks.omkar_base = process.env.OMKAR_API_BASE || 'NOT SET (using default)'
  checks.redis_url = process.env.REDIS_URL ? 'set' : 'NOT SET'
  checks.db_url = process.env.DATABASE_URL ? 'set' : 'NOT SET'

  return NextResponse.json({ checks })
}
