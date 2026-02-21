'use client';

import { useEffect, useState } from 'react';
import { api, Product } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import Pagination from '@/components/Pagination';

const DISCOUNT_OPTIONS = [
  { value: 0, labelEn: 'All Deals', labelAr: 'جميع العروض' },
  { value: 10, labelEn: '10%+', labelAr: '10%+' },
  { value: 15, labelEn: '15%+', labelAr: '15%+' },
  { value: 20, labelEn: '20%+', labelAr: '20%+' },
  { value: 25, labelEn: '25%+', labelAr: '25%+' },
];

export default function DealsPage() {
  const { t, lang } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setPage(1);
  }, [minDiscount]);

  useEffect(() => {
    setLoading(true);
    api
      .getDeals(page, minDiscount)
      .then((res) => {
        setProducts(res.products);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, minDiscount]);

  return (
    <>
      <Navbar />
      <main className="flex-1 container-main py-8">
        <div className="page-header">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('deals.title')}</h1>
                <p className="text-sm text-gray-500">{t('deals.subtitle')}</p>
              </div>
            </div>
            {total > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="text-emerald-400 font-semibold">{total}</span>
                <span>{t('common.products')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="glow-line mb-6" />

        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium me-2">
            {t('filter.minDiscount')}:
          </span>
          {DISCOUNT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMinDiscount(opt.value)}
              className={`filter-chip ${minDiscount === opt.value ? 'filter-chip-active' : ''}`}
            >
              {lang === 'ar' ? opt.labelAr : opt.labelEn}
            </button>
          ))}
        </div>

        <ProductGrid products={products} loading={loading} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </main>
      <Footer />
    </>
  );
}
