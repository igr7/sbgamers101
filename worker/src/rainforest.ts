import { Env, RainforestSearchResult, RainforestProductResult } from './types';

const API_BASE = 'https://api.rainforestapi.com/request';

export async function searchProducts(
  env: Env,
  searchTerm: string,
  page: number = 1
): Promise<RainforestSearchResult> {
  const params = new URLSearchParams({
    api_key: env.RAINFOREST_API_KEY,
    type: 'search',
    amazon_domain: 'amazon.sa',
    search_term: searchTerm,
    page: String(page),
    sort_by: 'featured',
  });

  const res = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) {
    throw new Error(`Rainforest API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<RainforestSearchResult>;
}

export async function getProduct(
  env: Env,
  asin: string
): Promise<RainforestProductResult> {
  const params = new URLSearchParams({
    api_key: env.RAINFOREST_API_KEY,
    type: 'product',
    amazon_domain: 'amazon.sa',
    asin,
  });

  const res = await fetch(`${API_BASE}?${params}`);
  if (!res.ok) {
    throw new Error(`Rainforest API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<RainforestProductResult>;
}
