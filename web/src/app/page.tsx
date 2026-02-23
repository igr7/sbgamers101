'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { api, Category, Product } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

const FALLBACK_CATEGORIES: Category[] = [
  { id: 'gpu', slug: 'gpu', name_en: 'Graphics Cards', name_ar: 'كروت شاشة' },
  { id: 'cpu', slug: 'cpu', name_en: 'Processors', name_ar: 'معالجات' },
  { id: 'monitor', slug: 'monitor', name_en: 'Monitors', name_ar: 'شاشات' },
  { id: 'keyboard', slug: 'keyboard', name_en: 'Keyboards', name_ar: 'كيبورد' },
  { id: 'mouse', slug: 'mouse', name_en: 'Mouse', name_ar: 'ماوس' },
  { id: 'headset', slug: 'headset', name_en: 'Headsets', name_ar: 'سماعات' },
  { id: 'ram', slug: 'ram', name_en: 'Memory', name_ar: 'ذاكرة' },
  { id: 'motherboard', slug: 'motherboard', name_en: 'Motherboards', name_ar: 'لوحات أم' },
  { id: 'chair', slug: 'chair', name_en: 'Gaming Chairs', name_ar: 'كراسي قيمنق' },
  { id: 'cooling', slug: 'cooling', name_en: 'Cooling', name_ar: 'تبريد' },
  { id: 'psu', slug: 'psu', name_en: 'Power Supply', name_ar: 'باور سبلاي' },
  { id: 'case', slug: 'case', name_en: 'PC Cases', name_ar: 'كيسات' },
];

const FEATURES = [
  {
    icon: '📊',
    titleEn: 'Price Tracking',
    titleAr: 'تتبع الأسعار',
    descEn: 'We track prices on Amazon.sa daily so you never miss a price drop.',
    descAr: 'نتتبع الأسعار على أمازون يومياً حتى لا يفوتك أي انخفاض.',
    gradient: 'from-emerald-400 to-teal-500',
  },
  {
    icon: '✨',
    titleEn: 'Deal Verification',
    titleAr: 'التحقق من العروض',
    descEn: 'Our algorithm checks if a "discount" is real or just a fake inflated price.',
    descAr: 'خوارزميتنا تتحقق إذا كان "الخصم" حقيقي أو سعر مضخم وهمي.',
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    icon: '🇸🇦',
    titleEn: 'Saudi Focused',
    titleAr: 'مخصص للسعودية',
    descEn: 'Built specifically for Amazon.sa with prices in SAR and Arabic support.',
    descAr: 'مبني خصيصاً لأمازون السعودية بالريال السعودي ودعم اللغة العربية.',
    gradient: 'from-blue-400 to-cyan-500',
  },
];

