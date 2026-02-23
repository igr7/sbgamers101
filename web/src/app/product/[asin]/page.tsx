import ProductPageClient from './ProductPageClient';

export async function generateStaticParams() {
  return [];
}

export default function ProductPage() {
  return <ProductPageClient />;
}
