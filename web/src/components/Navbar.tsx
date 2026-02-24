'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b-2 border-border">
      <div className="container-main">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 bg-foreground flex items-center justify-center">
              <span className="text-background font-black text-lg text-mono">SB</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-foreground font-black text-base leading-none tracking-tight uppercase">
                SB Gamers
              </span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                Saudi Arabia
              </span>
            </div>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className="btn-ghost">
              Home
            </Link>
            <Link href="/deals" className="btn-ghost">
              Deals
            </Link>
            <Link href="/categories" className="btn-ghost">
              Categories
            </Link>
          </div>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="SEARCH PRODUCTS..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-brutal text-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-secondary transition-sharp"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden btn-ghost p-2"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              {menuOpen ? (
                <path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t-2 border-border py-4 space-y-3"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-2">
              <input
                type="text"
                placeholder="SEARCH PRODUCTS..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input-brutal text-sm"
              />
            </form>

            {/* Mobile Links */}
            <div className="flex flex-col gap-1 px-2">
              <Link href="/" className="btn-ghost justify-start" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link href="/deals" className="btn-ghost justify-start" onClick={() => setMenuOpen(false)}>
                Deals
              </Link>
              <Link href="/categories" className="btn-ghost justify-start" onClick={() => setMenuOpen(false)}>
                Categories
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
