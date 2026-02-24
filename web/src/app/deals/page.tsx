'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, Product } from '@/lib/api';
import { wrapProducts, filterProducts, sortProducts, SanitizedProduct, FilterCriteria, SortOption } from '@/lib/productWrapper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PremiumProductCard from '@/components/PremiumProductCard';
import AdvancedFilters from '@/components/AdvancedFilters';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'discount', label: 'Highest Discount' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function DealsPage() {
  const [allProducts, setAllProducts] = useState<SanitizedProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<SanitizedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('discount');
  const [filters, setFilters] = useState<FilterCriteria>({});

  useEffect(() => {
    setLoading(true);
    api
      .getDeals(1, 0)
      .then((res) => {
        const wrapped = wrapProducts(res.products.map(p => ({
          asin: p.asin,
          title: p.title,
          main_image: p.image_url,
          price: p.current_price,
          original_price: p.original_price,
          discount_percentage: p.discount_pct,
          rating: p.rating,
          ratings_count: p.ratings_total,
          is_prime: p.is_prime,
          is_best_seller: p.is_best_seller,
          is_amazon_choice: p.is_amazon_choice,
          amazon_url: p.amazon_url,
          category_slug: p.category_slug,
          category_name: p.category_name,
        })));
        setAllProducts(wrapped);
        setFilteredProducts(sortProducts(wrapped, sortBy));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const filtered = filterProducts(allProducts, filters);
    const sorted = sortProducts(filtered, sortBy);
    setFilteredProducts(sorted);
  }, [filters, sortBy, allProducts]);

  const handleFilterChange = (newFilters: FilterCriteria) => {
    setFilters(newFilters);
  };

  const priceRange = allProducts.length > 0 ? {
    min: Math.min(...allProducts.map(p => p.price)),
    max: Math.max(...allProducts.map(p => p.price)),
  } : undefined;

  const availableBrands = Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean)));

  return (
    <>
      <Navbar />
      <main className="flex-1 container-main py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-2xl mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-purple-500/10" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] opacity-50" />

          <div className="relative z-10 p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-2xl">
                🔥
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Hot Deals
                </h1>
                <p className="text-sm text-gray-400">Limited time offers on gaming gear</p>
              </div>
            </div>
            {filteredProducts.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-cyan-400 font-bold text-lg">{filteredProducts.length}</span>
                <span className="text-gray-400">products found</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Filters & Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <AdvancedFilters
            onFilterChange={handleFilterChange}
            availableBrands={availableBrands}
            priceRange={priceRange}
          />

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-gradient-to-r from-[#1a1a24] to-[#12121a] border border-white/10 hover:border-cyan-500/30 rounded-xl px-6 py-3 pr-12 text-white font-bold focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-white/5" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/5 rounded-full w-3/4" />
                  <div className="h-4 bg-white/5 rounded-full w-1/2" />
                  <div className="h-6 bg-white/5 rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-white/10 rounded-3xl"
          >
            <div className="text-7xl mb-6">🔍</div>
            <h3 className="text-2xl font-black text-white mb-3">
              No Products Found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto mb-8">
              Try adjusting your filters or check back later for new deals
            </p>
            <button
              onClick={() => setFilters({})}
              className="group relative inline-block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl px-8 py-3 font-black text-white">
                Clear Filters
              </div>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, i) => (
              <PremiumProductCard key={product.asin} product={product} index={i} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
