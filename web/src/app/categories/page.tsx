'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, Category } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCategories()
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] opacity-50" />

          <div className="relative z-10 p-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-2xl">
                📦
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  All Categories
                </h1>
                <p className="text-sm text-gray-400">Browse gaming gear by category</p>
              </div>
            </div>
            {categories.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-cyan-400 font-bold text-lg">{categories.length}</span>
                <span className="text-gray-400">categories available</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-white/10 rounded-2xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-white/5 rounded-xl mx-auto mb-4" />
                <div className="h-4 bg-white/5 rounded-full w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-white/10 rounded-3xl"
          >
            <div className="text-7xl mb-6">📦</div>
            <h3 className="text-2xl font-black text-white mb-3">
              No Categories Found
            </h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Categories are being loaded. Please check back soon.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.map((category, i) => (
              <CategoryCard key={category.id} category={category} index={i} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
