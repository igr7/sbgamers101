import CategoryPageClient from './CategoryPageClient';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  return [
    { slug: 'gpu' },
    { slug: 'cpu' },
    { slug: 'monitor' },
    { slug: 'keyboard' },
    { slug: 'mouse' },
    { slug: 'headset' },
    { slug: 'ram' },
    { slug: 'ssd' },
    { slug: 'motherboard' },
    { slug: 'psu' },
    { slug: 'case' },
    { slug: 'cooling' },
  ];
}

export default function CategoryPage() {
  return <CategoryPageClient />;
}
