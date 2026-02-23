'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

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
  { value: 'relevance', key: 'sort.discount' },
  { value: 'price_asc', key: 'sort.price_asc' },
  { value: 'price_desc', key: 'sort.price_desc' },
  { value: 'rating', key: 'sort.rating' },
  { value: 'most_reviewed', key: 'sort.most_reviewed' },
];

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  showSort?: boolean;
}

export default function FilterSidebar({ filters, onChange, showSort = true }: Props) {
  const { t } = useI18n();
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
    <div className="space-y-5">
      {/* Sort */}
      {showSort && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('filter.sortBy')}</h4>
          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/40"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-900">{t(opt.key)}</option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('filter.priceRange')}</h4>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder={t('filter.minPrice')}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={applyPrice}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/40"
          />
          <span className="text-gray-600">-</span>
          <input
            type="number"
            placeholder={t('filter.maxPrice')}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={applyPrice}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/40"
          />
        </div>
      </div>

      {/* Min Discount */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('filter.minDiscount')}</h4>
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => update({ min_discount: filters.min_discount === d ? undefined : d })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filters.min_discount === d
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12]'
              }`}
            >
              {d}%+
            </button>
          ))}
        </div>
      </div>

      {/* Min Rating */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{t('filter.rating')}</h4>
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => update({ min_rating: filters.min_rating === r ? undefined : r })}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                filters.min_rating === r
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white hover:border-white/[0.12]'
              }`}
            >
              {r}★+
            </button>
          ))}
        </div>
      </div>

      {/* Prime Only */}
      <div>
        <button
          onClick={() => update({ prime_only: !filters.prime_only })}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
            filters.prime_only
              ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
              : 'bg-white/[0.04] border-white/[0.06] text-gray-400 hover:text-white'
          }`}
        >
          <span>{t('filter.primeOnly')}</span>
          <div className={`w-9 h-5 rounded-full transition-colors ${filters.prime_only ? 'bg-blue-500' : 'bg-white/10'}`}>
            <div className={`w-4 h-4 rounded-full bg-white mt-0.5 transition-transform ${filters.prime_only ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Clear */}
      <button onClick={clearAll} className="w-full text-center text-xs text-gray-500 hover:text-gray-300 py-2 transition-colors">
        {t('filter.clear')}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden w-full flex items-center justify-center gap-2 bg-white/[0.05] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-gray-300 mb-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        {t('filter.filters')}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setMobileOpen(false)}>
          <div className="absolute end-0 top-0 bottom-0 w-80 bg-[#0d0d12] p-5 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-white">{t('filter.filters')}</h3>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {content}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-20">
          {content}
        </div>
      </div>
    </>
  );
}
