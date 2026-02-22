'use client';

import { useEffect, useState } from 'react';
import { api, Category } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'gpu', slug: 'gpu', name_en: 'Graphics Cards', name_ar: 'كروت شاشة' },
  { id: 'cpu', slug: 'cpu', name_en: 'Processors', name_ar: 'معالجات' },
  { id: 'monitor', slug: 'monitor', name_en: 'Monitors', name_ar: 'شاشات' },
  { id: 'keyboard', slug: 'keyboard', name_en: 'Keyboards', name_ar: 'كيبورد' },
  { id: 'mouse', slug: 'mouse', name_en: 'Mouse', name_ar: 'ماوس' },
  { id: 'headset', slug: 'headset', name_en: 'Headsets', name_ar: 'سماعات' },
  { id: 'ram', slug: 'ram', name_en: 'Memory', name_ar: 'ذاكرة' },
  { id: 'motherboard', slug: 'motherboard', name_en: 'Motherboards', name_ar: 'لوحات أم' },
  { id: 'chair', slug: 'chair', name_en: 'Gaming Chairs', name_ar: 'كراسي قيمنق' },
  { id: 'cooling', slug: 'cooling', name_en: 'Cooling', name_ar: 'تبريد' },
  { id: 'psu', slug: 'psu', name_en: 'Power Supply', name_ar: 'باور سبلاي' },
  { id: 'case', slug: 'case', name_en: 'PC Cases', name_ar: 'كيسات' },
];

export default function CategoriesPage() {
  const { t, lang } = useI18n();
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getCategories()
      .then((cats) => {
        if (cats.length > 0) setCategories(cats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 container-main py-10">
        <div className="page-header">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">{t('nav.categories')}</h1>
            <p className="text-gray-500 text-sm">{t('category.showAll')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
