export interface Env {
  DB: D1Database;
  RAINFOREST_API_KEY: string;
  ALLOWED_ORIGIN: string;
}

export interface RainforestProduct {
  asin: string;
  title: string;
  image: string;
  link: string;
  price?: {
    value: number;
    raw: string;
    currency: string;
  };
  rrp?: {
    value: number;
    raw: string;
  };
  rating?: number;
  ratings_total?: number;
  is_prime?: boolean;
}

export interface RainforestSearchResult {
  search_results: RainforestProduct[];
  search_information?: {
    total_results: number;
  };
}

export interface RainforestProductResult {
  product: {
    asin: string;
    title: string;
    main_image?: { link: string };
    buybox_winner?: {
      price?: { value: number; currency: string };
      rrp?: { value: number };
    };
    rating?: number;
    ratings_total?: number;
    link: string;
  };
}

export interface CategorySearch {
  slug: string;
  categoryId: number;
  searchTerms: string[];
}
