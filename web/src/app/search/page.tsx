'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, Product } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import Pagination from '@/components/Pagination';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { t, lang } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .searchProducts(query, page)
      .then((res) => {
        setProducts(res.products);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query, page]);

  return (
    <main className="flex-1 container-main py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">
          {query ? (
            <>
              {lang === 'ar' ? 'نتائج البحث عن' : 'Results for'}{' '}
              <span className="text-emerald-400">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            t('nav.search')
          )}
        </h1>
        {total > 0 && (
          <p className="text-sm text-gray-600">
            {total} {t('common.products')}
          </p>
        )}
      </div>

      <ProductGrid products={products} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </main>
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      }>
        <SearchResults />
      </Suspense>
      <Footer />
    </>
  );
}
