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
    <div className="card-brutal overflow-hidden animate-pulse">
      <div className="aspect-square bg-secondary border-b-2 border-border" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-secondary w-3/4" />
        <div className="h-3 bg-secondary w-1/2" />
        <div className="h-6 bg-secondary w-1/3 mt-4" />
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
      <div className="text-center py-20 card-brutal">
        <div className="w-20 h-20 mx-auto mb-5 border-2 border-border bg-secondary flex items-center justify-center">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-foreground font-black text-lg uppercase tracking-wide mb-2">{t('common.noResults')}</p>
        <p className="text-muted-foreground text-sm font-semibold">Try adjusting your filters</p>
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
