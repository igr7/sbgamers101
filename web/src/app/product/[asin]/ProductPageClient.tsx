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
import { ErrorBoundary } from '@/components/ErrorBoundary';

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`${cls} ${s <= Math.round(rating) ? 'text-accent' : 'text-border'}`} fill="currentColor" viewBox="0 0 20 20">
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
            <div className="aspect-square bg-secondary border-2 border-border" />
            <div className="space-y-4">
              <div className="h-4 bg-secondary w-24" />
              <div className="h-6 bg-secondary w-full" />
              <div className="h-6 bg-secondary w-2/3" />
              <div className="h-10 bg-secondary w-40 mt-4" />
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
          <div className="card-brutal p-12">
            <div className="text-7xl mb-6">❌</div>
            <h2 className="text-2xl font-black uppercase mb-3">Product Not Found</h2>
            <p className="text-muted-foreground mb-6 font-semibold">The product you're looking for doesn't exist.</p>
            <Link href="/" className="btn-primary inline-block">{t('nav.home')}</Link>
          </div>
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
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6 flex-wrap font-bold uppercase tracking-wider overflow-x-auto">
          <Link href="/" className="hover:text-foreground transition-colors whitespace-nowrap">{t('nav.home')}</Link>
          <span>/</span>
          {product.category_name && (
            <>
              <span className="hover:text-foreground transition-colors cursor-pointer whitespace-nowrap">{product.category_name}</span>
              <span>/</span>
            </>
          )}
          <span className="text-foreground truncate">{product.title}</span>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="bg-white border-2 border-border p-4 sm:p-6 flex items-center justify-center aspect-square">
              <img src={selectedImage || product.image_url} alt={product.title} className="max-h-full max-w-full object-contain" />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.slice(0, 6).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 border-2 p-1 bg-white transition-colors ${
                      selectedImage === img ? 'border-accent' : 'border-border hover:border-foreground'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 sm:space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.is_prime && (
                <span className="text-xs font-black bg-primary text-background border-2 border-border px-3 py-1 uppercase tracking-wider">Prime</span>
              )}
              {product.is_best_seller && (
                <span className="text-xs font-black bg-accent text-background border-2 border-border px-3 py-1 uppercase tracking-wider">Best Seller</span>
              )}
              {product.is_amazon_choice && (
                <span className="text-xs font-black bg-foreground text-background border-2 border-border px-3 py-1 uppercase tracking-wider">Amazon Choice</span>
              )}
            </div>

            {product.brand && (
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-black">{product.brand}</p>
            )}

            <h1 className="text-lg sm:text-xl lg:text-2xl font-black text-foreground leading-tight uppercase break-words">{product.title}</h1>

            {product.rating > 0 && (
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} size="md" />
                <span className="text-sm text-foreground font-black text-mono">{product.rating}</span>
                <span className="text-xs sm:text-sm text-muted-foreground font-bold">({product.ratings_total.toLocaleString()} {t('product.reviews')})</span>
              </div>
            )}

            {/* Price Box */}
            <div className="card-brutal p-4 sm:p-5 border-l-4 border-accent">
              <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-foreground text-mono">{formatPrice(product.current_price, lang)}</span>
                <span className="text-xs sm:text-sm text-muted-foreground font-bold uppercase tracking-wider">{t('common.sar')}</span>
                {hasDiscount && (
                  <span className="bg-destructive text-background text-xs font-black px-2 sm:px-3 py-1 uppercase tracking-wider">-{product.discount_pct}%</span>
                )}
              </div>
              {hasDiscount && (
                <p className="text-muted-foreground text-xs sm:text-sm mt-2 font-semibold">
                  {t('product.was')} <span className="line-through">{formatPrice(product.original_price, lang)} {t('common.sar')}</span>
                </p>
              )}
              {product.availability && (
                <p className="text-accent text-xs mt-3 font-black uppercase tracking-wider">{product.availability}</p>
              )}
            </div>

            {/* Buy Button */}
            <a
              href={product.amazon_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center justify-center gap-2 w-full text-center text-sm sm:text-base"
            >
              {t('product.buyNow')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            {/* Key Features */}
            {product.key_features.length > 0 && (
              <div className="card-brutal p-4 sm:p-5">
                <h3 className="text-xs sm:text-sm font-black text-foreground mb-3 uppercase tracking-wider border-l-4 border-primary pl-3">{t('product.features')}</h3>
                <ul className="space-y-2">
                  {product.key_features.slice(0, 5).map((f, i) => (
                    <li key={i} className="text-xs sm:text-sm text-muted-foreground flex gap-2 sm:gap-3 font-medium">
                      <span className="text-accent mt-0.5 shrink-0 font-black">■</span>
                      <span className="break-words">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Price History */}
        <div className="mt-8 sm:mt-12">
          <PriceChart asin={product.asin} currentPrice={product.current_price} originalPrice={product.original_price} />
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-8 sm:mt-10 card-brutal p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-black text-foreground mb-3 sm:mb-4 uppercase tracking-wider border-l-4 border-primary pl-3">{t('product.description')}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-medium break-words">{product.description}</p>
          </div>
        )}

        {/* Reviews */}
        {product.top_reviews.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <h2 className="text-base sm:text-lg font-black text-foreground mb-3 sm:mb-4 uppercase tracking-wider border-l-4 border-primary pl-3">{t('product.reviews')}</h2>
            <div className="space-y-3 sm:space-y-4">
              {product.top_reviews.slice(0, 5).map((review) => (
                <div key={review.review_id} className="card-brutal p-4 sm:p-5">
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <StarRating rating={review.rating} />
                    <span className="text-xs sm:text-sm font-black text-foreground uppercase break-words flex-1">{review.review_title}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 font-medium break-words">{review.review_text}</p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 text-xs text-muted-foreground font-bold uppercase tracking-wider flex-wrap">
                    <span className="break-words">{review.reviewer_name}</span>
                    {review.is_verified_purchase && (
                      <span className="text-accent">{lang === 'ar' ? 'شراء موثق' : 'Verified'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {product.frequently_bought_together.length > 0 && (
          <div className="mt-8 sm:mt-10 pb-8 sm:pb-10">
            <h2 className="text-base sm:text-lg font-black text-foreground mb-3 sm:mb-4 uppercase tracking-wider border-l-4 border-primary pl-3">{t('product.relatedProducts')}</h2>
            <ErrorBoundary fallback={
              <div className="text-center py-6 sm:py-8 card-brutal">
                <p className="text-muted-foreground text-xs sm:text-sm font-bold uppercase tracking-wider">Unable to load related products</p>
              </div>
            }>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {product.frequently_bought_together.map((item) => (
                  <Link
                    key={item.asin}
                    href={`/product/${item.asin}`}
                    className="card-brutal overflow-hidden hover:border-accent transition-colors"
                  >
                    <div className="aspect-square bg-white p-2 sm:p-3 flex items-center justify-center">
                      {item.image_url && <img src={item.image_url} alt={item.title} className="max-h-full max-w-full object-contain" loading="lazy" />}
                    </div>
                    <div className="p-2 sm:p-3 border-t-2 border-border">
                      <h3 className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 font-semibold uppercase tracking-wide break-words">{item.title}</h3>
                      {item.price > 0 && (
                        <p className="text-xs sm:text-sm font-black text-foreground mt-1 sm:mt-2 text-mono">{formatPrice(item.price, lang)} <span className="text-[10px] text-muted-foreground font-bold">{t('common.sar')}</span></p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </ErrorBoundary>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
