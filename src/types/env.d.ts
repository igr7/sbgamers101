export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      REDIS_URL: string
      OMKAR_API_KEY: string
      OMKAR_API_BASE?: string
      OMKAR_MONTHLY_QUOTA?: string
      OMKAR_QUOTA_ALERT_THRESHOLD?: string
      CACHE_PRODUCT_TTL?: string
      CACHE_PRICE_TTL?: string
      CACHE_SEARCH_TTL?: string
      CACHE_DEALS_TTL?: string
      CACHE_REVIEWS_TTL?: string
      PRICE_SNAPSHOT_INTERVAL_HOURS?: string
      MAX_TRACKED_PRODUCTS?: string
      API_SECRET_KEY?: string
      ALERT_WEBHOOK_URL?: string
      LOG_LEVEL?: string
      NODE_ENV?: string
    }
  }
}