'use client';

import { useEffect, useState } from 'react';
import { api, Category, Product } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function HomePage() {
  const { t, lang } = useI18n();
  const [categories, setCategories] = useState<Category[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getDeals(1, 0)])
      .then(([cats, dealsRes]) => {
        setCategories(cats);
        setDeals(dealsRes.products);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[150px]" />
          <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-purple-500/[0.02] rounded-full blur-[100px]" />

          <div className="relative container-main py-24 sm:py-32 text-center">
            <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-gray-400 font-medium">{t('hero.trending')}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
              {lang === 'ar' ? (
                <>
                  قارن أسعار الألعاب
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">في السعودية</span>
                </>
              ) : (
                <>
                  Compare Gaming Prices
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-emerald-300 bg-clip-text text-transparent">in Saudi Arabia</span>
                </>
              )}
            </h1>

            <p className="text-gray-500 text-base sm:text-lg max-w-xl mx-auto mb-12 leading-relaxed">
              {t('site.subtitle')}
            </p>

            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/deals" className="btn-primary text-sm flex items-center gap-2">
                {t('hero.cta')}
                <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/categories" className="btn-secondary text-sm">
                {t('hero.cta2')}
              </Link>
            </div>
          </div>
        </section>

        <div className="glow-line container-main" />

        <section className="container-main py-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">{t('nav.categories')}</h2>
            <Link href="/categories" className="text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors flex items-center gap-1">
              {t('common.seeAll')}
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-glass p-6 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] mx-auto mb-3" />
                  <div className="h-3.5 bg-white/[0.04] rounded-full mx-auto w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          )}
        </section>

        <section className="container-main py-14">
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
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-[4/3] bg-gradient-to-b from-white/[0.02] to-transparent rounded-t-2xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-white/[0.04] rounded-full w-2/3" />
                    <div className="h-5 bg-white/[0.04] rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {deals.slice(0, 8).map((product) => (
                <ProductCard key={product.asin} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
