'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const categories = [
    { slug: 'gpu', name: 'Graphics Cards' },
    { slug: 'cpu', name: 'Processors' },
    { slug: 'monitor', name: 'Gaming Monitors' },
    { slug: 'keyboard', name: 'Gaming Keyboards' },
    { slug: 'mouse', name: 'Gaming Mouse' },
    { slug: 'headset', name: 'Gaming Headsets' },
  ];

  return (
    <footer className="mt-auto border-t border-white/[0.08] bg-gradient-to-b from-[#08080c] to-[#06060a]">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-xl">SB</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-black text-2xl leading-none tracking-tight">SB Gamers</span>
                <span className="text-sm text-gray-500 font-medium">Price Tracker</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
              The most advanced price tracking platform for gamers in Saudi Arabia. Track prices on Amazon.sa, verify real discounts, and never overpay for gaming gear again.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </div>
                <span>Live Price Tracking</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-6">
              Categories
            </h4>
            <div className="flex flex-col gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="text-gray-400 hover:text-cyan-400 text-sm transition-colors group flex items-center gap-2"
                >
                  <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black text-sm uppercase tracking-wider mb-6">
              Quick Links
            </h4>
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-gray-400 hover:text-cyan-400 text-sm transition-colors group flex items-center gap-2"
              >
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Home</span>
              </Link>
              <Link
                href="/deals"
                className="text-gray-400 hover:text-cyan-400 text-sm transition-colors group flex items-center gap-2"
              >
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Hot Deals</span>
              </Link>
              <Link
                href="/categories"
                className="text-gray-400 hover:text-cyan-400 text-sm transition-colors group flex items-center gap-2"
              >
                <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>All Categories</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs leading-relaxed max-w-2xl text-center sm:text-left">
            <strong className="text-gray-400">Disclaimer:</strong> SB Gamers is not affiliated with Amazon.sa. All product names, logos, and brands are property of their respective owners. Prices and availability are subject to change.
          </p>
          <p className="text-gray-600 text-xs shrink-0 font-medium">
            &copy; {new Date().getFullYear()} SB Gamers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
