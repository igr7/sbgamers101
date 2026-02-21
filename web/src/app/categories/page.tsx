'use client';

import { useEffect, useState } from 'react';
import { api, Category } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';

export default function CategoriesPage() {
  const { t } = useI18n();
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
      <main className="flex-1 container-main py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">{t('nav.categories')}</h1>
          <p className="text-gray-500 text-sm">{t('category.showAll')}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white/[0.02] rounded-2xl p-8 animate-pulse border border-white/[0.04]">
                  <div className="w-12 h-12 rounded-full bg-white/[0.04] mx-auto mb-4" />
                  <div className="h-4 bg-white/[0.04] rounded-full mx-auto w-20" />
                </div>
              ))
            : categories.map((cat) => <CategoryCard key={cat.id} category={cat} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}
