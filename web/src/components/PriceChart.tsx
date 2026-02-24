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
    return <div className="animate-pulse h-64 bg-white/[0.03] rounded-2xl" />;
  }

  const dealVerdict = analyzePriceHistory(currentPrice, history);
  const maxPrice = Math.max(...history.map((h) => h.price), currentPrice, originalPrice);
  const minPrice = Math.min(...history.map((h) => h.price), currentPrice);
  const avgPrice = history.length > 0
    ? Math.round(history.reduce((sum, h) => sum + h.price, 0) / history.length)
    : currentPrice;

  const verdictConfig: Record<string, any> = {
    down: {
      bg: 'bg-emerald-500/[0.08]',
      border: 'border-emerald-500/20',
      icon: (
        <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: lang === 'ar' ? 'سعر منخفض' : 'Price Dropped',
    },
    up: {
      bg: 'bg-red-500/[0.08]',
      border: 'border-red-500/20',
      icon: (
        <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      label: lang === 'ar' ? 'سعر مرتفع' : 'Price Increased',
    },
    stable: {
      bg: 'bg-amber-500/[0.08]',
      border: 'border-amber-500/20',
      icon: (
        <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: lang === 'ar' ? 'سعر مستقر' : 'Price Stable',
    },
  };

  const verdict = verdictConfig[dealVerdict.trend];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{t('product.priceHistory')}</h3>
        <span className="text-xs text-gray-600">
          {history.length} data points
        </span>
      </div>

      {/* Deal Verification Card */}
      <div className={`p-4 rounded-xl border ${verdict.bg} ${verdict.border} flex items-start gap-3`}>
        {verdict.icon}
        <div>
          <p className="font-semibold text-sm text-white mb-0.5">{verdict.label}</p>
          <p className="text-xs text-gray-400 leading-relaxed">
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
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-6">
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
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="1"
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
                  fill="rgba(255,255,255,0.2)"
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="Inter"
                >
                  {Math.round(price)}
                </text>
              );
            })}

            {/* Gradient area */}
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
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
              stroke="#10b981"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
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
                    r={isHovered ? 5 : 3}
                    fill={isHovered ? '#10b981' : '#0a0a0f'}
                    stroke="#10b981"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                  {isHovered && (
                    <>
                      <rect
                        x={x - 40}
                        y={y - 32}
                        width="80"
                        height="22"
                        rx="6"
                        fill="#1a1a24"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                      <text x={x} y={y - 18} fill="white" fontSize="10" textAnchor="middle" fontFamily="Inter" fontWeight="600">
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
                  fill="rgba(255,255,255,0.2)"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="Inter"
                >
                  {new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </text>
              );
            })}
          </svg>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/[0.06]">
            <div className="stat-card">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{t('price.lowest')}</p>
              <p className="text-sm font-bold text-emerald-400">{formatPrice(minPrice, lang)}</p>
            </div>
            <div className="stat-card">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{t('price.current')}</p>
              <p className="text-sm font-bold text-white">{formatPrice(currentPrice, lang)}</p>
            </div>
            <div className="stat-card">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{t('price.average')}</p>
              <p className="text-sm font-bold text-gray-400">{formatPrice(avgPrice, lang)}</p>
            </div>
            <div className="stat-card">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{t('price.highest')}</p>
              <p className="text-sm font-bold text-red-400">{formatPrice(maxPrice, lang)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] p-8 text-center">
          <p className="text-gray-600 text-sm">{t('product.notEnoughData')}</p>
        </div>
      )}
    </div>
  );
}
