'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SanitizedProduct } from '@/lib/productWrapper';
import { ErrorBoundary, ProductCardErrorFallback } from '@/components/ErrorBoundary';

interface Props {
  product: SanitizedProduct;
  index?: number;
}

export default function PremiumProductCard({ product, index = 0 }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <ErrorBoundary fallback={<ProductCardErrorFallback />}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group relative"
      >
      {/* Hover Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

      <div className="relative bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 flex flex-col h-full">
        {/* Image Container */}
        <Link href={`/product/${product.asin}`} className="block relative">
          <div className="relative aspect-square bg-gradient-to-br from-white/[0.03] to-transparent p-6 overflow-hidden">
            {/* Badges */}
            <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
              {product.hasDiscount && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur-md opacity-60" />
                  <div className="relative bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg">
                    -{product.discountPercentage}%
                  </div>
                </motion.div>
              )}

              {product.isBestSeller && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg blur-md opacity-50" />
                  <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wide">
                    Best Seller
                  </div>
                </div>
              )}

              {product.isAmazonChoice && (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur-md opacity-50" />
                  <div className="relative bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wide">
                    Amazon's Choice
                  </div>
                </div>
              )}
            </div>

            {/* Stock Status Badge */}
            {product.stockStatus !== 'in_stock' && (
              <div className="absolute top-3 right-3 z-20">
                <div className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide ${
                  product.stockStatus === 'low_stock'
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {product.stockStatus === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                </div>
              </div>
            )}

            {/* Product Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                </div>
              )}

              {imageError ? (
                <div className="flex flex-col items-center justify-center text-gray-600">
                  <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Image unavailable</span>
                </div>
              ) : (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className={`max-w-full max-h-full object-contain transition-all duration-500 ${
                    imageLoaded ? 'opacity-100 scale-100 group-hover:scale-110' : 'opacity-0 scale-95'
                  }`}
                  loading="lazy"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1 gap-3">
          {/* Brand */}
          {product.brand && (
            <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
              {product.brand}
            </div>
          )}

          {/* Title */}
          <Link href={`/product/${product.asin}`}>
            <h3 className="text-sm font-semibold text-gray-200 line-clamp-2 leading-snug hover:text-white transition-colors min-h-[2.5rem]">
              {product.title}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(product.rating)
                        ? 'text-amber-400'
                        : 'text-gray-700'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.ratingsCount.toLocaleString()})
              </span>
            </div>
          )}

          {/* Prime Badge */}
          {product.isPrime && (
            <div className="flex items-center gap-1.5">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                Prime
              </div>
              <span className="text-[10px] text-gray-500">Free Shipping</span>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price Section */}
          <div className="space-y-2">
            {product.hasDiscount && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 line-through">
                  {product.priceFormatted}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  Save {product.savingsAmount.toFixed(0)} SAR
                </span>
              </div>
            )}

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {product.price.toFixed(0)}
              </span>
              <span className="text-xs text-gray-500 font-medium">SAR</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href={`/product/${product.asin}`}
            className="group/btn relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-400 hover:text-cyan-300 font-bold text-sm py-2.5 rounded-xl transition-all duration-300 text-center">
              View Details
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
    </ErrorBoundary>
  );
}
