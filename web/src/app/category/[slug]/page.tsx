import CategoryPageClient from './CategoryPageClient';

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
