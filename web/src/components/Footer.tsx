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
    <footer className="mt-auto bg-[#08080d] border-t border-white/[0.06]">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <span className="text-black font-black text-sm">SB</span>
              </div>
              <span className="text-white font-bold text-lg">Gamers</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {t('footer.aboutText')}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('nav.categories')}
            </h4>
            <div className="grid grid-cols-2 gap-2">
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

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('nav.home')}
            </h4>
            <div className="flex flex-col gap-2">
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
          <p className="text-gray-600 text-xs">{t('footer.disclaimer')}</p>
          <p className="text-gray-700 text-xs">
            &copy; {new Date().getFullYear()} SB Gamers
          </p>
        </div>
      </div>
    </footer>
  );
}
