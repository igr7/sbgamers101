'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/lib/api';
import CategoryIcon from '@/components/CategoryIcon';

interface Props {
  category: Category;
  index?: number;
}

export default function CategoryCard({ category, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
    >
      <Link href={`/category/${category.slug}`} className="block card-brutal p-4 sm:p-6 text-center hover:border-primary transition-sharp">
        <div className="mb-3 sm:mb-4 flex justify-center">
          <CategoryIcon slug={category.slug} className="w-10 h-10 sm:w-12 sm:h-12 text-foreground group-hover:text-primary transition-colors" />
        </div>
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
          {category.name}
        </h3>
      </Link>
    </motion.div>
  );
}