const FloatingOrb = ({ delay = 0, duration = 20, size = 400, color = 'emerald' }: any) => (
  <motion.div
    className={`absolute rounded-full blur-[120px] opacity-20`}
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle, ${
        color === 'emerald' ? 'rgb(16, 185, 129)' :
        color === 'purple' ? 'rgb(168, 85, 247)' :
        color === 'blue' ? 'rgb(59, 130, 246)' :
        'rgb(236, 72, 153)'
      }, transparent)`,
    }}
    animate={{
      x: [0, 100, -50, 0],
      y: [0, -100, 50, 0],
      scale: [1, 1.2, 0.8, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

export default function HomePage() {
  const { t, lang } = useI18n();
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [deals, setDeals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getDeals(1, 0)])
      .then(([cats, dealsRes]) => {
        if (cats.length > 0) setCategories(cats);
        setDeals(dealsRes.products);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <FloatingOrb delay={0} duration={25} size={600} color="emerald" />
            <FloatingOrb delay={5} duration={30} size={400} color="purple" />
            <FloatingOrb delay={10} duration={20} size={500} color="blue" />
            <FloatingOrb delay={15} duration={35} size={350} color="pink" />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

          <motion.div
            className="relative container-main py-20 text-center z-10"
            style={{ opacity, scale }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full px-6 py-2 backdrop-blur-xl">
                  <span className="flex items-center gap-2 text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                      {lang === 'ar' ? 'أسعار محدثة يومياً' : 'Prices Updated Daily'}
                    </span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl sm:text-6xl lg:text-8xl font-black mb-6 leading-[1.05]"
            >
              {lang === 'ar' ? (
                <>
                  <span className="block text-white">أفضل أسعار</span>
                  <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    الألعاب في السعودية
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-white">Best Gaming</span>
                  <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                    Prices in Saudi
                  </span>
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-gray-400 text-lg sm:text-xl max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              {lang === 'ar'
                ? 'تتبع الأسعار، تحقق من الخصومات الحقيقية، واعثر على أفضل صفقات قطع الكمبيوتر وملحقات الألعاب'
                : 'Track prices, verify real discounts, and find the best deals on PC components and gaming gear'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <Link href="/deals" className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl px-10 py-4 font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform">
                  {t('hero.cta')}
                  <svg className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </Link>

              <Link href="/categories" className="group relative">
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-10 py-4 font-bold text-white hover:bg-white/10 hover:scale-105 transition-all">
                  {t('hero.cta2')}
                </div>
              </Link>
            </motion.div>

            {/* Animated Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex justify-center gap-12 sm:gap-20 mt-20"
            >
              {[
                { value: '1000+', labelEn: 'Products', labelAr: 'منتج' },
                { value: '24/7', labelEn: 'Monitoring', labelAr: 'مراقبة' },
                { value: '100%', labelEn: 'Free', labelAr: 'مجاني' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.value}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1 + i * 0.1, type: 'spring' }}
                  className="text-center"
                >
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-30" />
                    <p className="relative text-3xl sm:text-4xl font-black bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{lang === 'ar' ? stat.labelAr : stat.labelEn}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2"
            >
              <motion.div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            </motion.div>
          </motion.div>
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
              {lang === 'ar' ? 'لماذا نحن؟' : 'Why Choose Us?'}
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {lang === 'ar' ? 'نوفر لك أفضل الأدوات لتوفير المال' : 'We provide the best tools to save your money'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${f.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all duration-500">
                  <div className="text-6xl mb-6">{f.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-3">{lang === 'ar' ? f.titleAr : f.titleEn}</h3>
                  <p className="text-gray-400 leading-relaxed">{lang === 'ar' ? f.descAr : f.descEn}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="container-main py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-black text-white mb-2">{t('nav.categories')}</h2>
              <p className="text-gray-400">{lang === 'ar' ? 'تصفح حسب القسم' : 'Browse by category'}</p>
            </div>
            <Link href="/categories" className="group text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-2">
              {t('common.seeAll')}
              <svg className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <CategoryCard category={cat} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Deals Section */}
        <section className="container-main py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-black text-white mb-2">{t('deals.title')}</h2>
              <p className="text-gray-400">{t('deals.subtitle')}</p>
            </div>
            <Link href="/deals" className="group text-emerald-400 hover:text-emerald-300 font-medium transition-colors flex items-center gap-2">
              {t('common.seeAll')}
              <svg className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="card animate-pulse"
                >
                  <div className="aspect-[4/3] bg-gradient-to-b from-white/[0.02] to-transparent rounded-t-2xl relative overflow-hidden">
                    <div className="skeleton-shimmer absolute inset-0" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="h-2 bg-white/[0.04] rounded-full w-16" />
                    <div className="h-3.5 bg-white/[0.04] rounded-full w-full" />
                    <div className="h-5 bg-white/[0.06] rounded-full w-24 mt-3" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : error || deals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/[0.06]"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-5xl">
                🎮
              </div>
              <h3 className="text-white font-bold text-2xl mb-3">
                {lang === 'ar' ? 'العروض قادمة قريباً' : 'Deals Coming Soon'}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                {lang === 'ar'
                  ? 'نحن نجمع البيانات من أمازون السعودية. تحقق لاحقاً للعثور على أفضل الصفقات!'
                  : 'We\'re gathering data from Amazon.sa. Check back soon for the best deals!'}
              </p>
              <Link href="/categories" className="group relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl px-8 py-3 font-bold text-white">
                  {t('hero.cta2')}
                </div>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {deals.slice(0, 8).map((product, i) => (
                <motion.div
                  key={product.asin}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
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
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] opacity-50" />
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              animate={{
                background: [
                  'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 80% 50%, rgba(20, 184, 166, 0.1) 0%, transparent 50%)',
                  'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
                ],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            />

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
                {lang === 'ar' ? 'لا تدفع أكثر من اللازم' : 'Stop Overpaying'}
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
                {lang === 'ar'
                  ? 'ابحث عن أي منتج على أمازون السعودية وشاهد تاريخ أسعاره الحقيقي'
                  : 'Search any product on Amazon.sa and see its real price history'}
              </p>
              <Link href="/deals" className="group relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl px-10 py-4 font-bold text-white flex items-center gap-2 hover:scale-105 transition-transform">
                  {t('hero.cta')}
                  <svg className="w-5 h-5 rtl:rotate-180 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
