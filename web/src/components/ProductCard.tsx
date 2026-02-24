'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/lib/api';
import { calculateValueScore, getValueBadge, analyzePriceHistory, formatPrice, type PriceHistoryEntry } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [imageError, setImageError] = useState(false);

  // Fetch price history
  useEffect(() => {
    fetch(`https://sbgamers-api.ghmeshal7.workers.dev/api/v1/price-history/${product.asin}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.history) {
          setPriceHistory(data.data.history.map((h: any) => ({
            price: h.price,
            timestamp: h.timestamp
          })));
        }
      })
      .catch(() => {});
  }, [product.asin]);

  // Calculate value score
  const valueScore = calculateValueScore(
    product.current_price,
    product.original_price,
    product.rating,
    product.discount_pct
  );
  const valueBadge = getValueBadge(valueScore);

  // Analyze price trend
  const priceTrend = analyzePriceHistory(product.current_price, priceHistory);

  const hasDiscount = product.discount_pct > 0 && product.original_price > product.current_price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card-premium group"
    >
      <Link href={`/product/${product.asin}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square bg-secondary/30 overflow-hidden">
          <img
            src={imageError ? '/placeholder-product.png' : product.image_url}
            alt={product.title}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImageError(true)}
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 z-10">
            <div className="flex flex-col gap-2">
              {valueBadge && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={valueBadge.className}
                >
                  <span>{valueBadge.icon}</span>
                  <span>{valueBadge.label}</span>
                </motion.div>
              )}

              {hasDiscount && (
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-lg shadow-red-500/20">
                  <span>-{product.discount_pct}%</span>
                </div>
              )}
            </div>

            {product.is_prime && (
              <div className="px-2 py-1 rounded-md text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                Prime
              </div>
            )}
          </div>

          {/* Price Trend Indicator */}
          {priceHistory.length > 0 && (
            <div className="absolute bottom-3 right-3">
              <div className={`${priceTrend.className} px-2 py-1 rounded-md text-xs font-bold bg-black/60 backdrop-blur-sm`}>
                <span>{priceTrend.icon}</span>
                <span>{priceTrend.percentageChange.toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Category */}
          {product.category_name && (
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {product.category_name}
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">
            {product.title}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating)
                        ? 'text-primary fill-primary'
                        : 'text-border fill-border'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.ratings_total.toLocaleString()})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-primary">
              {formatPrice(product.current_price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          {/* Value Score */}
          {valueScore > 0 && (
            <div className="text-xs text-muted-foreground">
              Value Score: <span className="text-primary font-bold">{valueScore}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
