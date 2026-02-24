'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, Category, Product } from '@/lib/api';
import { wrapProducts, SanitizedProduct } from '@/lib/productWrapper';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import PremiumProductCard from '@/components/PremiumProductCard';
import Link from 'next/link';

const CATEGORY_ICONS: Record<string, string> = {
  gpu: '🎮',
  cpu: '⚡',
  monitor: '🖥️',
  keyboard: '⌨️',
  mouse: '🖱️',
  headset: '🎧',
  ram: '💾',
  ssd: '💿',
  motherboard: '🔌',
  psu: '🔋',
  case: '📦',
  cooling: '❄️',
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [deals, setDeals] = useState<SanitizedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getDeals(1, 0)])
      .then(([cats, dealsRes]) => {
        setCategories(cats);
        const wrappedDeals = wrapProducts(dealsRes.products.map(p => ({
          asin: p.asin,
          title: p.title,
          main_image: p.image_url,
          price: p.current_price,
          original_price: p.original_price,
          discount_percentage: p.discount_pct,
          rating: p.rating,
          ratings_count: p.ratings_total,
          is_prime: p.is_prime,
          is_best_seller: p.is_best_seller,
          is_amazon_choice: p.is_amazon_choice,
          amazon_url: p.amazon_url,
          category_slug: p.category_slug,
          category_name: p.category_name,
        })));
        setDeals(wrappedDeals);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Categories */}
        <section className="container-main py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Browse by Category
            </h2>
            <p className="text-gray-400 text-lg">
              Find the perfect gaming gear for your setup
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link href={`/category/${cat.slug}`} className="group block">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500" />
                    <div className="relative bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-white/10 group-hover:border-cyan-500/30 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center gap-3">
                      <div className="text-5xl">{CATEGORY_ICONS[cat.slug] || '🎯'}</div>
                      <h3 className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors text-center">
                        {cat.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Hot Deals Section */}
        <section className="container-main py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                🔥 Hot Deals
              </h2>
              <p className="text-gray-400">Limited time offers on top gaming gear</p>
            </div>
            <Link
              href="/deals"
              className="group flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
            >
              <span>View All</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-white/10 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-white/5" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-white/5 rounded-full w-3/4" />
                    <div className="h-4 bg-white/5 rounded-full w-1/2" />
                    <div className="h-6 bg-white/5 rounded-full w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-white/10 rounded-3xl"
            >
              <div className="text-7xl mb-6">🎮</div>
              <h3 className="text-2xl font-black text-white mb-3">
                Deals Loading Soon
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                We're gathering the best gaming deals from Amazon.sa. Check back soon!
              </p>
              <Link href="/categories" className="group relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl px-8 py-3 font-black text-white">
                  Browse Categories
                </div>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {deals.slice(0, 8).map((product, i) => (
                <PremiumProductCard key={product.asin} product={product} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="container-main py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Why Choose SB Gamers?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The most advanced price tracking platform for gamers in Saudi Arabia
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📊',
                title: 'Real-Time Price Tracking',
                description: 'Monitor prices 24/7 and get notified when your favorite products drop in price',
                gradient: 'from-cyan-500 to-blue-500',
              },
              {
                icon: '✨',
                title: 'Verified Discounts',
                description: 'Our algorithm detects fake discounts and shows you only genuine deals',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: '🇸🇦',
                title: 'Saudi Arabia Focused',
                description: 'Built specifically for Amazon.sa with prices in SAR and local shipping',
                gradient: 'from-emerald-500 to-teal-500',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                <div className="relative bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-white/10 group-hover:border-white/20 rounded-3xl p-8 transition-all duration-500">
                  <div className="text-6xl mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-black text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="container-main pb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-3xl p-12 sm:p-16 text-center"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10" />
            <div className="absolute inset-0">
              <motion.div
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
                    'radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
                    'radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
                  ],
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="w-full h-full"
              />
            </div>

            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="text-7xl mb-6"
              >
                💎
              </motion.div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
                Never Overpay Again
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                Track any product on Amazon.sa and see its real price history
              </p>
              <Link href="/deals" className="group relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl px-10 py-4 font-black text-white flex items-center gap-2 hover:scale-105 transition-transform">
                  <span>Start Saving Now</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  );
}
