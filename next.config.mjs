/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    instrumentationHook: true,
  },
  env: {
    OMKAR_API_KEY: process.env.OMKAR_API_KEY,
    OMKAR_API_BASE: process.env.OMKAR_API_BASE,
    OMKAR_MONTHLY_QUOTA: process.env.OMKAR_MONTHLY_QUOTA,
    OMKAR_QUOTA_ALERT_THRESHOLD: process.env.OMKAR_QUOTA_ALERT_THRESHOLD,
    CACHE_PRODUCT_TTL: process.env.CACHE_PRODUCT_TTL,
    CACHE_PRICE_TTL: process.env.CACHE_PRICE_TTL,
    CACHE_SEARCH_TTL: process.env.CACHE_SEARCH_TTL,
    CACHE_DEALS_TTL: process.env.CACHE_DEALS_TTL,
    CACHE_REVIEWS_TTL: process.env.CACHE_REVIEWS_TTL,
    PRICE_SNAPSHOT_INTERVAL_HOURS: process.env.PRICE_SNAPSHOT_INTERVAL_HOURS,
    MAX_TRACKED_PRODUCTS: process.env.MAX_TRACKED_PRODUCTS,
    API_SECRET_KEY: process.env.API_SECRET_KEY,
    ALERT_WEBHOOK_URL: process.env.ALERT_WEBHOOK_URL,
  },
}

export default nextConfig