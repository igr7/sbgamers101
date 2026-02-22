import { NextResponse } from 'next/server'
import { redis } from '@/lib/cache/redis-client'
import { prisma } from '@/lib/db/prisma-client'

export async function GET() {
  const checks: Record<string, string> = {}

  try {
    const pong = await redis.ping()
    checks.redis = pong === 'PONG' ? 'ok' : `unexpected: ${pong}`
  } catch (err) {
    checks.redis = `error: ${err instanceof Error ? err.message : String(err)}`
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch (err) {
    checks.database = `error: ${err instanceof Error ? err.message : String(err)}`
  }

  checks.omkar_api_key = process.env.OMKAR_API_KEY ? `set (${process.env.OMKAR_API_KEY.substring(0, 6)}...)` : 'NOT SET'
  checks.omkar_api_base = process.env.OMKAR_API_BASE || 'NOT SET (using default)'
  checks.redis_url = process.env.REDIS_URL ? 'set' : 'NOT SET'
  checks.database_url = process.env.DATABASE_URL ? 'set' : 'NOT SET'

  return NextResponse.json({ checks })
}
