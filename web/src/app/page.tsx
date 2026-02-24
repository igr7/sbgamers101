'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, Category, Product } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import CategoryIcon from '@/components/CategoryIcon';
import Link from 'next/link';

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getDeals(1, 0)])
      .then(([cats, dealsRes]) => {
        setCategories(cats);
        setDeals(dealsRes.products);
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
        <section className="container-main py-20 border-t-2 border-border">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="h-1 w-12 bg-primary" />
              <h2 className="text-3xl font-black uppercase tracking-tight">
                Categories
              </h2>
            </div>
            <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
              Browse by Product Type
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={`/category/${cat.slug}`} className="block card-brutal p-4 sm:p-6 text-center group">
                  <div className="mb-3 flex justify-center">
                    <CategoryIcon slug={cat.slug} className="w-10 h-10 sm:w-12 sm:h-12 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Hot Deals Section */}
        <section className="container-main py-20 border-t-2 border-border">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="h-1 w-12 bg-accent" />
                <h2 className="text-3xl font-black uppercase tracking-tight">
                  Hot Deals
                </h2>
              </div>
              <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
                Best Discounts Right Now
              </p>
            </div>
            <Link
              href="/deals"
              className="hidden sm:flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:text-primary transition-colors"
            >
              <span>View All</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card-brutal overflow-hidden animate-pulse">
                  <div className="aspect-square bg-secondary" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-secondary w-3/4" />
                    <div className="h-3 bg-secondary w-1/2" />
                    <div className="h-6 bg-secondary w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : deals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 card-brutal"
            >
              <div className="text-7xl mb-6">🎮</div>
              <h3 className="text-2xl font-black uppercase mb-3">
                No Deals Available
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 font-semibold">
                Check back soon for new gaming deals
              </p>
              <Link href="/categories" className="btn-primary">
                Browse Categories
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {deals.slice(0, 8).map((product) => (
                <ProductCard key={product.asin} product={product} />
              ))}
            </div>
          )}

          {deals.length > 0 && (
            <div className="mt-12 text-center">
              <Link href="/deals" className="btn-primary">
                View All Deals
              </Link>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="container-main py-20 border-t-2 border-border">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="h-1 w-12 bg-primary" />
              <h2 className="text-3xl font-black uppercase tracking-tight">
                Why SB Gamers?
              </h2>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📊',
                title: 'Real-Time Tracking',
                description: '24/7 price monitoring across all gaming products',
              },
              {
                icon: '✓',
                title: 'Verified Deals',
                description: 'Only genuine discounts from trusted sellers',
              },
              {
                icon: '🇸🇦',
                title: 'Saudi Focused',
                description: 'Built for Amazon.sa with prices in SAR',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="card-brutal p-8 text-center"
              >
                <div className="text-6xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-black uppercase mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-sm font-semibold">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
