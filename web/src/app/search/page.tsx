'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, Product } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FilterBar, { Filters } from '@/components/FilterBar';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ sort: 'discount' });

  useEffect(() => {
    if (!query) {
      setAllProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api.searchProducts(query, 1)
      .then((res) => {
        setAllProducts(res.products);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [query]);

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
    <main className="flex-1 container-main py-8">
      {/* Header */}
      <div className="mb-8 border-l-4 border-accent pl-6">
        <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
          {query ? (
            <>
              Search: <span className="text-accent">{query}</span>
            </>
          ) : 'Search'}
        </h1>
        {filteredProducts.length > 0 && (
          <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
            {filteredProducts.length} Products Found
          </p>
        )}
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
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔍</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#e4e4e7', marginBottom: '12px' }}>
              No Results Found
            </h3>
            <p style={{ color: '#a1a1aa' }}>
              {query ? `No products found for "${query}"` : 'Enter a search query to find products'}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.asin} product={product} />
          ))
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-border border-t-primary animate-spin" />
        </div>
      }>
        <SearchResults />
      </Suspense>
      <Footer />
    </>
  );
}
