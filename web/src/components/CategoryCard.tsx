'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/lib/api';

interface Props {
  category: Category;
  index?: number;
}

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

const CATEGORY_GRADIENTS: Record<string, string> = {
  gpu: 'from-cyan-500 to-blue-500',
  cpu: 'from-purple-500 to-pink-500',
  monitor: 'from-emerald-500 to-teal-500',
  keyboard: 'from-orange-500 to-red-500',
  mouse: 'from-indigo-500 to-purple-500',
  headset: 'from-pink-500 to-rose-500',
  ram: 'from-blue-500 to-cyan-500',
  ssd: 'from-violet-500 to-purple-500',
  motherboard: 'from-teal-500 to-emerald-500',
  psu: 'from-amber-500 to-orange-500',
  case: 'from-slate-500 to-gray-500',
  cooling: 'from-sky-500 to-blue-500',
};

export default function CategoryCard({ category, index = 0 }: Props) {
  const icon = CATEGORY_ICONS[category.slug] || '🎯';
  const gradient = CATEGORY_GRADIENTS[category.slug] || 'from-cyan-500 to-purple-500';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group"
    >
      <Link href={`/category/${category.slug}`} className="block">
        <div className="relative">
          {/* Glow Effect */}
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500`} />

          {/* Card */}
          <div className="relative bg-gradient-to-br from-[#1a1a24] to-[#12121a] border border-white/10 group-hover:border-white/20 rounded-2xl p-6 transition-all duration-300 flex flex-col items-center gap-4">
            {/* Icon Container */}
            <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
              <span className="text-3xl">{icon}</span>
            </div>

            {/* Category Name */}
            <div className="text-center">
              <h3 className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                {category.name}
              </h3>
            </div>

            {/* Arrow Icon */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
