'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  const hasDiscount = product.discount_pct > 0 && product.original_price > product.current_price;

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #333',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const imageContainerStyle: React.CSSProperties = {
    position: 'relative',
    height: '200px',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    borderBottom: '1px solid #333',
  };

  const imageStyle: React.CSSProperties = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  };

  const discountBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    left: '8px',
    backgroundColor: '#dc2626',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  };

  const primeBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: '#0ea5e9',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
  };

  const contentStyle: React.CSSProperties = {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
  };

  const categoryStyle: React.CSSProperties = {
    fontSize: '10px',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: 'bold',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#fff',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minHeight: '40px',
    fontWeight: '500',
  };

  const ratingContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const starContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '2px',
  };

  const starStyle = (filled: boolean): React.CSSProperties => ({
    width: '12px',
    height: '12px',
    backgroundColor: filled ? '#fbbf24' : '#333',
  });

  const ratingTextStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#888',
  };

  const priceContainerStyle: React.CSSProperties = {
    marginTop: 'auto',
    paddingTop: '12px',
    borderTop: '1px solid #333',
  };

  const currentPriceStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#10b981',
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  };

  const currencyStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#888',
  };

  const originalPriceStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    textDecoration: 'line-through',
    marginTop: '4px',
  };

  const fallbackImageStyle: React.CSSProperties = {
    width: '64px',
    height: '64px',
    color: '#444',
  };

  return (
    <div style={cardStyle}>
      <Link href={`/product/${product.asin}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Image Container */}
        <div style={imageContainerStyle}>
          {imageError ? (
            <svg style={fallbackImageStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ) : (
            <img
              src={product.image_url}
              alt={product.title}
              style={imageStyle}
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}

          {/* Badges */}
          {hasDiscount && (
            <div style={discountBadgeStyle}>
              -{product.discount_pct}%
            </div>
          )}
          {product.is_prime && (
            <div style={primeBadgeStyle}>
              PRIME
            </div>
          )}
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Category */}
          {product.category_name && (
            <div style={categoryStyle}>
              {product.category_name}
            </div>
          )}

          {/* Title */}
          <div style={titleStyle}>
            {product.title}
          </div>

          {/* Rating */}
          {product.rating > 0 && (
            <div style={ratingContainerStyle}>
              <div style={starContainerStyle}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    style={starStyle(i < Math.floor(product.rating))}
                  />
                ))}
              </div>
              <span style={ratingTextStyle}>
                ({product.ratings_total.toLocaleString()})
              </span>
            </div>
          )}

          {/* Price */}
          <div style={priceContainerStyle}>
            <div style={currentPriceStyle}>
              <span>{formatPrice(product.current_price)}</span>
              <span style={currencyStyle}>SAR</span>
            </div>
            {hasDiscount && (
              <div style={originalPriceStyle}>
                {formatPrice(product.original_price)} SAR
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
