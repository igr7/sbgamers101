'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
  const { t, lang } = useI18n();

  const categories = [
    { slug: 'gpu', en: 'Graphics Cards', ar: 'كروت شاشة' },
    { slug: 'cpu', en: 'Processors', ar: 'معالجات' },
    { slug: 'monitor', en: 'Monitors', ar: 'شاشات' },
    { slug: 'keyboard', en: 'Keyboards', ar: 'كيبورد' },
    { slug: 'mouse', en: 'Mouse', ar: 'ماوس' },
    { slug: 'headset', en: 'Headsets', ar: 'سماعات' },
  ];

  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-[#06060a]">
      <div className="container-main py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <span className="text-black font-black text-sm">SB</span>
              </div>
              <span className="text-white font-extrabold text-lg">Gamers</span>
              <span className="text-emerald-400 text-2xl font-bold leading-none">.</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              {t('footer.aboutText')}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('nav.categories')}
            </h4>
            <div className="flex flex-col gap-2.5">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}/`}
                  className="text-gray-500 hover:text-emerald-400 text-sm transition-colors"
                >
                  {lang === 'ar' ? cat.ar : cat.en}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {lang === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">
                {t('nav.home')}
              </Link>
              <Link href="/deals" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">
                {t('nav.deals')}
              </Link>
              <Link href="/categories" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors">
                {t('nav.categories')}
              </Link>
            </div>
          </div>
        </div>

        <div className="divider mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs leading-relaxed max-w-xl">{t('footer.disclaimer')}</p>
          <p className="text-gray-700 text-xs shrink-0">
            &copy; {new Date().getFullYear()} SB Gamers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
