'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, ProductFull } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatPrice } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PriceChart from '@/components/PriceChart';

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`${cls} ${s <= Math.round(rating) ? 'text-amber-400' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProductPageClient() {
  const { asin } = useParams<{ asin: string }>();
  const { lang, t } = useI18n();
  const [product, setProduct] = useState<ProductFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    api.getProduct(asin)
      .then((p) => { setProduct(p); if (p) setSelectedImage(p.image_url); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [asin]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 container-main py-10">
          <div className="animate-pulse grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-white/[0.03] rounded-xl" />
            <div className="space-y-4">
              <div className="h-4 bg-white/[0.04] rounded w-24" />
              <div className="h-6 bg-white/[0.04] rounded w-full" />
              <div className="h-6 bg-white/[0.04] rounded w-2/3" />
              <div className="h-10 bg-white/[0.06] rounded w-40 mt-4" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="flex-1 container-main py-20 text-center">
          <p className="text-gray-500">Product not found</p>
          <Link href="/" className="text-emerald-500 text-sm mt-4 inline-block">{t('nav.home')}</Link>
        </main>
        <Footer />
      </>
    );
  }

  const hasDiscount = product.discount_pct > 0 && product.original_price > product.current_price;
  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);

  return (
    <>
      <Navbar />
      <main className="flex-1 container-main py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-6 flex-wrap">
          <Link href="/" className="hover:text-gray-400">{t('nav.home')}</Link>
          <span className="rtl:rotate-180">/</span>
          {product.category_name && (
            <>
              <span className="text-gray-500">{product.category_name}</span>
              <span className="rtl:rotate-180">/</span>
            </>
          )}
          <span className="text-gray-500 truncate max-w-[200px]">{product.title}</span>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-6 flex items-center justify-center aspect-square">
              <img src={selectedImage || product.image_url} alt={product.title} className="max-h-full max-w-full object-contain" />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`shrink-0 w-16 h-16 rounded-lg border-2 p-1 bg-white/5 transition-colors ${
                      selectedImage === img ? 'border-emerald-500' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.is_prime && (
                <span className="text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded">Prime</span>
              )}
              {product.is_best_seller && (
                <span className="text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded">Best Seller</span>
              )}
              {product.is_amazon_choice && (
                <span className="text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded">Amazon Choice</span>
              )}
            </div>

            {product.brand && (
              <p className="text-xs text-gray-500 uppercase tracking-wider">{product.brand}</p>
            )}

            <h1 className="text-xl lg:text-2xl font-bold text-white leading-tight">{product.title}</h1>

            {product.rating > 0 && (
              <div className="flex items-center gap-2">
                <StarRating rating={product.rating} size="md" />
                <span className="text-sm text-gray-400">{product.rating}</span>
                <span className="text-sm text-gray-600">({product.ratings_total.toLocaleString()} {t('product.reviews')})</span>
              </div>
            )}

            {/* Price Box */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-black text-white">{formatPrice(product.current_price, lang)}</span>
                <span className="text-sm text-gray-500">{t('common.sar')}</span>
                {hasDiscount && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">-{product.discount_pct}%</span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-gray-600 text-sm mt-1">
                  {t('product.was')} <span className="line-through">{formatPrice(product.original_price, lang)} {t('common.sar')}</span>
                </p>
              )}
              {product.availability && (
                <p className="text-emerald-400 text-xs mt-2">{product.availability}</p>
              )}
            </div>

            {/* Buy Button */}
            <a
              href={product.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2 w-full text-center text-base"
            >
              {t('product.buyNow')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Key Features */}
            {product.key_features.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">{t('product.features')}</h3>
                <ul className="space-y-1.5">
                  {product.key_features.slice(0, 5).map((f, i) => (
                    <li key={i} className="text-sm text-gray-500 flex gap-2">
                      <span className="text-emerald-500 mt-0.5 shrink-0">&#8226;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Price History */}
        <div className="mt-12">
          <PriceChart asin={product.asin} currentPrice={product.current_price} originalPrice={product.original_price} />
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-white mb-3">{t('product.description')}</h2>
            <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {/* Reviews */}
        {product.top_reviews.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-white mb-4">{t('product.reviews')}</h2>
            <div className="space-y-4">
              {product.top_reviews.slice(0, 5).map((review) => (
                <div key={review.review_id} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-sm font-medium text-gray-300">{review.review_title}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{review.review_text}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                    <span>{review.reviewer_name}</span>
                    {review.is_verified_purchase && (
                      <span className="text-emerald-500">{lang === 'ar' ? 'شراء موثق' : 'Verified'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {product.frequently_bought_together.length > 0 && (
          <div className="mt-10 pb-10">
            <h2 className="text-lg font-bold text-white mb-4">{t('product.relatedProducts')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {product.frequently_bought_together.map((item) => (
                <Link
                  key={item.asin}
                  href={`/product/${item.asin}`}
                  className="bg-[#111118] border border-white/[0.06] rounded-xl overflow-hidden hover:border-emerald-500/20 transition-colors"
                >
                  <div className="aspect-square bg-white/[0.02] p-3 flex items-center justify-center">
                    {item.image_url && <img src={item.image_url} alt={item.title} className="max-h-full max-w-full object-contain" loading="lazy" />}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs text-gray-400 line-clamp-2">{item.title}</h3>
                    {item.price > 0 && (
                      <p className="text-sm font-bold text-white mt-1">{formatPrice(item.price, lang)} <span className="text-[10px] text-gray-500">{t('common.sar')}</span></p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
