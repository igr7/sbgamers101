'use client';

import Link from 'next/link';
import { Product } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatPrice } from '@/lib/utils';

const AFFILIATE_TAG = 'sbgamers-21';

function getAffiliateUrl(amazonUrl: string): string {
  try {
    const url = new URL(amazonUrl);
    url.searchParams.set('tag', AFFILIATE_TAG);
    return url.toString();
  } catch {
    return amazonUrl;
  }
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-700'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count > 0 && <span className="text-xs text-gray-500">({count.toLocaleString()})</span>}
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useI18n();
  const hasDiscount = product.discount_pct > 0 && product.original_price > product.current_price;

  return (
    <div className="group bg-[#111118] border border-white/[0.06] rounded-xl overflow-hidden hover:border-emerald-500/20 transition-all duration-200 flex flex-col">
      {/* Image */}
      <Link href={`/product/${product.asin}`} className="block relative">
        <div className="relative aspect-square bg-white/[0.02] p-4 flex items-center justify-center">
          {hasDiscount && (
            <span className="absolute top-2 start-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              -{product.discount_pct}%
            </span>
          )}
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="text-4xl opacity-20">📦</div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1 gap-1.5">
        <Link href={`/product/${product.asin}`}>
          <h3 className="text-sm text-gray-300 line-clamp-2 leading-snug hover:text-white transition-colors">
            {product.title}
          </h3>
        </Link>

        {product.rating > 0 && (
          <StarRating rating={product.rating} count={product.ratings_total} />
        )}

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-white">
              {formatPrice(product.current_price, lang)}
              <span className="text-[10px] font-normal text-gray-500 ms-1">{t('common.sar')}</span>
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-600 line-through">
                {formatPrice(product.original_price, lang)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
