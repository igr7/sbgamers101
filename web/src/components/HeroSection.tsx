'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-30" />

      {/* Accent Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-primary" />

      {/* Content */}
      <div className="relative z-10 container-main py-20 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 mb-8 border-2 border-primary px-4 py-2"
        >
          <div className="w-2 h-2 bg-accent animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest">
            Live Price Tracking
          </span>
        </motion.div>

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-display text-6xl sm:text-7xl lg:text-8xl mb-4">
            <span className="block">GAMING</span>
            <span className="block">TECH</span>
            <span className="block text-accent">DEALS</span>
          </h1>
          <div className="h-1 w-24 mx-auto bg-primary" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-12 font-semibold uppercase tracking-wide"
        >
          Saudi Arabia's Premier Gaming Tech Aggregator
        </motion.p>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSearch}
          className="max-w-3xl mx-auto mb-12"
        >
          <div className="relative flex items-center border-2 border-border hover:border-primary transition-sharp">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH FOR RTX 4090, GAMING KEYBOARD..."
              className="flex-1 bg-card px-6 py-5 text-foreground placeholder-muted-foreground focus:outline-none text-base font-semibold uppercase tracking-wide"
            />
            <button
              type="submit"
              className="btn-primary m-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </button>
          </div>
        </motion.form>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex gap-4 justify-center flex-wrap mb-16"
        >
          <Link href="/deals" className="btn-primary">
            <span>Browse Deals</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          <Link href="/categories" className="btn-secondary">
            <span>All Categories</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          {[
            { value: '1000+', label: 'Products' },
            { value: '24/7', label: 'Monitoring' },
            { value: '100%', label: 'Verified' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
              className="text-center border-2 border-border p-6 hover:border-primary transition-sharp"
            >
              <div className="stat-display mb-2">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
