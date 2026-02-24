'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Product } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FilterSidebar, { Filters } from '@/components/FilterSidebar';
import { ErrorBoundary, ProductGridErrorFallback } from '@/components/ErrorBoundary';
import { getCategoryEmoji } from '@/lib/utils';

export default function CategoryPageClient() {
  const { slug } = useParams<{ slug: string }>();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [filters, setFilters] = useState<Filters>({ sort: 'discount' });

  useEffect(() => {
    setLoading(true);
    api.getCategoryProducts(slug, 1, 'popular')
      .then((res) => {
        setAllProducts(res.products);
        if (res.products[0]?.category_name) {
          setCategoryName(res.products[0].category_name);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const applyFilters = useCallback((prods: Product[], f: Filters) => {
    let result = [...prods];

    // Price filters
    if (f.min_price) result = result.filter(p => p.current_price >= f.min_price!);
    if (f.max_price) result = result.filter(p => p.current_price <= f.max_price!);

    // Prime filter
    if (f.prime_only) result = result.filter(p => p.is_prime);

    // Sort
    switch (f.sort) {
      case 'discount':
        result.sort((a, b) => b.discount_pct - a.discount_pct);
        break;
      case 'price_asc':
        result.sort((a, b) => a.current_price - b.current_price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.current_price - a.current_price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, []);

  useEffect(() => {
    setFilteredProducts(applyFilters(allProducts, filters));
  }, [filters, allProducts, applyFilters]);

  return (
    <>
      <Navbar />
      <main className="flex-1 container-main py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-border">/</span>
          <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
            Categories
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">{categoryName || slug}</span>
        </div>

        {/* Header */}
        <div className="mb-8 border-l-4 border-primary pl-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl">{getCategoryEmoji(slug)}</span>
            <h1 className="text-4xl font-black uppercase tracking-tight">
              {categoryName || slug}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
            {filteredProducts.length} Products Available
          </p>
        </div>

        <div className="flex gap-8">
          {/* Filters */}
          <FilterSidebar filters={filters} onChange={setFilters} />

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="card-brutal overflow-hidden animate-pulse">
                    <div className="aspect-square bg-secondary" />
                    <div className="p-4 space-y-3">
                      <div className="h-3 bg-secondary w-3/4" />
                      <div className="h-3 bg-secondary w-1/2" />
                      <div className="h-6 bg-secondary w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 card-brutal">
                <div className="text-7xl mb-6">📦</div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  No Products Found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8 font-semibold">
                  Try adjusting your filters or check back later
                </p>
                <button
                  onClick={() => setFilters({ sort: 'discount' })}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <ErrorBoundary fallback={<ProductGridErrorFallback onRetry={() => window.location.reload()} />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.asin} product={product} />
                  ))}
                </div>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
