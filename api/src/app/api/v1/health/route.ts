import { NextResponse } from 'next/server'

export async function GET() {
  // Dump all env var KEYS (not values for security) to see what's available
  const allEnvKeys = Object.keys(process.env).sort()

  const checks: Record<string, unknown> = {
    node_env: process.env.NODE_ENV || 'NOT SET',
    port: process.env.PORT || 'NOT SET',
    database_url: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    redis_url: process.env.REDIS_URL ? 'SET' : 'NOT SET',
    omkar_api_key: process.env.OMKAR_API_KEY ? 'SET' : 'NOT SET',
    omkar_api_base: process.env.OMKAR_API_BASE || 'NOT SET',
    hostname: process.env.HOSTNAME || 'NOT SET',
    all_env_keys: allEnvKeys,
    cwd: process.cwd(),
  }

  return NextResponse.json({ checks })
}
