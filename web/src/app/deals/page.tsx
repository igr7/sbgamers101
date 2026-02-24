'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api, Product } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FilterSidebar, { Filters } from '@/components/FilterSidebar';
import { ErrorBoundary, ProductGridErrorFallback } from '@/components/ErrorBoundary';

export default function DealsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ sort: 'discount' });

  useEffect(() => {
    setLoading(true);
    api
      .getDeals(1, 0)
      .then((res) => {
        setAllProducts(res.products);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 border-l-4 border-accent pl-6"
        >
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
            Hot Deals
          </h1>
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
            {filteredProducts.length} Products Found
          </p>
        </motion.div>

        {/* Filters - Mobile Button */}
        <div className="lg:hidden mb-6">
          <FilterSidebar filters={filters} onChange={setFilters} />
        </div>

        <div className="flex gap-8">
          {/* Filters - Desktop Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar filters={filters} onChange={setFilters} />
          </div>

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
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 card-brutal"
              >
                <div className="text-7xl mb-6">🔍</div>
                <h3 className="text-2xl font-black uppercase mb-3">
                  No Products Found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8 font-semibold">
                  Try adjusting your filters
                </p>
                <button
                  onClick={() => setFilters({ sort: 'discount' })}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </motion.div>
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
