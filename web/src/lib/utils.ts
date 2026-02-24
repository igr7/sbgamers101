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

// Category emoji mapping
export function getCategoryEmoji(slug: string): string {
  const emojiMap: Record<string, string> = {
    gpu: '🎮',
    cpu: '⚡',
    monitor: '🖥️',
    keyboard: '⌨️',
    mouse: '🖱️',
    headset: '🎧',
    ram: '💾',
    ssd: '💿',
    motherboard: '🔌',
    psu: '🔋',
    case: '📦',
    cooling: '❄️',
  };
  return emojiMap[slug] || '🎮';
}
