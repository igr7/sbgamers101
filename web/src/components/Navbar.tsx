'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { lang, setLang, t } = useI18n();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="container-main">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <span className="text-black font-black text-sm">SB</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-lg tracking-tight">Gamers</span>
              <span className="text-emerald-500 text-lg font-bold">.</span>
            </div>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="btn-ghost text-sm">{t('nav.home')}</Link>
            <Link href="/deals" className="btn-ghost text-sm">{t('nav.deals')}</Link>
            <Link href="/categories" className="btn-ghost text-sm">{t('nav.categories')}</Link>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={t('nav.search')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-search pl-10"
              />
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Lang Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="btn-ghost text-sm font-medium"
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden btn-ghost p-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-white/[0.06] py-3 flex flex-col gap-1 animate-fade-in">
            <Link href="/" className="btn-ghost text-sm" onClick={() => setMenuOpen(false)}>{t('nav.home')}</Link>
            <Link href="/deals" className="btn-ghost text-sm" onClick={() => setMenuOpen(false)}>{t('nav.deals')}</Link>
            <Link href="/categories" className="btn-ghost text-sm" onClick={() => setMenuOpen(false)}>{t('nav.categories')}</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
