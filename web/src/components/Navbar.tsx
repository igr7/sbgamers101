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
    <nav className="sticky top-0 z-50 bg-[#08080c]/90 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="container-main">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
              <span className="text-black font-black text-sm tracking-tighter">SB</span>
            </div>
            <div className="hidden sm:flex items-baseline gap-0.5">
              <span className="text-white font-extrabold text-lg tracking-tight">Gamers</span>
              <span className="text-emerald-400 text-2xl font-bold leading-none">.</span>
            </div>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="btn-ghost text-sm">{t('nav.home')}</Link>
            <Link href="/deals" className="btn-ghost text-sm">{t('nav.deals')}</Link>
            <Link href="/categories" className="btn-ghost text-sm">{t('nav.categories')}</Link>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
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
          <div className="flex items-center gap-1">
            {/* Lang Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="btn-ghost text-sm font-semibold flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">{lang === 'en' ? 'العربية' : 'English'}</span>
              <span className="sm:hidden">{lang === 'en' ? 'AR' : 'EN'}</span>
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden btn-ghost p-2"
              aria-label="Toggle menu"
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
          <div className="md:hidden border-t border-white/[0.06] py-3 flex flex-col gap-1">
            <Link href="/" className="btn-ghost text-sm" onClick={() => setMenuOpen(false)}>{t('nav.home')}</Link>
            <Link href="/deals" className="btn-ghost text-sm" onClick={() => setMenuOpen(false)}>{t('nav.deals')}</Link>
            <Link href="/categories" className="btn-ghost text-sm" onClick={() => setMenuOpen(false)}>{t('nav.categories')}</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
