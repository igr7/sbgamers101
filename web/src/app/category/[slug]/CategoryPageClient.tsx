'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Product } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import FilterSidebar, { Filters } from '@/components/FilterSidebar';

export default function CategoryPageClient() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categoryName, setCategoryName] = useState('');
  const [filters, setFilters] = useState<Filters>({ sort: 'discount_desc' });

  useEffect(() => {
    setLoading(true);
    api.getCategoryProducts(slug, page, filters.sort)
      .then((res) => {
        setProducts(res.products);
        setTotalPages(res.totalPages);
        setTotal(res.total);
        if (res.products[0]?.category_name) setCategoryName(res.products[0].category_name);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, page, filters.sort]);

  const applyFilters = useCallback((prods: Product[], f: Filters) => {
    let result = [...prods];
    if (f.min_price) result = result.filter(p => p.current_price >= f.min_price!);
    if (f.max_price) result = result.filter(p => p.current_price <= f.max_price!);
    if (f.min_discount) result = result.filter(p => p.discount_pct >= f.min_discount!);
    if (f.min_rating) result = result.filter(p => p.rating >= f.min_rating!);
    return result;
  }, []);

  useEffect(() => {
    setFiltered(applyFilters(products, filters));
  }, [products, filters, applyFilters]);

  return (
    <>
      <Navbar />
      <main className="flex-1 container-main py-8">
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-400">{t('nav.home')}</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-gray-400">{t('nav.categories')}</Link>
          <span>/</span>
          <span className="text-gray-400">{categoryName || slug}</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">{categoryName || slug}</h1>
          <p className="text-sm text-gray-500 mt-1">{total} {t('common.products')}</p>
        </div>

        <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />

        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-[#111118] border border-white/[0.06] rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-white/[0.03]" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-white/[0.04] rounded w-full" />
                      <div className="h-3 bg-white/[0.04] rounded w-2/3" />
                      <div className="h-5 bg-white/[0.06] rounded w-20 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">{t('common.noResults')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product) => (
                  <ProductCard key={product.asin} product={product} />
                ))}
              </div>
            )}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
