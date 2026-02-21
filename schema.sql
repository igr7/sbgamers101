-- SB Gamers D1 Database Schema

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asin TEXT UNIQUE NOT NULL,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  title_ar TEXT,
  image_url TEXT,
  current_price REAL,
  original_price REAL,
  discount_pct REAL DEFAULT 0,
  currency TEXT DEFAULT 'SAR',
  rating REAL,
  ratings_total INTEGER DEFAULT 0,
  amazon_url TEXT,
  in_stock INTEGER DEFAULT 1,
  last_updated TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  price REAL NOT NULL,
  recorded_at TEXT DEFAULT (date('now')),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_asin ON products(asin);
CREATE INDEX IF NOT EXISTS idx_products_discount ON products(discount_pct DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id, recorded_at);

-- Seed categories
INSERT OR IGNORE INTO categories (slug, name_en, name_ar, icon, sort_order) VALUES
  ('cpu', 'Processors (CPU)', 'معالجات', 'Cpu', 1),
  ('gpu', 'Graphics Cards (GPU)', 'كروت شاشة', 'Monitor', 2),
  ('ram', 'Memory (RAM)', 'ذاكرة عشوائية', 'MemoryStick', 3),
  ('motherboard', 'Motherboards', 'لوحات أم', 'CircuitBoard', 4),
  ('psu', 'Power Supplies', 'مزودات طاقة', 'Zap', 5),
  ('case', 'PC Cases', 'صناديق حاسب', 'Box', 6),
  ('cooling', 'Cooling', 'تبريد', 'Fan', 7),
  ('mouse', 'Gaming Mouse', 'ماوس', 'Mouse', 8),
  ('keyboard', 'Gaming Keyboard', 'كيبورد', 'Keyboard', 9),
  ('headset', 'Gaming Headset', 'سماعات', 'Headphones', 10),
  ('monitor', 'Monitors', 'شاشات', 'MonitorPlay', 11),
  ('chair', 'Gaming Chairs', 'كراسي', 'Armchair', 12);
