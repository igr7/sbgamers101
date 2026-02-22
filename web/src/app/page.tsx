'use client';

import { useEffect, useState } from 'react';
import { api, Category, Product } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'gpu', slug: 'gpu', name_en: 'Graphics Cards', name_ar: 'كروت شاشة' },
  { id: 'cpu', slug: 'cpu', name_en: 'Processors', name_ar: 'معالجات' },
  { id: 'monitor', slug: 'monitor', name_en: 'Monitors', name_ar: 'شاشات' },
  { id: 'keyboard', slug: 'keyboard', name_en: 'Keyboards', name_ar: 'كيبورد' },
  { id: 'mouse', slug: 'mouse', name_en: 'Mouse', name_ar: 'ماوس' },
  { id: 'headset', slug: 'headset', name_en: 'Headsets', name_ar: 'سماعات' },
  { id: 'ram', slug: 'ram', name_en: 'Memory', name_ar: 'ذاكرة' },
  { id: 'motherboard', slug: 'motherboard', name_en: 'Motherboards', name_ar: 'لوحات أم' },
  { id: 'chair', slug: 'chair', name_en: 'Gaming Chairs', name_ar: 'كراسي قيمنق' },
  { id: 'cooling', slug: 'cooling', name_en: 'Cooling', name_ar: 'تبريد' },
  { id: 'psu', slug: 'psu', name_en: 'Power Supply', name_ar: 'باور سبلاي' },
  { id: 'case', slug: 'case', name_en: 'PC Cases', name_ar: 'كيسات' },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    titleEn: 'Price Tracking',
    titleAr: 'تتبع الأسعار',
    descEn: 'We track prices on Amazon.sa daily so you never miss a price drop.',
    descAr: 'نتتبع الأسعار على أمازون يومياً حتى لا يفوتك أي انخفاض.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    titleEn: 'Deal Verification',
    titleAr: 'التحقق من العروض',
    descEn: 'Our algorithm checks if a "discount" is real or just a fake inflated price.',
    descAr: 'خوارزميتنا تتحقق إذا كان "الخصم" حقيقي أو سعر مضخم وهمي.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titleEn: 'Saudi Focused',
    titleAr: 'مخصص للسعودية',
    descEn: 'Built specifically for Amazon.sa with prices in SAR and Arabic support.',
    descAr: 'مبني خصيصاً لأمازون السعودية بالريال السعودي ودعم اللغة العربية.',
  },
];

export default function HomePage() {
  const { t, lang } = useI18n();
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getDeals(1, 0)])
      .then(([cats, dealsRes]) => {
        if (cats.length > 0) setCategories(cats);
        setDeals(dealsRes.products);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-emerald-500/[0.04] rounded-full blur-[180px]" />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/[0.02] rounded-full blur-[100px]" />

          <div className="relative container-main py-20 sm:py-28 lg:py-36 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-semibold tracking-wide">
                {lang === 'ar' ? 'أسعار محدثة يومياً' : 'Prices Updated Daily'}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.05]">
              {lang === 'ar' ? (
                <>
                  أفضل أسعار الألعاب
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">في السعودية</span>
                </>
              ) : (
                <>
                  Best Gaming Prices
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">in Saudi Arabia</span>
                </>
              )}
            </h1>

            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              {lang === 'ar'
                ? 'تتبع الأسعار، تحقق من الخصومات الحقيقية، واعثر على أفضل صفقات قطع الكمبيوتر وملحقات الألعاب على أمازون السعودية.'
                : 'Track prices, verify real discounts, and find the best deals on PC components and gaming gear on Amazon.sa.'}
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/deals" className="btn-primary text-sm px-8 py-3.5 flex items-center gap-2 text-base font-bold">
                {t('hero.cta')}
                <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/categories" className="btn-secondary text-sm px-8 py-3.5 text-base">
                {t('hero.cta2')}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-8 sm:gap-16 mt-14">
              {[
                { value: '1000+', labelEn: 'Products Tracked', labelAr: 'منتج يُتتبع' },
                { value: '24/7', labelEn: 'Price Monitoring', labelAr: 'مراقبة الأسعار' },
                { value: '100%', labelEn: 'Free to Use', labelAr: 'مجاني بالكامل' },
              ].map((stat) => (
                <div key={stat.value} className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-white mb-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{lang === 'ar' ? stat.labelAr : stat.labelEn}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="glow-line container-main" />

        {/* Features */}
        <section className="container-main py-16">
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="card-glass p-6 flex flex-col gap-4 hover:border-emerald-500/20 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{lang === 'ar' ? f.titleAr : f.titleEn}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{lang === 'ar' ? f.descAr : f.descEn}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="container-main py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title">{t('nav.categories')}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {lang === 'ar' ? 'تصفح حسب القسم' : 'Browse by category'}
              </p>
            </div>
            <Link href="/categories" className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors flex items-center gap-1">
              {t('common.seeAll')}
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.slice(0, 12).map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </section>

        {/* Deals Section */}
        <section className="container-main py-10 pb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-title mb-1">{t('deals.title')}</h2>
              <p className="text-sm text-gray-600">{t('deals.subtitle')}</p>
            </div>
            <Link href="/deals" className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors flex items-center gap-1">
              {t('common.seeAll')}
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-[4/3] bg-gradient-to-b from-white/[0.02] to-transparent rounded-t-2xl relative overflow-hidden">
                    <div className="skeleton-shimmer absolute inset-0" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="h-2 bg-white/[0.04] rounded-full w-16" />
                    <div className="h-3.5 bg-white/[0.04] rounded-full w-full" />
                    <div className="h-5 bg-white/[0.06] rounded-full w-24 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error || deals.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/[0.06]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                {lang === 'ar' ? 'العروض قادمة قريباً' : 'Deals Coming Soon'}
              </h3>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                {lang === 'ar'
                  ? 'نحن نجمع البيانات من أمازون السعودية. تحقق لاحقاً للعثور على أفضل الصفقات!'
                  : 'We\'re gathering data from Amazon.sa. Check back soon for the best deals!'}
              </p>
              <Link href="/categories" className="btn-primary inline-flex items-center gap-2 mt-6 text-sm">
                {t('hero.cta2')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {deals.slice(0, 8).map((product) => (
                <ProductCard key={product.asin} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <section className="container-main pb-20">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border border-emerald-500/20 p-8 sm:p-12 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                {lang === 'ar' ? 'لا تدفع أكثر من اللازم' : 'Stop Overpaying for Gaming Gear'}
              </h2>
              <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto mb-6">
                {lang === 'ar'
                  ? 'ابحث عن أي منتج على أمازون السعودية وشاهد تاريخ أسعاره الحقيقي'
                  : 'Search any product on Amazon.sa and see its real price history'}
              </p>
              <Link href="/deals" className="btn-primary inline-flex items-center gap-2 text-base font-bold px-8 py-3.5">
                {t('hero.cta')}
                <svg className="w-5 h-5 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
