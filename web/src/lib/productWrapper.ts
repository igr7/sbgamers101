/**
 * Product Data Wrapper & Sanitizer
 * Ensures all product data is properly formatted and validated before hitting the UI
 */

export interface RawProductData {
  asin: string;
  title?: string | null;
  main_image?: string | null;
  image_url?: string | null;
  price?: number | null;
  current_price?: number | null;
  original_price?: number | null;
  discount_percentage?: number | null;
  discount_pct?: number | null;
  rating?: number | null;
  ratings_count?: number | null;
  ratings_total?: number | null;
  is_prime?: boolean;
  is_best_seller?: boolean;
  is_amazon_choice?: boolean;
  amazon_url?: string;
  category_slug?: string;
  category_name?: string;
  availability?: string;
  brand?: string;
}

export interface SanitizedProduct {
  asin: string;
  title: string;
  imageUrl: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  hasDiscount: boolean;
  rating: number;
  ratingsCount: number;
  isPrime: boolean;
  isBestSeller: boolean;
  isAmazonChoice: boolean;
  amazonUrl: string;
  categorySlug: string;
  categoryName: string;
  availability: string;
  brand: string;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  priceFormatted: string;
  savingsAmount: number;
}

/**
 * Sanitize and validate product data
 */
export function wrapProduct(raw: RawProductData): SanitizedProduct {
  // Extract price data
  const price = raw.price ?? raw.current_price ?? 0;
  const originalPrice = raw.original_price ?? price;
  const discountPct = raw.discount_percentage ?? raw.discount_pct ?? 0;

  // Calculate real discount
  const hasRealDiscount = originalPrice > price && price > 0;
  const actualDiscount = hasRealDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  // Determine stock status from availability text
  const availabilityText = (raw.availability ?? '').toLowerCase();
  let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';

  if (availabilityText.includes('out of stock') || availabilityText.includes('unavailable')) {
    stockStatus = 'out_of_stock';
  } else if (availabilityText.includes('only') && availabilityText.includes('left')) {
    stockStatus = 'low_stock';
  }

  // Build affiliate URL
  const asin = raw.asin || '';
  const amazonUrl = raw.amazon_url || `https://www.amazon.sa/dp/${asin}`;
  const affiliateUrl = addAffiliateTag(amazonUrl);

  return {
    asin,
    title: sanitizeTitle(raw.title || 'Unknown Product'),
    imageUrl: raw.main_image || raw.image_url || '/placeholder-product.png',
    price,
    originalPrice,
    discountPercentage: actualDiscount,
    hasDiscount: hasRealDiscount && actualDiscount >= 5, // Only show if 5%+ discount
    rating: Math.max(0, Math.min(5, raw.rating ?? 0)),
    ratingsCount: Math.max(0, raw.ratings_count ?? raw.ratings_total ?? 0),
    isPrime: raw.is_prime ?? false,
    isBestSeller: raw.is_best_seller ?? false,
    isAmazonChoice: raw.is_amazon_choice ?? false,
    amazonUrl: affiliateUrl,
    categorySlug: raw.category_slug || '',
    categoryName: raw.category_name || '',
    availability: raw.availability || 'In Stock',
    brand: raw.brand || '',
    stockStatus,
    priceFormatted: formatSAR(price),
    savingsAmount: hasRealDiscount ? originalPrice - price : 0,
  };
}

/**
 * Batch wrap multiple products
 */
export function wrapProducts(rawProducts: RawProductData[]): SanitizedProduct[] {
  return rawProducts
    .filter(p => p.asin && p.price && p.price > 0) // Filter out invalid products
    .map(wrapProduct);
}

/**
 * Sanitize product title
 */
function sanitizeTitle(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .slice(0, 200); // Limit length
}

/**
 * Add affiliate tag to Amazon URL
 */
function addAffiliateTag(url: string, tag: string = 'sbgamers-21'): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('tag', tag);
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Format price in SAR
 */
function formatSAR(price: number): string {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Filter products by criteria
 */
export interface FilterCriteria {
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  minRating?: number;
  brands?: string[];
  primeOnly?: boolean;
}

export function filterProducts(
  products: SanitizedProduct[],
  criteria: FilterCriteria
): SanitizedProduct[] {
  return products.filter(product => {
    // Price range filter
    if (criteria.minPrice !== undefined && product.price < criteria.minPrice) {
      return false;
    }
    if (criteria.maxPrice !== undefined && product.price > criteria.maxPrice) {
      return false;
    }

    // Discount filter
    if (criteria.minDiscount !== undefined && product.discountPercentage < criteria.minDiscount) {
      return false;
    }

    // Rating filter
    if (criteria.minRating !== undefined && product.rating < criteria.minRating) {
      return false;
    }

    // Brand filter
    if (criteria.brands && criteria.brands.length > 0) {
      if (!criteria.brands.some(brand =>
        product.brand.toLowerCase().includes(brand.toLowerCase())
      )) {
        return false;
      }
    }

    // Prime filter
    if (criteria.primeOnly && !product.isPrime) {
      return false;
    }

    return true;
  });
}

/**
 * Sort products
 */
export type SortOption = 'popular' | 'price_low' | 'price_high' | 'discount' | 'rating';

export function sortProducts(
  products: SanitizedProduct[],
  sortBy: SortOption
): SanitizedProduct[] {
  const sorted = [...products];

  switch (sortBy) {
    case 'price_low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'discount':
      return sorted.sort((a, b) => b.discountPercentage - a.discountPercentage);
    case 'rating':
      return sorted.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.ratingsCount - a.ratingsCount;
      });
    case 'popular':
    default:
      return sorted.sort((a, b) => b.ratingsCount - a.ratingsCount);
  }
}
