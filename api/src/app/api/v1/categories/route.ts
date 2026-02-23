import { NextResponse } from 'next/server'
import { CacheTTL, safeRedisGet, safeRedisSetex } from '@/lib/cache/redis-client'
import { AMAZON_SA_CATEGORIES } from '@/lib/decodo/decodo-client'

interface Category {
  id: string
  slug: string
  name_en: string
  name_ar: string
  amazon_category_id: string
}

const CACHE_KEY = 'categories:all'

export async function GET() {
  try {
    const cachedData = await safeRedisGet(CACHE_KEY)
    if (cachedData) {
      const parsed = JSON.parse(cachedData)
      return NextResponse.json({
        success: true,
        data: parsed.data,
        cached: true,
        source: 'cache',
      })
    }

    const categories: Category[] = Object.entries(AMAZON_SA_CATEGORIES).map(([slug, cat], index) => ({
      id: String(index + 1),
      slug,
      name_en: cat.name_en,
      name_ar: cat.name_ar,
      amazon_category_id: cat.id,
    }))

    safeRedisSetex(
      CACHE_KEY,
      CacheTTL.categories,
      JSON.stringify({
        data: categories,
        metadata: { cachedAt: Date.now() },
      })
    )

    return NextResponse.json({
      success: true,
      data: categories,
      cached: false,
      source: 'static',
    })
  } catch {
    const categories: Category[] = Object.entries(AMAZON_SA_CATEGORIES).map(([slug, cat], index) => ({
      id: String(index + 1),
      slug,
      name_en: cat.name_en,
      name_ar: cat.name_ar,
      amazon_category_id: cat.id,
    }))

    return NextResponse.json({
      success: true,
      data: categories,
      cached: false,
      source: 'static',
    })
  }
}
