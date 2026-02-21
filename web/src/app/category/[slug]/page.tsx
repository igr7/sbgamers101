'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Product } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGrid from '@/components/ProductGrid';
import SortSelect from '@/components/SortSelect';
import Pagination from '@/components/Pagination';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('discount');
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .getCategoryProducts(slug, page, sort)
      .then((res) => {
        setProducts(res.products);
        setTotalPages(res.totalPages);
        setTotal(res.total);
        if (res.products[0]?.category_name) {
          setCategoryName(res.products[0].category_name);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug, page, sort]);

  return (
    <>
      <Navbar />
      <main className="flex-1 container-main py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-400 transition-colors">{t('nav.home')}</Link>
          <svg className="w-3 h-3 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <Link href="/categories" className="hover:text-gray-400 transition-colors">{t('nav.categories')}</Link>
          <svg className="w-3 h-3 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-400">{categoryName || slug}</span>
        </div>

        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{categoryName || slug}</h1>
            <p className="text-sm text-gray-600">{total} {t('common.products')}</p>
          </div>
          <SortSelect value={sort} onChange={(v) => { setSort(v); setPage(1); }} />
        </div>

        <ProductGrid products={products} loading={loading} />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </main>
      <Footer />
    </>
  );
}
