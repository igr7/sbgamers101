'use client';

import Link from 'next/link';
import { Category } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { getCategoryEmoji } from '@/lib/utils';

export default function CategoryCard({ category }: { category: Category }) {
  const { lang } = useI18n();

  return (
    <Link
      href={`/category/${category.slug}`}
      className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-emerald-500/20
                 rounded-2xl p-6 flex flex-col items-center gap-3 text-center transition-all duration-300
                 hover:shadow-lg hover:shadow-emerald-500/5"
    >
      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
        {getCategoryEmoji(category.slug)}
      </span>
      <span className="font-medium text-sm text-gray-400 group-hover:text-white transition-colors">
        {lang === 'ar' ? category.name_ar : category.name_en}
      </span>
    </Link>
  );
}
