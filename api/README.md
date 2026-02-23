# Amazon Saudi Arabia (amazon.sa) Data API System

A complete, production-ready API system for fetching Amazon Saudi Arabia product data, price history, deals, and more.

## Features

- **Product Data** - Full product information from ASIN
- **Search** - Product search with filters
- **Price History** - Track price changes over time
- **Deals** - Find best deals from our product database
- **Products Browser** - Browse/filter all products
- **Reviews** - Product reviews
- **Admin Routes** - Cache management & API monitoring

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Next.js 14 App Router
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis (ioredis)
- **Data Source**: omkar.cloud Amazon Scraper API
- **Queue**: Bull (Redis-based background jobs)

## Quick Start

### Prerequisites

1. Node.js 18+
2. PostgreSQL database
3. Redis instance
4. omkar.cloud API key

### Environment Setup

```bash
# Navigate to API directory
cd api

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Edit .env.local with your credentials

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Redis
REDIS_URL="redis://localhost:6379"

# omkar.cloud API
OMKAR_API_KEY="ok_your_api_key"
OMKAR_API_BASE="https://amazon-scraper-api.omkar.cloud"
OMKAR_MONTHLY_QUOTA=5000
OMKAR_QUOTA_ALERT_THRESHOLD=4500

# Cache TTL (seconds)
CACHE_PRODUCT_TTL=21600
CACHE_PRICE_TTL=3600
CACHE_SEARCH_TTL=1800
CACHE_DEALS_TTL=900
CACHE_REVIEWS_TTL=86400

# Jobs
PRICE_SNAPSHOT_INTERVAL_HOURS=1
MAX_TRACKED_PRODUCTS=100

# Security
API_SECRET_KEY="your-secret-key"
ALERT_WEBHOOK_URL="https://your-webhook.com/alert"
```

## API Documentation

### 1. Product Data

```
GET /api/v1/product/{asin}
```

Returns complete product information including price, rating, images, variants, etc.

**Response:**
```json
{
  "success": true,
  "data": {
    "asin": "B08N5WRWNW",
    "title": "Product Title",
    "brand": "Brand Name",
    "price": 299.00,
    "original_price": 399.00,
    "discount_percentage": 25,
    "currency": "SAR",
    "rating": 4.5,
    "ratings_count": 1234,
    "main_image": "https://...",
    "images": ["https://..."],
    "is_prime": true,
    "is_best_seller": false,
    "is_amazon_choice": true,
    "availability": "In Stock",
    "marketplace": "amazon.sa"
  },
  "cached": false,
  "source": "api"
}
```

### 2. Product Search

```
GET /api/v1/search?q={query}&page=1&sort=relevance&min_price=0&max_price=1000&prime_only=false&min_rating=4
```

**Parameters:**
- `q` (required) - Search query
- `page` - Page number (default: 1)
- `sort` - Sort order: relevance, price_asc, price_desc, rating, newest, best_sellers
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `prime_only` - Filter Prime products only
- `min_rating` - Minimum rating filter
- `min_discount` - Minimum discount percentage

### 3. Price History

```
GET /api/v1/price-history/{asin}?days=30&interval=daily
```

**Parameters:**
- `days` - History period: 7, 30, 90, 180, or "all"
- `interval` - Aggregation: hourly, daily, weekly

**Response:**
```json
{
  "success": true,
  "data": {
    "asin": "B08N5WRWNW",
    "current_price": 299.00,
    "all_time_low": { "price": 249.00, "date": "2024-01-15" },
    "all_time_high": { "price": 449.00, "date": "2024-02-01" },
    "average_price_30d": 320.50,
    "price_change_percentage": -10,
    "tracking_since": "2024-01-01",
    "history": [
      { "timestamp": "2024-03-01", "price": 299.00, "discount_pct": 25 }
    ]
  }
}
```

### 4. Deals

```
GET /api/v1/deals?min_discount=20&sort=biggest_discount&prime_only=true
```

**Parameters:**
- `min_discount` - Minimum discount percentage (default: 10)
- `min_rating` - Minimum rating
- `sort` - biggest_discount, lowest_price, highest_rating, most_reviewed
- `prime_only` - Prime products only
- `best_seller_only` - Best sellers only
- `page`, `limit` - Pagination

### 5. Products Browser

```
GET /api/v1/products?sort=most_popular&min_price=100&max_price=500&brand=Samsung
```

**Parameters:**
- `sort` - price_asc, price_desc, rating_desc, discount_desc, newest, most_reviewed, most_popular
- `min_price`, `max_price` - Price range
- `min_rating`, `min_discount` - Rating and discount filters
- `prime_only`, `best_seller_only`, `amazon_choice_only` - Feature filters
- `brand` - Brand name (partial match)
- `page`, `limit` - Pagination

### 6. Product Reviews

```
GET /api/v1/reviews/{asin}
```

Returns top reviews for a product.

### Admin Routes

All admin routes require the `secret` query parameter matching `API_SECRET_KEY`.

```
POST /api/v1/admin/invalidate
Body: { "pattern": "product:*", "secret": "your-secret" }

GET /api/v1/admin/cache-stats?secret=your-secret

GET /api/v1/admin/api-usage?secret=your-secret
```

## Caching Strategy

The system uses a sophisticated caching strategy to minimize API calls:

| Data Type       | TTL      | Redis Key              |
|-----------------|----------|------------------------|
| Product Data    | 6 hours  | `product:{asin}:full`  |
| Price           | 1 hour   | `product:{asin}:price` |
| Search Results  | 30 min   | `search:{hash}`        |
| Deals           | 15 min   | `deals:{hash}`         |
| Reviews         | 24 hours | `reviews:{asin}`       |

### Stale-While-Revalidate

When cache expires but data exists in database, the system:
1. Returns stale data immediately
2. Triggers background refresh
3. Updates cache for next request

## Background Jobs

The system runs these background jobs using Bull queue:

1. **Price Snapshot** (hourly) - Fetches prices for tracked products
2. **Popular Refresh** (6 hours) - Refreshes top 50 products
3. **Cache Warmer** (12 hours) - Pre-loads popular data
4. **Usage Monitor** (24 hours) - Tracks API usage and alerts

## Deploying on CranL.com

1. Create a new project on CranL
2. Connect your GitHub repository
3. Add environment variables
4. Deploy!

CranL will automatically provision PostgreSQL and Redis.

## Getting omkar.cloud API Key

1. Visit [omkar.cloud](https://omkar.cloud)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Free tier includes 5,000 requests/month

## API Quota Management

With 5,000 free requests and aggressive caching:
- Each unique product uses 1 API call (then cached for 6 hours)
- Search uses 1 API call per unique query (cached for 30 min)
- Reviews use 1 API call per product (cached for 24 hours)

**Tips to stay within quota:**
- Leverage caching
- Pre-warm cache for popular products
- Use database fallback for stale data
- Monitor usage via `/api/v1/admin/api-usage`

## License

MIT# Trigger deployment
