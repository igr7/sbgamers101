'use client';

import { useEffect, useState } from 'react';
import { api, PriceHistoryEntry } from '@/lib/api';
import { useI18n } from '@/lib/i18n';
import { formatPrice, analyzePriceHistory } from '@/lib/utils';

interface Props {
  asin: string;
  currentPrice: number;
  originalPrice: number;
}

export default function PriceChart({ asin, currentPrice, originalPrice }: Props) {
  const { lang, t } = useI18n();
  const [history, setHistory] = useState<PriceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    api
      .getPriceHistory(asin)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [asin]);

  if (loading) {
    return <div className="animate-pulse h-64 bg-secondary border-2 border-border" />;
  }

  const dealVerdict = analyzePriceHistory(currentPrice, history);
  const maxPrice = Math.max(...history.map((h) => h.price), currentPrice, originalPrice);
  const minPrice = Math.min(...history.map((h) => h.price), currentPrice);
  const avgPrice = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.price, 0) / history.length)
    : currentPrice;

  const verdictConfig: Record<string, any> = {
    down: {
      bg: 'bg-accent',
      text: 'text-background',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: lang === 'ar' ? 'سعر منخفض' : 'Price Dropped',
    },
    up: {
      bg: 'bg-destructive',
      text: 'text-background',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      label: lang === 'ar' ? 'سعر مرتفع' : 'Price Increased',
    },
    stable: {
      bg: 'bg-muted',
      text: 'text-foreground',
      icon: (
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: lang === 'ar' ? 'سعر مستقر' : 'Price Stable',
    },
  };

  const verdict = verdictConfig[dealVerdict.trend];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-l-4 border-primary pl-4">
        <h3 className="text-lg sm:text-xl font-black text-foreground uppercase tracking-wider">{t('product.priceHistory')}</h3>
        <span className="text-xs text-muted-foreground font-mono">
          {history.length} points
        </span>
      </div>

      {/* Deal Verification Card */}
      <div className={`card-brutal p-4 flex items-start gap-3 ${verdict.bg} ${verdict.text}`}>
        {verdict.icon}
        <div>
          <p className="font-black text-sm uppercase tracking-wide mb-1">{verdict.label}</p>
          <p className="text-xs leading-relaxed font-semibold">
            {dealVerdict.trend === 'down'
              ? t('product.priceDropped')
              : dealVerdict.trend === 'up'
              ? t('product.priceIncreased')
              : t('product.priceStable')}
          </p>
        </div>
      </div>

      {/* Chart */}
      {history.length > 1 ? (
        <div className="card-brutal p-4 sm:p-6">
          <svg
            viewBox="0 0 600 200"
            className="w-full h-52"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Horizontal grid */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1="40"
                y1={ratio * 160 + 15}
                x2="590"
                y2={ratio * 160 + 15}
                stroke="hsl(var(--border))"
                strokeWidth="2"
              />
            ))}

            {/* Y-axis labels */}
            {[0, 0.5, 1].map((ratio) => {
              const price = maxPrice - ratio * (maxPrice - minPrice);
              return (
                <text
                  key={ratio}
                  x="35"
                  y={ratio * 160 + 19}
                  fill="hsl(var(--muted-foreground))"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="Space Mono"
                  fontWeight="700"
                >
                  {Math.round(price)}
                </text>
              );
            })}

            {/* Gradient area */}
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
              </linearGradient>
            </defs>

            <polygon
              fill="url(#areaGrad)"
              points={`50,175 ${history
                .map((entry, i) => {
                  const x = (i / (history.length - 1)) * 530 + 50;
                  const range = maxPrice - minPrice || 1;
                  const y = 175 - ((entry.price - minPrice) / range) * 160;
                  return `${x},${y}`;
                })
                .join(' ')} 580,175`}
            />

            {/* Price line */}
            <polyline
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="3"
              strokeLinejoin="miter"
              strokeLinecap="square"
              points={history
                .map((entry, i) => {
                  const x = (i / (history.length - 1)) * 530 + 50;
                  const range = maxPrice - minPrice || 1;
                  const y = 175 - ((entry.price - minPrice) / range) * 160;
                  return `${x},${y}`;
                })
                .join(' ')}
            />

            {/* Dots + hover targets */}
            {history.map((entry, i) => {
              const x = (i / (history.length - 1)) * 530 + 50;
              const range = maxPrice - minPrice || 1;
              const y = 175 - ((entry.price - minPrice) / range) * 160;
              const isHovered = hoveredIndex === i;
              return (
                <g key={i} onMouseEnter={() => setHoveredIndex(i)}>
                  <circle cx={x} cy={y} r="16" fill="transparent" />
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--accent))"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                  {isHovered && (
                    <>
                      <rect
                        x={x - 45}
                        y={y - 35}
                        width="90"
                        height="26"
                        fill="hsl(var(--card))"
                        stroke="hsl(var(--border))"
                        strokeWidth="2"
                      />
                      <text x={x} y={y - 16} fill="hsl(var(--foreground))" fontSize="11" textAnchor="middle" fontFamily="Space Mono" fontWeight="700">
                        {formatPrice(entry.price, lang)} {t('common.sar')}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* X-axis labels */}
            {history.filter((_, i) => i === 0 || i === history.length - 1 || i === Math.floor(history.length / 2)).map((entry, idx) => {
              const origIdx = idx === 0 ? 0 : idx === 1 ? Math.floor(history.length / 2) : history.length - 1;
              const x = (origIdx / (history.length - 1)) * 530 + 50;
              return (
                <text
                  key={origIdx}
                  x={x}
                  y="195"
                  fill="hsl(var(--muted-foreground))"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="Space Mono"
                  fontWeight="700"
                >
                  {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              );
            })}
          </svg>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t-2 border-border">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-bold">{t('price.lowest')}</p>
              <p className="text-sm font-black text-accent text-mono">{formatPrice(minPrice, lang)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-bold">{t('price.current')}</p>
              <p className="text-sm font-black text-foreground text-mono">{formatPrice(currentPrice, lang)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-bold">{t('price.average')}</p>
              <p className="text-sm font-black text-muted-foreground text-mono">{formatPrice(avgPrice, lang)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-bold">{t('price.highest')}</p>
              <p className="text-sm font-black text-destructive text-mono">{formatPrice(maxPrice, lang)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-brutal p-8 text-center">
          <p className="text-muted-foreground text-sm font-semibold">{t('product.notEnoughData')}</p>
        </div>
      )}
    </div>
  );
}
