'use client';

import { Product } from '@/lib/api';
import ProductCard from './ProductCard';
import { useI18n } from '@/lib/i18n';

interface Props {
  products: Product[];
  loading?: boolean;
}

function Skeleton() {
  return (
    <div className="card animate-pulse">
      <div className="aspect-[4/3] bg-gradient-to-b from-white/[0.02] to-transparent rounded-t-2xl relative overflow-hidden">
        <div className="skeleton-shimmer absolute inset-0" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-2 bg-white/[0.04] rounded-full w-16" />
        <div className="h-3.5 bg-white/[0.04] rounded-full w-full" />
        <div className="h-3.5 bg-white/[0.04] rounded-full w-3/4" />
        <div className="flex gap-0.5 mt-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-white/[0.03]" />
          ))}
        </div>
        <div className="h-5 bg-white/[0.06] rounded-full w-24 mt-3" />
      </div>
    </div>
  );
}

export default function ProductGrid({ products, loading }: Props) {
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium text-lg">{t('common.noResults')}</p>
        <p className="text-gray-700 text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
      {products.map((product) => (
        <ProductCard key={product.asin} product={product} />
      ))}
    </div>
  );
}
