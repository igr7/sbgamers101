'use client';

import Link from 'next/link';
import { Product } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useI18n();
  const hasDiscount = product.discount_pct > 0 && product.original_price > product.current_price;

  return (
    <Link href={`/product/${product.asin}`} className="card group flex flex-col relative">
      {hasDiscount && (
        <div className="absolute top-3 start-3 z-10 badge-discount flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          -{product.discount_pct}%
        </div>
      )}

      <div className="relative aspect-[4/3] bg-gradient-to-b from-white/[0.02] to-transparent rounded-t-2xl p-5 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="text-5xl opacity-20">📦</div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2 bg-gradient-to-b from-transparent to-black/20">
        <span className="text-[10px] font-semibold text-emerald-500/80 uppercase tracking-widest">
          {product.category_name}
        </span>

        <h3 className="text-sm font-medium text-gray-300 line-clamp-2 leading-snug group-hover:text-white transition-colors duration-200">
          {product.title}
        </h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 mt-auto">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-700/50'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[10px] text-gray-600">
              ({product.ratings_total.toLocaleString()})
            </span>
          </div>
        )}

        <div className="flex items-baseline gap-2 mt-2 flex-wrap">
          <span className="text-lg font-bold text-white">
            {formatPrice(product.current_price, lang)}
            <span className="text-xs font-normal text-gray-500 ms-1">{t('common.sar')}</span>
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-600 line-through">
              {formatPrice(product.original_price, lang)}
            </span>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500/30 transition-all duration-300" />
    </Link>
  );
}
