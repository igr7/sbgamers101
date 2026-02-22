const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://sbgamers101-5amqpe.cranl.net';

export interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
}

export interface Product {
  asin: string;
  title: string;
  image_url: string;
  current_price: number;
  original_price: number;
  discount_pct: number;
  rating: number;
  ratings_total: number;
  category_slug: string;
  category_name: string;
  amazon_url: string;
  last_updated: string;
}

export interface PriceHistoryEntry {
  price: number;
  recorded_at: string;
}

export interface PaginatedResponse<T> {
  products: T[];
  total: number;
  totalPages: number;
}

async function fetchApi<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`/api/v1${path}`, API_BASE);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  return data;
}

export const api = {
  getCategories: async (): Promise<Category[]> => {
    const res = await fetchApi<{ success: boolean; data: Category[] }>('/categories');
    return res.data || [];
  },

  getDeals: async (page = 1, minDiscount = 10): Promise<PaginatedResponse<Product>> => {
    const res = await fetchApi<{
      success: boolean;
      data: {
        deals: Array<{
          asin: string;
          title: string | null;
          main_image: string | null;
          price: number | null;
          original_price: number | null;
          discount_percentage: number | null;
          rating: number | null;
          ratings_count: number | null;
        }>;
        total_count: number;
        total_pages: number;
      };
    }>('/deals', { page, min_discount: minDiscount, limit: 20 });

    const products: Product[] = (res.data?.deals || []).map((d) => ({
      asin: d.asin,
      title: d.title || '',
      image_url: d.main_image || '',
      current_price: d.price || 0,
      original_price: d.original_price || 0,
      discount_pct: d.discount_percentage || 0,
      rating: d.rating || 0,
      ratings_total: d.ratings_count || 0,
      category_slug: '',
      category_name: '',
      amazon_url: `https://www.amazon.sa/dp/${d.asin}`,
      last_updated: new Date().toISOString(),
    }));

    return {
      products,
      total: res.data?.total_count || 0,
      totalPages: res.data?.total_pages || 1,
    };
  },

  searchProducts: async (query: string, page = 1): Promise<PaginatedResponse<Product>> => {
    const res = await fetchApi<{
      success: boolean;
      data: {
        products: Array<{
          asin: string;
          title: string;
          price: number | null;
          original_price: number | null;
          discount_percentage: number | null;
          rating: number | null;
          ratings_count: number | null;
          image_url: string;
        }>;
        total_results: number;
      };
    }>('/search', { q: query, page });

    const products: Product[] = (res.data?.products || []).map((p) => ({
      asin: p.asin,
      title: p.title,
      image_url: p.image_url,
      current_price: p.price || 0,
      original_price: p.original_price || 0,
      discount_pct: p.discount_percentage || 0,
      rating: p.rating || 0,
      ratings_total: p.ratings_count || 0,
      category_slug: '',
      category_name: '',
      amazon_url: `https://www.amazon.sa/dp/${p.asin}`,
      last_updated: new Date().toISOString(),
    }));

    return {
      products,
      total: res.data?.total_results || products.length,
      totalPages: Math.ceil((res.data?.total_results || products.length) / 20),
    };
  },

  getProduct: async (asin: string): Promise<Product | null> => {
    const res = await fetchApi<{
      success: boolean;
      data: {
        asin: string;
        title: string | null;
        main_image: string | null;
        price: number | null;
        original_price: number | null;
        discount_percentage: number | null;
        rating: number | null;
        ratings_count: number | null;
        category_hierarchy: string | null;
      };
    }>(`/product/${asin}`);

    if (!res.success || !res.data) return null;

    return {
      asin: res.data.asin,
      title: res.data.title || '',
      image_url: res.data.main_image || '',
      current_price: res.data.price || 0,
      original_price: res.data.original_price || 0,
      discount_pct: res.data.discount_percentage || 0,
      rating: res.data.rating || 0,
      ratings_total: res.data.ratings_count || 0,
      category_slug: '',
      category_name: res.data.category_hierarchy || '',
      amazon_url: `https://www.amazon.sa/dp/${res.data.asin}`,
      last_updated: new Date().toISOString(),
    };
  },

  getCategoryProducts: async (
    slug: string,
    page = 1,
    sort = 'discount_desc'
  ): Promise<PaginatedResponse<Product>> => {
    const res = await fetchApi<{
      success: boolean;
      data: {
        products: Array<{
          asin: string;
          title: string | null;
          main_image: string | null;
          price: number | null;
          original_price: number | null;
          discount_percentage: number | null;
          rating: number | null;
          ratings_count: number | null;
        }>;
        total_count: number;
        total_pages: number;
      };
    }>('/products', { page, sort, limit: 20 });

    const products: Product[] = (res.data?.products || []).map((p) => ({
      asin: p.asin,
      title: p.title || '',
      image_url: p.main_image || '',
      current_price: p.price || 0,
      original_price: p.original_price || 0,
      discount_pct: p.discount_percentage || 0,
      rating: p.rating || 0,
      ratings_total: p.ratings_count || 0,
      category_slug: slug,
      category_name: slug,
      amazon_url: `https://www.amazon.sa/dp/${p.asin}`,
      last_updated: new Date().toISOString(),
    }));

    return {
      products,
      total: res.data?.total_count || 0,
      totalPages: res.data?.total_pages || 1,
    };
  },

  getPriceHistory: async (asin: string): Promise<PriceHistoryEntry[]> => {
    const res = await fetchApi<{
      success: boolean;
      data: {
        history: Array<{
          timestamp: string;
          price: number | null;
        }>;
      };
    }>(`/price-history/${asin}`, { days: 30 });

    return (res.data?.history || [])
      .filter((h) => h.price !== null)
      .map((h) => ({
        price: h.price || 0,
        recorded_at: new Date(h.timestamp).toLocaleDateString(),
      }));
  },
};
