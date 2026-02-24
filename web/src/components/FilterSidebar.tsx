'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Filters {
  min_price?: number;
  max_price?: number;
  prime_only?: boolean;
  sort: 'discount' | 'price_asc' | 'price_desc' | 'rating';
}

const SORT_OPTIONS = [
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'price_asc', label: 'Lowest Price' },
  { value: 'price_desc', label: 'Highest Price' },
  { value: 'rating', label: 'Highest Rated' },
] as const;

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
    onChange({ sort: 'discount', prime_only: false });
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-border pb-4">
        <h2 className="text-lg font-black uppercase tracking-wider">Filters</h2>
        <button
          onClick={clearAll}
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Sort */}
      {showSort && (
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Sort By
          </label>
          <div className="space-y-2">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => update({ sort: opt.value })}
                className={`w-full text-left px-4 py-3 border-2 font-bold text-sm uppercase tracking-wide transition-sharp ${
                  filters.sort === opt.value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border hover:border-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Price Range (SAR)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPrice}
            className="input-brutal text-sm font-bold"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPrice}
            className="input-brutal text-sm font-bold"
          />
        </div>
      </div>

      {/* Prime Only */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={filters.prime_only || false}
              onChange={(e) => update({ prime_only: e.target.checked })}
              className="sr-only"
            />
            <div
              className={`w-5 h-5 border-2 transition-sharp ${
                filters.prime_only
                  ? 'border-primary bg-primary'
                  : 'border-border group-hover:border-primary'
              }`}
            >
              {filters.prime_only && (
                <svg
                  className="w-full h-full text-primary-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
            Prime Only
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
        className="lg:hidden w-full btn-secondary mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M3 4h18M3 12h18M3 20h18" />
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
              className="lg:hidden fixed inset-0 z-50 bg-background/95"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 w-80 z-50 bg-card border-l-2 border-border p-6 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="card-brutal p-6 sticky top-20">
          {content}
        </div>
      </div>
    </>
  );
}
