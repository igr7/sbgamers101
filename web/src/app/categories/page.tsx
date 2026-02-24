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
          transition={{ duration: 0.3 }}
          className="mb-8 border-l-4 border-primary pl-6"
        >
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
            All Categories
          </h1>
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
            Browse Gaming Gear by Category
          </p>
          {categories.length > 0 && (
            <div className="flex items-center gap-2 text-sm mt-3">
              <span className="text-accent font-black text-mono text-lg">{categories.length}</span>
              <span className="text-muted-foreground font-bold uppercase tracking-wider">Categories Available</span>
            </div>
          )}
        </motion.div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="card-brutal p-6 animate-pulse">
                <div className="w-16 h-16 bg-secondary mx-auto mb-4" />
                <div className="h-3 bg-secondary w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 card-brutal"
          >
            <div className="text-7xl mb-6">📦</div>
            <h3 className="text-2xl font-black uppercase mb-3">
              No Categories Found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto font-semibold">
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
