export function formatPrice(price: number, lang: 'en' | 'ar' = 'en'): string {
  return price.toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-SA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function analyzeDeal(
  currentPrice: number,
  originalPrice: number,
  history: { price: number; recorded_at: string }[]
): 'real' | 'fake' | 'unknown' {
  if (history.length < 3) return 'unknown';
  const higherPriceCount = history.filter((h) => h.price > currentPrice * 1.05).length;
  const ratio = higherPriceCount / history.length;
  if (ratio >= 0.3) return 'real';
  return 'fake';
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
