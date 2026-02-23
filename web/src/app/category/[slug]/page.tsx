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
    { slug: 'motherboard' },
    { slug: 'chair' },
    { slug: 'cooling' },
    { slug: 'psu' },
    { slug: 'case' },
  ];
}

export default function CategoryPage() {
  return <CategoryPageClient />;
}
