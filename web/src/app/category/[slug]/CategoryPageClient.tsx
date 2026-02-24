'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api, Product } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FilterBar, { Filters } from '@/components/FilterBar';
import CategoryIcon from '@/components/CategoryIcon';

export default function CategoryPageClient() {
  const { slug } = useParams<{ slug: string }>();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [filters, setFilters] = useState<Filters>({ sort: 'discount' });

  useEffect(() => {
    setLoading(true);
    api.getCategoryProducts(slug, 1, 'popular')
      .then((res) => {
        setAllProducts(res.products);
        if (res.products[0]?.category_name) {
          setCategoryName(res.products[0].category_name);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const applyFilters = useCallback((prods: Product[], f: Filters) => {
    let result = [...prods];

    // Price filters
    if (f.min_price) result = result.filter(p => p.current_price >= f.min_price!);
    if (f.max_price) result = result.filter(p => p.current_price <= f.max_price!);

    // Prime filter
    if (f.prime_only) result = result.filter(p => p.is_prime);

    // Sort
    switch (f.sort) {
      case 'discount':
        result.sort((a, b) => b.discount_pct - a.discount_pct);
        break;
      case 'price_asc':
        result.sort((a, b) => a.current_price - b.current_price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.current_price - a.current_price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, []);

  useEffect(() => {
    setFilteredProducts(applyFilters(allProducts, filters));
  }, [filters, allProducts, applyFilters]);

  return (
    <>
      <Navbar />
      <main className="flex-1 container-main py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <span className="text-border">/</span>
          <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
            Categories
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">{categoryName || slug}</span>
        </div>

        {/* Header */}
        <div className="mb-8 border-l-4 border-primary pl-4 sm:pl-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <CategoryIcon slug={slug} className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
              {categoryName || slug}
            </h1>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-semibold uppercase tracking-wide">
            {filteredProducts.length} Products Available
          </p>
        </div>

        <FilterBar filters={filters} onChange={setFilters} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px', padding: '16px 0' }}>
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: '#1a1a2e', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '200px', backgroundColor: '#0f0f1a' }} />
                <div style={{ padding: '12px' }}>
                  <div style={{ height: '12px', backgroundColor: '#2a2a3e', marginBottom: '8px', width: '75%' }} />
                  <div style={{ height: '12px', backgroundColor: '#2a2a3e', width: '50%' }} />
                </div>
              </div>
            ))
          ) : filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#e4e4e7', marginBottom: '12px' }}>
                No Products Found
              </h3>
              <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>
                Try adjusting your filters or check back later
              </p>
              <button
                onClick={() => setFilters({ sort: 'discount' })}
                style={{ padding: '12px 24px', backgroundColor: '#00d2d3', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product.asin} product={product} />
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
