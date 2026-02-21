INSERT OR IGNORE INTO products (asin, category_id, title, image_url, current_price, original_price, discount_pct, currency, rating, ratings_total, amazon_url, last_updated) VALUES ('B0DTEST001', 2, 'NVIDIA GeForce RTX 4070 Ti SUPER 16GB GDDR6X', 'https://m.media-amazon.com/images/I/81Cz4Kz3XML.jpg', 2199.00, 2899.00, 24, 'SAR', 4.7, 342, 'https://amazon.sa/dp/B0DTEST001', datetime('now'));

INSERT OR IGNORE INTO products (asin, category_id, title, image_url, current_price, original_price, discount_pct, currency, rating, ratings_total, amazon_url, last_updated) VALUES ('B0DTEST002', 2, 'AMD Radeon RX 7800 XT 16GB Gaming OC Graphics Card', 'https://m.media-amazon.com/images/I/81vJEpGw9BL.jpg', 1849.00, 2199.00, 16, 'SAR', 4.5, 218, 'https://amazon.sa/dp/B0DTEST002', datetime('now'));

INSERT OR IGNORE INTO products (asin, category_id, title, image_url, current_price, original_price, discount_pct, currency, rating, ratings_total, amazon_url, last_updated) VALUES ('B0DTEST003', 1, 'AMD Ryzen 7 7800X3D Gaming Processor', 'https://m.media-amazon.com/images/I/61CnbRNUXuL.jpg', 1599.00, 1899.00, 16, 'SAR', 4.8, 1523, 'https://amazon.sa/dp/B0DTEST003', datetime('now'));

INSERT OR IGNORE INTO products (asin, category_id, title, image_url, current_price, original_price, discount_pct, currency, rating, ratings_total, amazon_url, last_updated) VALUES ('B0DTEST004', 8, 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse', 'https://m.media-amazon.com/images/I/61MKOOz8elL.jpg', 499.00, 649.00, 23, 'SAR', 4.6, 876, 'https://amazon.sa/dp/B0DTEST004', datetime('now'));

INSERT OR IGNORE INTO products (asin, category_id, title, image_url, current_price, original_price, discount_pct, currency, rating, ratings_total, amazon_url, last_updated) VALUES ('B0DTEST005', 11, 'Samsung Odyssey G7 32 Inch 240Hz QHD Gaming Monitor', 'https://m.media-amazon.com/images/I/71WjGnqGJaL.jpg', 1799.00, 2499.00, 28, 'SAR', 4.4, 654, 'https://amazon.sa/dp/B0DTEST005', datetime('now'));

INSERT OR IGNORE INTO products (asin, category_id, title, image_url, current_price, original_price, discount_pct, currency, rating, ratings_total, amazon_url, last_updated) VALUES ('B0DTEST006', 9, 'Razer Huntsman V3 Pro TKL Mechanical Keyboard', 'https://m.media-amazon.com/images/I/71gJEpGw9BL.jpg', 899.00, 1099.00, 18, 'SAR', 4.5, 432, 'https://amazon.sa/dp/B0DTEST006', datetime('now'));

INSERT OR IGNORE INTO products (asin, category_id, title, image_url, current_price, original_price, discount_pct, currency, rating, ratings_total, amazon_url, last_updated) VALUES ('B0DTEST007', 10, 'HyperX Cloud III Wireless Gaming Headset', 'https://m.media-amazon.com/images/I/61MKOhz8elL.jpg', 449.00, 599.00, 25, 'SAR', 4.3, 987, 'https://amazon.sa/dp/B0DTEST007', datetime('now'));

INSERT OR IGNORE INTO products (asin, category_id, title, image_url, current_price, original_price, discount_pct, currency, rating, ratings_total, amazon_url, last_updated) VALUES ('B0DTEST008', 3, 'Corsair Vengeance DDR5 32GB 6000MHz CL30 RGB', 'https://m.media-amazon.com/images/I/71cz4Kz3XML.jpg', 389.00, 549.00, 29, 'SAR', 4.7, 1102, 'https://amazon.sa/dp/B0DTEST008', datetime('now'));

INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (1, 2899.00, '2025-12-01');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (1, 2899.00, '2025-12-15');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (1, 2799.00, '2026-01-01');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (1, 2599.00, '2026-01-15');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (1, 2399.00, '2026-02-01');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (1, 2199.00, '2026-02-15');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (1, 2199.00, '2026-02-20');

INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (5, 2499.00, '2025-12-01');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (5, 2499.00, '2025-12-15');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (5, 2499.00, '2026-01-01');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (5, 1799.00, '2026-01-15');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (5, 1799.00, '2026-02-01');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (5, 1799.00, '2026-02-15');

INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (8, 539.00, '2025-12-01');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (8, 549.00, '2025-12-15');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (8, 545.00, '2026-01-01');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (8, 389.00, '2026-01-15');
INSERT OR IGNORE INTO price_history (product_id, price, recorded_at) VALUES (8, 389.00, '2026-02-01');
