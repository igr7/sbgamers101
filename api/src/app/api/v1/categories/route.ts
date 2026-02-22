import { NextResponse } from 'next/server'
import { redis, CacheTTL } from '@/lib/cache/redis-client'

interface Category {
  id: string
  slug: string
  name_en: string
  name_ar: string
}

const CATEGORIES: Category[] = [
  { id: '1', slug: 'cpu', name_en: 'Processors', name_ar: 'المعالجات' },
  { id: '2', slug: 'gpu', name_en: 'Graphics Cards', name_ar: 'كرت الشاشة' },
  { id: '3', slug: 'ram', name_en: 'Memory', name_ar: 'الذاكرة' },
  { id: '4', slug: 'motherboard', name_en: 'Motherboards', name_ar: 'لوحات الأم' },
  { id: '5', slug: 'psu', name_en: 'Power Supplies', name_ar: 'مزود الطاقة' },
  { id: '6', slug: 'case', name_en: 'Cases', name_ar: 'صناديق الحاسوب' },
  { id: '7', slug: 'cooling', name_en: 'Cooling', name_ar: 'التبريد' },
  { id: '8', slug: 'mouse', name_en: 'Mice', name_ar: 'الفأرة' },
  { id: '9', slug: 'keyboard', name_en: 'Keyboards', name_ar: 'لوحات المفاتيح' },
  { id: '10', slug: 'headset', name_en: 'Headsets', name_ar: 'سماعات الرأس' },
  { id: '11', slug: 'monitor', name_en: 'Monitors', name_ar: 'الشاشات' },
  { id: '12', slug: 'chair', name_en: 'Gaming Chairs', name_ar: 'كراسي الألعاب' },
]

const CACHE_KEY = 'categories:all'

export async function GET() {
  try {
    const cachedData = await redis.get(CACHE_KEY)
    if (cachedData) {
      const parsed = JSON.parse(cachedData) as {
        data: Category[]
        metadata: { cachedAt: number }
      }
      return NextResponse.json({
        success: true,
        data: parsed.data,
        cached: true,
        source: 'cache',
      })
    }

    await redis.setex(
      CACHE_KEY,
      CacheTTL.categories,
      JSON.stringify({
        data: CATEGORIES,
        metadata: { cachedAt: Date.now() },
      })
    )

    return NextResponse.json({
      success: true,
      data: CATEGORIES,
      cached: false,
      source: 'static',
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: CATEGORIES,
      cached: false,
      source: 'static',
    })
  }
}
