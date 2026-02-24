'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Filters {
  min_price?: number;
  max_price?: number;
  min_discount?: number;
  min_rating?: number;
  prime_only?: boolean;
  sort: string;
}

const DISCOUNT_OPTIONS = [0, 10, 20, 30, 50];
const RATING_OPTIONS = [3, 4, 4.5];
const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'most_reviewed', label: 'Most Reviewed' },
];

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  showSort?: boolean;
}

export default function FilterSidebar({ filters, onChange, showSort = true }: Props) {
  const [minPrice, setMinPrice] = useState(filters.min_price?.toString() || '');
  const [maxPrice, setMaxPrice] = useState(filters.max_price?.toString() || '');
  const [mobileOpen, setMobileOpen] = useState(false);

  const update = (patch: Partial<Filters>) => {
    onChange({ ...filters, ...patch });
  };

  const applyPrice = () => {
    update({
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
    });
  };

  const clearAll = () => {
    setMinPrice('');
    setMaxPrice('');
    onChange({ sort: 'relevance' });
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black gradient-text-gold">Filters</h2>
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
        >
          Reset All
        </button>
      </div>

      {/* Sort */}
      {showSort && (
        <div className="space-y-3">
          <label className="text-sm font-bold text-foreground">Sort By</label>
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="input-modern text-sm"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-background">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">Price Range (SAR)</label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPrice}
            className="input-modern text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPrice}
            className="input-modern text-sm"
          />
        </div>
      </div>

      {/* Min Discount */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">Minimum Discount</label>
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => update({ min_discount: filters.min_discount === d ? undefined : d })}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                filters.min_discount === d
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground border border-border'
              }`}
            >
              {d === 0 ? 'All' : `${d}%+`}
            </button>
          ))}
        </div>
      </div>

      {/* Min Rating */}
      <div className="space-y-3">
        <label className="text-sm font-bold text-foreground">Minimum Rating</label>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => update({ min_rating: filters.min_rating === r ? undefined : r })}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                filters.min_rating === r
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground border border-border'
              }`}
            >
              {r}
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Prime Only */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.prime_only}
            onChange={(e) => update({ prime_only: e.target.checked })}
            className="w-4 h-4 rounded border-border bg-secondary text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer"
          />
          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
            Prime Eligible Only
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden w-full btn-secondary mb-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 w-80 z-50 bg-card border-l border-border p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="card-premium p-6 sticky top-20">
          {content}
        </div>
      </div>
    </>
  );
}
