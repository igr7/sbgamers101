'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);

  const hasDiscount = product.discount_pct > 0 && product.original_price > product.current_price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-brutal group"
    >
      <Link href={`/product/${product.asin}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square bg-secondary overflow-hidden">
          <img
            src={imageError ? '/placeholder-product.png' : product.image_url}
            alt={product.title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImageError(true)}
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-2">
              {hasDiscount && (
                <div className="discount-badge">
                  -{product.discount_pct}%
                </div>
              )}
              {product.is_best_seller && (
                <div className="inline-flex items-center px-2 py-1 bg-foreground text-background text-[10px] font-bold uppercase tracking-wider">
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
        <div className="p-4 space-y-3 bg-card">
          {/* Category */}
          {product.category_name && (
            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              {product.category_name}
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem] leading-tight">
            {product.title}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating)
                        ? 'bg-foreground'
                        : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                ({product.ratings_total.toLocaleString()})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="pt-2 border-t-2 border-border">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="price-tag">
                {formatPrice(product.current_price)}
              </span>
              <span className="text-xs text-muted-foreground font-mono">SAR</span>
            </div>
            {hasDiscount && (
              <div className="text-xs text-muted-foreground font-mono line-through">
                {formatPrice(product.original_price)} SAR
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
