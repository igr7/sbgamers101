const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.sbgamers.com';

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export interface Category {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  icon: string;
  sort_order: number;
}

export interface Product {
  id: number;
  asin: string;
  category_id: number;
  title: string;
  title_ar?: string;
  image_url: string;
  current_price: number;
  original_price: number;
  discount_pct: number;
  currency: string;
  rating: number;
  ratings_total: number;
  amazon_url: string;
  in_stock: number;
  last_updated: string;
  category_slug?: string;
  category_name?: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PriceHistoryEntry {
  price: number;
  recorded_at: string;
}

export const api = {
  getCategories: () => fetchApi<Category[]>('/api/categories'),

  getCategoryProducts: (slug: string, page = 1, sort = 'discount') =>
    fetchApi<ProductsResponse>(`/api/categories/${slug}/products?page=${page}&sort=${sort}`),

  searchProducts: (q: string, page = 1) =>
    fetchApi<ProductsResponse>(`/api/search?q=${encodeURIComponent(q)}&page=${page}`),

  getProduct: (asin: string) => fetchApi<Product>(`/api/products/${asin}`),

  getPriceHistory: (asin: string) =>
    fetchApi<PriceHistoryEntry[]>(`/api/products/${asin}/history`),

  getDeals: (page = 1, minDiscount = 10) =>
    fetchApi<ProductsResponse>(`/api/deals?page=${page}&min_discount=${minDiscount}`),
};
