'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  const hasDiscount = product.discount_pct > 0 && product.original_price > product.current_price;

  return (
    <div className="card-brutal overflow-hidden h-full flex flex-col">
      <Link href={`/product/${product.asin}`} className="flex flex-col h-full">
        {/* Image Container */}
        <div className="relative aspect-square bg-white border-b-2 border-border overflow-hidden">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-white">
              <svg className="w-16 h-16 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          ) : (
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none">
            <div className="flex flex-col gap-1">
              {hasDiscount && (
                <div className="discount-badge">
                  -{product.discount_pct}%
                </div>
              )}
              {product.is_best_seller && (
                <div className="inline-flex items-center px-2 py-1 bg-foreground text-background text-[10px] font-black uppercase tracking-wider">
                  Best
                </div>
              )}
            </div>

            {product.is_prime && (
              <div className="prime-badge">
                Prime
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 bg-card flex-1 flex flex-col">
          {/* Category */}
          {product.category_name && (
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {product.category_name}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors leading-tight flex-1">
            {product.title}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                      i < Math.floor(product.rating) ? 'bg-accent' : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                ({product.ratings_total.toLocaleString()})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="pt-2 border-t-2 border-border mt-auto">
            <div className="flex items-baseline gap-1.5 sm:gap-2 mb-1">
              <span className="text-lg sm:text-xl font-black text-foreground text-mono">
                {formatPrice(product.current_price)}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">SAR</span>
            </div>
            {hasDiscount && (
              <div className="text-[10px] sm:text-xs text-muted-foreground font-mono line-through">
                {formatPrice(product.original_price)} SAR
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
