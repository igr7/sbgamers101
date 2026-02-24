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
    <nav className="sticky top-0 z-50 bg-[#08080c]/80 backdrop-blur-2xl border-b border-white/[0.08]">
      <div className="container-main">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">SB</span>
              </div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-white font-black text-lg leading-none tracking-tight">SB Gamers</span>
              <span className="text-xs text-gray-500 font-medium">Price Tracker</span>
            </div>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className="text-gray-400 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
            >
              Home
            </Link>
            <Link
              href="/deals"
              className="text-gray-400 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all flex items-center gap-1"
            >
              <span>🔥</span>
              <span>Deals</span>
            </Link>
            <Link
              href="/categories"
              className="text-gray-400 hover:text-white font-medium px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
            >
              Categories
            </Link>
          </div>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-md">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur transition-opacity" />
              <div className="relative flex items-center">
                <svg className="absolute left-3 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/[0.08] py-4 space-y-3"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="px-2">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
              </div>
            </form>

            {/* Mobile Links */}
            <div className="flex flex-col gap-1 px-2">
              <Link
                href="/"
                className="text-gray-400 hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-white/5 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/deals"
                className="text-gray-400 hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-white/5 transition-all flex items-center gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <span>🔥</span>
                <span>Hot Deals</span>
              </Link>
              <Link
                href="/categories"
                className="text-gray-400 hover:text-white font-medium px-4 py-3 rounded-lg hover:bg-white/5 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Categories
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
