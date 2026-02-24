// Value Score Calculation System
export function calculateValueScore(
  price: number,
  originalPrice: number,
  rating: number,
  discountPercentage: number
): number {
  if (!price || price <= 0) return 0;
  if (!rating || rating <= 0) return 0;

  // Formula: (Rating × Discount%) / (Price / 1000)
  // Normalize price to thousands for better scoring
  const normalizedPrice = price / 1000;
  const effectiveDiscount = discountPercentage > 0 ? discountPercentage : 1;

  const score = (rating * effectiveDiscount) / normalizedPrice;
  return Math.round(score * 10) / 10;
}

export function getValueBadge(score: number): {
  label: string;
  className: string;
  icon: string;
} | null {
  if (score >= 50) {
    return {
      label: 'Excellent Deal',
      className: 'badge-excellent',
      icon: '⭐'
    };
  }
  if (score >= 25) {
    return {
      label: 'Good Value',
      className: 'badge-good',
      icon: '✓'
    };
  }
  if (score >= 10) {
    return {
      label: 'Fair Price',
      className: 'badge-fair',
      icon: '○'
    };
  }
  return null;
}

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
      className: 'price-stable'
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
      className: 'price-down'
    };
  }

  if (change > 5) {
    return {
      trend: 'up',
      percentageChange: change,
      icon: '↑',
      className: 'price-up'
    };
  }

  return {
    trend: 'stable',
    percentageChange: Math.abs(change),
    icon: '→',
    className: 'price-stable'
  };
}

// Format price for display
export function formatPrice(price: number, currency: string = 'SAR'): string {
  return new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Category utilities
export function getCategoryEmoji(slug: string): string {
  const emojis: Record<string, string> = {
    cpu: '💻',
    gpu: '🎮',
    ram: '🪸',
    ssd: '💾',
    motherboard: '📡',
    psu: '⚡',
    case: '📦',
    cooling: '❄️',
    mouse: '🖱️',
    keyboard: '⌨️',
    headset: '🎧',
    monitor: '🖥️',
  };
  return emojis[slug] || '🎮';
}

export const CATEGORY_ICONS: Record<string, string> = {
  cpu: 'M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
  gpu: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  ram: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  ssd: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4',
  motherboard: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  psu: 'M13 10V3L4 14h7v7l9-11h-7z',
  case: 'M20 7v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2zM10 12a2 2 0 11-4 0 2 2 0 014 0z',
  cooling: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
  mouse: 'M12 19V5m0 0a7 7 0 00-7 7v2a7 7 0 0014 0v-2a7 7 0 00-7-7zm0 0V2',
  keyboard: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  headset: 'M3 18v-6a9 9 0 0118 0v6M3 18a3 3 0 003 3h0a3 3 0 003-3v-2a3 3 0 00-3-3h0a3 3 0 00-3 3zm18 0a3 3 0 01-3 3h0a3 3 0 01-3-3v-2a3 3 0 013-3h0a3 3 0 013 3z',
  monitor: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};

// Utility function for cn (classnames)
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
