'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Product } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatPrice } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PriceChart from '@/components/PriceChart';

export default function ProductPage() {
  const { asin } = useParams<{ asin: string }>();
  const { lang, t } = useI18n();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProduct(asin)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 container-main py-12">
          <div className="animate-pulse grid md:grid-cols-2 gap-10">
            <div className="aspect-square bg-white/[0.03] rounded-2xl" />
            <div className="space-y-5">
              <div className="h-4 bg-white/[0.04] rounded-full w-24" />
              <div className="h-7 bg-white/[0.04] rounded-full w-full" />
              <div className="h-7 bg-white/[0.04] rounded-full w-2/3" />
              <div className="h-10 bg-white/[0.06] rounded-full w-40 mt-6" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="flex-1 container-main py-20 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.04] flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Product not found</p>
        </main>
        <Footer />
      </>
    );
  }

  const hasDiscount = product.discount_pct > 0 && product.original_price > product.current_price;

  return (
    <>
      <Navbar />
      <main className="flex-1 container-main py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-8 flex-wrap">
          <Link href="/" className="hover:text-gray-400 transition-colors">{t('nav.home')}</Link>
          <svg className="w-3 h-3 rtl:rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href={`/category/${product.category_slug}`} className="hover:text-gray-400 transition-colors">{product.category_name}</Link>
          <svg className="w-3 h-3 rtl:rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-500 truncate max-w-xs">{product.title}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
          {/* Image */}
          <div className="bg-white rounded-2xl p-8 lg:p-12 flex items-center justify-center sticky top-24 self-start">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="max-h-[400px] object-contain"
              />
            ) : (
              <div className="text-6xl opacity-20">📦</div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Category badge */}
            <span className="inline-block text-[11px] font-semibold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full">
              {product.category_name}
            </span>

            {/* Title */}
            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight">
              {product.title}
            </h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-700'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating} <span className="text-gray-700">({product.ratings_total.toLocaleString()} {t('product.reviews')})</span>
                </span>
              </div>
            )}

            {/* Price Card */}
            <div className="bg-white/[0.03] rounded-2xl border border-white/[0.06] p-6 space-y-3">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl lg:text-4xl font-black text-white tabular-nums">
                  {formatPrice(product.current_price, lang)}
                </span>
                <span className="text-lg text-gray-500 font-medium">{t('common.sar')}</span>
                {hasDiscount && (
                  <span className="badge-discount text-sm">
                    -{product.discount_pct}% {t('product.off')}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-gray-600 text-sm">
                  {t('product.was')}{' '}
                  <span className="line-through">{formatPrice(product.original_price, lang)} {t('common.sar')}</span>
                </p>
              )}
            </div>

            {/* CTA Button */}
            <a
              href={product.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto text-center"
            >
              {t('product.viewDeal')}
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Last updated */}
            <p className="text-[11px] text-gray-700">
              {lang === 'ar' ? 'آخر تحديث' : 'Last updated'}: {new Date(product.last_updated).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Price History */}
        <div className="mt-14">
          <PriceChart
            asin={product.asin}
            currentPrice={product.current_price}
            originalPrice={product.original_price}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
