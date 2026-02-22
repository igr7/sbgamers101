import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { redis } from '@/lib/cache/redis-client'
import { log } from '@/lib/utils/logger'

const invalidateSchema = z.object({
  pattern: z.string().min(1),
  secret: z.string().optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { pattern, secret } = invalidateSchema.parse(body)

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

    const keys = await redis.keys(pattern)
    
    if (keys.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No keys matched the pattern',
        invalidated_count: 0,
      })
    }

    await redis.del(...keys)
    
    log.info('Cache invalidated', { pattern, count: keys.length })

    return NextResponse.json({
      success: true,
      message: `Successfully invalidated ${keys.length} cache keys`,
      invalidated_count: keys.length,
      keys: keys.slice(0, 20),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.errors[0].message,
        },
        { status: 400 }
      )
    }

    log.error('Cache invalidation error', {
      error: error instanceof Error ? error.message : 'Unknown',
    })

    return NextResponse.json(
      {
        success: false,
        error: 'API_ERROR',
        message: 'An error occurred while invalidating cache',
      },
      { status: 500 }
    )
  }
}