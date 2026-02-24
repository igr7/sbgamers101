// Price History Analysis
export interface PriceHistoryEntry {
  price: number;
  timestamp: number;
}

export function analyzePriceHistory(
  currentPrice: number,
  history: PriceHistoryEntry[]
): {
  trend: 'down' | 'up' | 'stable';
  percentageChange: number;
  icon: string;
  className: string;
} {
  if (!history || history.length < 2) {
    return {
      trend: 'stable',
      percentageChange: 0,
      icon: '→',
      className: 'text-muted-foreground'
    };
  }

  // Compare current price with average of last 7 days
  const recentPrices = history.slice(0, 7).map(h => h.price);
  const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;

  const change = ((currentPrice - avgPrice) / avgPrice) * 100;

  if (change < -5) {
    return {
      trend: 'down',
      percentageChange: Math.abs(change),
      icon: '↓',
      className: 'text-accent'
    };
  }

  if (change > 5) {
    return {
      trend: 'up',
      percentageChange: change,
      icon: '↑',
      className: 'text-destructive'
    };
  }

  return {
    trend: 'stable',
    percentageChange: Math.abs(change),
    icon: '→',
    className: 'text-muted-foreground'
  };
}

// Format price for display
export function formatPrice(price: number, lang: string = 'en'): string {
  if (!price || price <= 0) return '0';
  return Math.round(price).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US');
}

// Data cleaning utilities
export function cleanTitle(title: string): string {
  if (!title) return '';
  // Remove weird characters, limit to 80 chars
  return title.replace(/[^\w\s\u0600-\u06FF\-,().]/g, '').trim().slice(0, 80);
}

export function cleanImageUrl(url: string): string {
  if (!url || url === 'N/A' || url === 'undefined' || url === 'null') {
    return '/placeholder.png';
  }
  // Ensure HTTPS
  return url.replace('http://', 'https://');
}

export function parsePrice(price: any): number {
  if (!price || price === 'N/A' || price === 'undefined' || price === 'null') return 0;
  const parsed = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

export function calculateDiscount(current: number, original: number): number {
  if (!original || original <= 0 || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

export function cleanProduct(raw: any): any {
  const current = parsePrice(raw.price || raw.current_price || raw.product_price || 0);
  const original = parsePrice(raw.original_price || raw.product_original_price || 0);
  const asin = raw.asin || raw.product_id || '';

  return {
    asin,
    title: cleanTitle(raw.title || raw.product_title || ''),
    image_url: cleanImageUrl(raw.image || raw.image_url || raw.main_image || raw.thumbnail || raw.product_photo || ''),
    current_price: current,
    original_price: original,
    discount_pct: calculateDiscount(current, original),
    rating: parseFloat(raw.rating || raw.product_star_rating || 0) || 0,
    ratings_total: parseInt(raw.reviews || raw.ratings_total || raw.ratings_count || raw.product_num_ratings || 0) || 0,
    is_prime: Boolean(raw.is_prime || raw.prime),
    is_best_seller: Boolean(raw.is_best_seller),
    is_amazon_choice: Boolean(raw.is_amazon_choice),
    category_slug: raw.category_slug || '',
    category_name: raw.category_name || '',
    amazon_url: raw.amazon_url || `https://www.amazon.sa/dp/${asin}`
  };
}

// Category slug validation
export function isValidCategorySlug(slug: string): boolean {
  const validSlugs = ['gpu', 'cpu', 'monitor', 'keyboard', 'mouse', 'headset', 'ram', 'ssd', 'motherboard', 'psu', 'case', 'cooling'];
  return validSlugs.includes(slug);
}
