const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://sbgamers-api.ghmeshal7.workers.dev';

export interface Category {
  id: string;
  slug: string;
  name: string;
  search_query?: string;
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
  is_prime: boolean;
  is_best_seller: boolean;
  is_amazon_choice: boolean;
}

export interface ProductFull {
  asin: string;
  title: string;
  brand: string;
  description: string;
  key_features: string[];
  image_url: string;
  images: string[];
  current_price: number;
  original_price: number;
  discount_pct: number;
  rating: number;
  ratings_total: number;
  category_slug: string;
  category_name: string;
  amazon_url: string;
  availability: string;
  is_prime: boolean;
  is_best_seller: boolean;
  is_amazon_choice: boolean;
  top_reviews: Array<{
    review_id: string;
    reviewer_name: string;
    rating: number;
    review_title: string;
    review_text: string;
    review_date: string;
    is_verified_purchase: boolean;
    helpful_votes: number;
  }>;
  frequently_bought_together: Array<{
    asin: string;
    title: string;
    price: number;
    image_url: string;
  }>;
  variants: Array<{
    asin: string;
    price?: number;
    availability?: string;
    attributes: Record<string, string>;
  }>;
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

async function fetchApi<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
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

  getDeals: async (page = 1, minDiscount = 0): Promise<PaginatedResponse<Product>> => {
    const res = await fetchApi<{
      success: boolean;
      data: {
        deals: Array<{
          asin: string;
          title: string;
          main_image: string;
          price: number | null;
          original_price: number | null;
          discount_percentage: number | null;
          rating: number | null;
          ratings_count: number | null;
          is_prime: boolean;
          is_best_seller: boolean;
          is_amazon_choice: boolean;
          amazon_url: string;
          category_slug: string;
          category_name: string;
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
      is_prime: d.is_prime || false,
      is_best_seller: d.is_best_seller || false,
      is_amazon_choice: d.is_amazon_choice || false,
      category_slug: d.category_slug || '',
      category_name: d.category_name || '',
      amazon_url: d.amazon_url || `https://www.amazon.sa/dp/${d.asin}`,
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
          is_prime: boolean;
          is_best_seller: boolean;
          is_amazon_choice: boolean;
          amazon_url: string;
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
      is_prime: p.is_prime || false,
      is_best_seller: p.is_best_seller || false,
      is_amazon_choice: p.is_amazon_choice || false,
      category_slug: '',
      category_name: '',
      amazon_url: p.amazon_url || `https://www.amazon.sa/dp/${p.asin}`,
    }));

    return {
      products,
      total: res.data?.total_results || products.length,
      totalPages: Math.ceil((res.data?.total_results || products.length) / 20),
    };
  },

  getProduct: async (asin: string): Promise<ProductFull | null> => {
    const res = await fetchApi<{
      success: boolean;
      data: {
        asin: string;
        title: string | null;
        brand: string | null;
        description: string | null;
        key_features: string[];
        main_image: string | null;
        images: string[];
        price: number | null;
        original_price: number | null;
        discount_percentage: number | null;
        rating: number | null;
        ratings_count: number | null;
        category: string | null;
        category_hierarchy: string | null;
        availability: string | null;
        is_prime: boolean;
        is_best_seller: boolean;
        is_amazon_choice: boolean;
        amazon_url: string;
        top_reviews: Array<{
          review_id: string;
          reviewer_name: string;
          rating: number;
          review_title: string;
          review_text: string;
          review_date: string;
          is_verified_purchase: boolean;
          helpful_votes: number;
        }>;
        frequently_bought_together: Array<{
          asin: string;
          title: string;
          price: number;
          image_url: string;
        }>;
        variants: Array<{
          asin: string;
          price?: number;
          availability?: string;
          attributes: Record<string, string>;
        }>;
      };
    }>(`/product/${asin}`);

    if (!res.success || !res.data) return null;

    return {
      asin: res.data.asin,
      title: res.data.title || '',
      brand: res.data.brand || '',
      description: res.data.description || '',
      key_features: res.data.key_features || [],
      image_url: res.data.main_image || '',
      images: res.data.images || [],
      current_price: res.data.price || 0,
      original_price: res.data.original_price || 0,
      discount_pct: res.data.discount_percentage || 0,
      rating: res.data.rating || 0,
      ratings_total: res.data.ratings_count || 0,
      category_slug: '',
      category_name: res.data.category_hierarchy || res.data.category || '',
      amazon_url: res.data.amazon_url || `https://www.amazon.sa/dp/${res.data.asin}`,
      availability: res.data.availability || '',
      is_prime: res.data.is_prime || false,
      is_best_seller: res.data.is_best_seller || false,
      is_amazon_choice: res.data.is_amazon_choice || false,
      top_reviews: res.data.top_reviews || [],
      frequently_bought_together: res.data.frequently_bought_together || [],
      variants: res.data.variants || [],
    };
  },

  getCategoryProducts: async (
    slug: string,
    page = 1,
    sort = 'popular'
  ): Promise<PaginatedResponse<Product>> => {
    const res = await fetchApi<{
      success: boolean;
      data: {
        products: Array<{
          asin: string;
          title: string;
          main_image: string;
          price: number | null;
          original_price: number | null;
          discount_percentage: number | null;
          rating: number | null;
          ratings_count: number | null;
          is_prime: boolean;
          is_best_seller: boolean;
          is_amazon_choice: boolean;
          amazon_url: string;
        }>;
        total_count: number;
        total_pages: number;
        category_name: string;
      };
    }>(`/category/${slug}`, { page, sort, limit: 50 });

    const products: Product[] = (res.data?.products || []).map((p) => ({
      asin: p.asin,
      title: p.title || '',
      image_url: p.main_image || '',
      current_price: p.price || 0,
      original_price: p.original_price || 0,
      discount_pct: p.discount_percentage || 0,
      rating: p.rating || 0,
      ratings_total: p.ratings_count || 0,
      is_prime: p.is_prime || false,
      is_best_seller: p.is_best_seller || false,
      is_amazon_choice: p.is_amazon_choice || false,
      category_slug: slug,
      category_name: res.data?.category_name || slug,
      amazon_url: p.amazon_url || `https://www.amazon.sa/dp/${p.asin}`,
    }));

    return {
      products,
      total: res.data?.total_count || 0,
      totalPages: res.data?.total_pages || 1,
    };
  },

  getPriceHistory: async (asin: string): Promise<PriceHistoryEntry[]> => {
    try {
      const res = await fetchApi<{
        success: boolean;
        data: {
          asin: string;
          history: Array<{
            price: number;
            timestamp: string;
          }>;
        };
      }>(`/price-history/${asin}`, { days: 30 });

      return (res.data?.history || []).map((h) => ({
        price: h.price,
        recorded_at: new Date(h.timestamp).toLocaleDateString(),
      }));
    } catch {
      return [];
    }
  },
};
