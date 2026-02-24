-- Price History Tracking Schema for Cloudflare D1
-- This enables historical price tracking for Amazon products

-- Main price history table
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asin TEXT NOT NULL,
  price REAL NOT NULL,
  original_price REAL,
  discount_percentage INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'SAR',
  is_prime BOOLEAN DEFAULT 0,
  timestamp INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast ASIN lookups
CREATE INDEX IF NOT EXISTS idx_asin_timestamp ON price_history(asin, timestamp DESC);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_timestamp ON price_history(timestamp DESC);

-- Product metadata table (stores product info)
CREATE TABLE IF NOT EXISTS products (
  asin TEXT PRIMARY KEY,
  title TEXT,
  main_image TEXT,
  category_slug TEXT,
  category_name TEXT,
  amazon_url TEXT,
  first_seen INTEGER NOT NULL,
  last_updated INTEGER NOT NULL
);

-- Index for category lookups
CREATE INDEX IF NOT EXISTS idx_category ON products(category_slug);

-- Price alerts table (future feature)
CREATE TABLE IF NOT EXISTS price_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asin TEXT NOT NULL,
  target_price REAL NOT NULL,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT 1
);

-- Index for active alerts
CREATE INDEX IF NOT EXISTS idx_active_alerts ON price_alerts(asin, is_active);
