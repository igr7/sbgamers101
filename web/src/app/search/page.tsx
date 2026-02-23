'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, Product } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import FilterSidebar, { Filters } from '@/components/FilterSidebar';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { t, lang } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<Filters>({ sort: 'relevance' });

  useEffect(() => {
    if (!query) { setProducts([]); setLoading(false); return; }
    setLoading(true);
    setPage(1);
    api.searchProducts(query, 1)
      .then((res) => {
        setProducts(res.products);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

  // Client-side filtering
  const applyFilters = useCallback((prods: Product[], f: Filters) => {
    let result = [...prods];
    if (f.min_price) result = result.filter(p => p.current_price >= f.min_price!);
    if (f.max_price) result = result.filter(p => p.current_price <= f.max_price!);
    if (f.min_discount) result = result.filter(p => p.discount_pct >= f.min_discount!);
    if (f.min_rating) result = result.filter(p => p.rating >= f.min_rating!);
    // Sort
    switch (f.sort) {
      case 'price_asc': result.sort((a, b) => a.current_price - b.current_price); break;
      case 'price_desc': result.sort((a, b) => b.current_price - a.current_price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'most_reviewed': result.sort((a, b) => b.ratings_total - a.ratings_total); break;
    }
    return result;
  }, []);

  useEffect(() => {
    setFiltered(applyFilters(products, filters));
  }, [products, filters, applyFilters]);

  return (
    <main className="flex-1 container-main py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">
          {query ? (
            <>
              {t('search.resultsFor')}{' '}
              <span className="text-emerald-400">&ldquo;{query}&rdquo;</span>
            </>
          ) : t('nav.search')}
        </h1>
        {total > 0 && <p className="text-sm text-gray-500 mt-1">{total} {t('common.products')}</p>}
      </div>

      <FilterSidebar filters={filters} onChange={setFilters} />

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
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }>
        <SearchResults />
      </Suspense>
      <Footer />
    </>
  );
}
