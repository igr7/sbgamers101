'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterCriteria } from '@/lib/productWrapper';

interface Props {
  onFilterChange: (filters: FilterCriteria) => void;
  availableBrands?: string[];
  priceRange?: { min: number; max: number };
}

export default function AdvancedFilters({ onFilterChange, availableBrands = [], priceRange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria>({
    minPrice: priceRange?.min,
    maxPrice: priceRange?.max,
    minDiscount: 0,
    minRating: 0,
    brands: [],
    primeOnly: false,
  });

  const [localMinPrice, setLocalMinPrice] = useState(priceRange?.min || 0);
  const [localMaxPrice, setLocalMaxPrice] = useState(priceRange?.max || 10000);

  useEffect(() => {
    if (priceRange) {
      setLocalMinPrice(priceRange.min);
      setLocalMaxPrice(priceRange.max);
    }
  }, [priceRange]);

  const handleApplyFilters = () => {
    onFilterChange({
      ...filters,
      minPrice: localMinPrice,
      maxPrice: localMaxPrice,
    });
  };

  const handleResetFilters = () => {
    const resetFilters: FilterCriteria = {
      minPrice: priceRange?.min,
      maxPrice: priceRange?.max,
      minDiscount: 0,
      minRating: 0,
      brands: [],
      primeOnly: false,
    };
    setFilters(resetFilters);
    setLocalMinPrice(priceRange?.min || 0);
    setLocalMaxPrice(priceRange?.max || 10000);
    onFilterChange(resetFilters);
  };

  const toggleBrand = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands?.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...(prev.brands || []), brand],
    }));
  };

  const activeFilterCount =
    (filters.minDiscount ? 1 : 0) +
    (filters.minRating ? 1 : 0) +
    (filters.brands?.length || 0) +
    (filters.primeOnly ? 1 : 0);

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur-lg transition-opacity" />
        <div className="relative flex items-center gap-3 bg-gradient-to-r from-[#1a1a24] to-[#12121a] border border-white/10 hover:border-cyan-500/30 rounded-xl px-6 py-3 transition-all">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="font-bold text-white">Filters</span>
          {activeFilterCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
            >
              {activeFilterCount}
            </motion.div>
          )}
        </div>
      </motion.button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Filter Panel */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute top-full mt-4 right-0 w-[400px] max-w-[calc(100vw-2rem)] z-50"
            >
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur-xl" />

                <div className="relative bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-white/10 rounded-2xl p-6 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      Advanced Filters
                    </h3>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        Price Range (SAR)
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={localMinPrice}
                            onChange={(e) => setLocalMinPrice(Number(e.target.value))}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                            placeholder="Min"
                          />
                          <span className="text-gray-500">—</span>
                          <input
                            type="number"
                            value={localMaxPrice}
                            onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                            placeholder="Max"
                          />
                        </div>
                        <input
                          type="range"
                          min={priceRange?.min || 0}
                          max={priceRange?.max || 10000}
                          value={localMaxPrice}
                          onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                          className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-cyan-500 [&::-webkit-slider-thumb]:to-purple-500"
                        />
                      </div>
                    </div>

                    {/* Minimum Discount */}
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        Minimum Discount
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {[0, 10, 20, 30, 50].map((discount) => (
                          <button
                            key={discount}
                            onClick={() => setFilters(prev => ({ ...prev, minDiscount: discount }))}
                            className={`py-2 rounded-lg text-sm font-bold transition-all ${
                              filters.minDiscount === discount
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {discount === 0 ? 'Any' : `${discount}%`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Minimum Rating */}
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-3">
                        Minimum Rating
                      </label>
                      <div className="flex gap-2">
                        {[0, 3, 4, 4.5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                              filters.minRating === rating
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {rating === 0 ? 'Any' : `${rating}★`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prime Only */}
                    <div>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                          Prime Eligible Only
                        </span>
                        <div
                          onClick={() => setFilters(prev => ({ ...prev, primeOnly: !prev.primeOnly }))}
                          className={`relative w-12 h-6 rounded-full transition-all ${
                            filters.primeOnly
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                              : 'bg-white/10'
                          }`}
                        >
                          <motion.div
                            animate={{ x: filters.primeOnly ? 24 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                          />
                        </div>
                      </label>
                    </div>

                    {/* Brands */}
                    {availableBrands.length > 0 && (
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-3">
                          Brands
                        </label>
                        <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                          {availableBrands.map((brand) => (
                            <label
                              key={brand}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={filters.brands?.includes(brand)}
                                onChange={() => toggleBrand(brand)}
                                className="w-4 h-4 rounded border-2 border-white/20 bg-white/5 checked:bg-gradient-to-r checked:from-cyan-500 checked:to-purple-500 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                              />
                              <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                {brand}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                    <button
                      onClick={handleResetFilters}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold py-3 rounded-xl transition-all"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => {
                        handleApplyFilters();
                        setIsOpen(false);
                      }}
                      className="flex-1 relative group/apply"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover/apply:opacity-75 transition-opacity" />
                      <div className="relative bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-black py-3 rounded-xl">
                        Apply Filters
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }
      `}</style>
    </div>
  );
}
