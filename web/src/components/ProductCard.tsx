'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface Product {
  asin: string;
  title: string;
  image_url: string;
  current_price: number;
  original_price: number;
  discount_pct: number;
  rating: number;
  ratings_total: number;
  is_prime: boolean;
  amazon_url: string;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#1a1a2e',
  border: '1px solid #2a2a3e',
  borderRadius: '12px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  transition: 'transform 0.2s',
  position: 'relative',
  height: '100%'
};

const imageContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '200px',
  backgroundColor: '#0f0f1a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  position: 'relative'
};

const imageStyle: React.CSSProperties = {
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  padding: '10px'
};

const discountBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  backgroundColor: '#ff4757',
  color: '#fff',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold'
};

const primeBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '8px',
  right: '8px',
  backgroundColor: '#00d2d3',
  color: '#000',
  padding: '3px 6px',
  borderRadius: '3px',
  fontSize: '10px',
  fontWeight: 'bold'
};

const contentStyle: React.CSSProperties = {
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flex: 1
};

const titleStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#e4e4e7',
  lineHeight: '1.4',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  minHeight: '36px'
};

const ratingContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const starStyle: React.CSSProperties = {
  width: '12px',
  height: '12px',
  display: 'inline-block'
};

const reviewCountStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#a1a1aa'
};

const priceRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px',
  marginTop: 'auto'
};

const currentPriceStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#10b981'
};

const originalPriceStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#71717a',
  textDecoration: 'line-through'
};

const loadingSpinnerStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  border: '3px solid #2a2a3e',
  borderTop: '3px solid #00d2d3',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

export default function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasDiscount = product.discount_pct > 0 && product.original_price > product.current_price;

  // Use image proxy for faster loading via Cloudflare edge cache
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://sbgamers-api.ghmeshal7.workers.dev';
  const proxyImageUrl = product.image_url
    ? `${API_BASE}/api/v1/image-proxy?url=${encodeURIComponent(product.image_url)}`
    : '/placeholder.png';

  return (
    <div style={cardStyle} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <Link href={`/product/${product.asin}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={imageContainerStyle}>
          {!imageLoaded && !imageError && (
            <div style={loadingSpinnerStyle} />
          )}

          <img
            src={proxyImageUrl}
            alt={product.title}
            style={{ ...imageStyle, display: imageLoaded ? 'block' : 'none' }}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = '/placeholder.png';
              setImageError(true);
              setImageLoaded(true);
            }}
          />

          {hasDiscount && <div style={discountBadgeStyle}>-{product.discount_pct}%</div>}
          {product.is_prime && <div style={primeBadgeStyle}>Prime</div>}
        </div>

        <div style={contentStyle}>
          <div style={titleStyle}>{product.title}</div>

          {product.rating > 0 && (
            <div style={ratingContainerStyle}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ ...starStyle, backgroundColor: i < Math.floor(product.rating) ? '#fbbf24' : '#3f3f46' }} />
                ))}
              </div>
              <span style={reviewCountStyle}>({product.ratings_total.toLocaleString()})</span>
            </div>
          )}

          <div style={priceRowStyle}>
            <span style={currentPriceStyle}>{formatPrice(product.current_price)} SAR</span>
            {hasDiscount && (
              <span style={originalPriceStyle}>{formatPrice(product.original_price)} SAR</span>
            )}
          </div>
        </div>
      </Link>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
