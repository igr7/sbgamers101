import { Env, RainforestProduct } from './types';
import { searchProducts, getProduct } from './rainforest';
import { CATEGORY_SEARCHES } from './categories';

// Upsert a product from Rainforest API search results
async function upsertProduct(
  db: D1Database,
  product: RainforestProduct,
  categoryId: number
): Promise<void> {
  const currentPrice = product.price?.value ?? null;
  const originalPrice = product.rrp?.value ?? currentPrice;
  const discountPct =
    currentPrice && originalPrice && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  await db
    .prepare(
      `INSERT INTO products (asin, category_id, title, image_url, current_price, original_price, discount_pct, currency, rating, ratings_total, amazon_url, last_updated)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'SAR', ?8, ?9, ?10, datetime('now'))
       ON CONFLICT(asin) DO UPDATE SET
         current_price = ?5,
         original_price = ?6,
         discount_pct = ?7,
         rating = ?8,
         ratings_total = ?9,
         image_url = COALESCE(?4, image_url),
         last_updated = datetime('now')`
    )
    .bind(
      product.asin,
      categoryId,
      product.title,
      product.image ?? null,
      currentPrice,
      originalPrice,
      discountPct,
      product.rating ?? null,
      product.ratings_total ?? 0,
      product.link ?? `https://amazon.sa/dp/${product.asin}`
    )
    .run();
}

// Record today's price in price_history (one entry per product per day)
async function recordPriceHistory(
  db: D1Database,
  asin: string,
  price: number
): Promise<void> {
  // Get product id
  const row = await db
    .prepare('SELECT id FROM products WHERE asin = ?')
    .bind(asin)
    .first<{ id: number }>();

  if (!row) return;

  // Insert only if no entry for today
  await db
    .prepare(
      `INSERT OR IGNORE INTO price_history (product_id, price, recorded_at)
       SELECT ?1, ?2, date('now')
       WHERE NOT EXISTS (
         SELECT 1 FROM price_history WHERE product_id = ?1 AND recorded_at = date('now')
       )`
    )
    .bind(row.id, price)
    .run();
}

// Full sync: search all categories and update products
export async function syncAllProducts(env: Env): Promise<{ total: number; errors: string[] }> {
  let total = 0;
  const errors: string[] = [];

  for (const cat of CATEGORY_SEARCHES) {
    for (const term of cat.searchTerms) {
      try {
        // Fetch 2 pages per search term (~20 products per page)
        for (let page = 1; page <= 2; page++) {
          const result = await searchProducts(env, term, page);
          const products = result.search_results ?? [];

          for (const product of products) {
            if (!product.asin) continue;
            try {
              await upsertProduct(env.DB, product, cat.categoryId);
              if (product.price?.value) {
                await recordPriceHistory(env.DB, product.asin, product.price.value);
              }
              total++;
            } catch (e) {
              errors.push(`Product ${product.asin}: ${(e as Error).message}`);
            }
          }

          // Small delay between pages to respect rate limits
          await new Promise((r) => setTimeout(r, 500));
        }
      } catch (e) {
        errors.push(`Search "${term}": ${(e as Error).message}`);
      }
    }
  }

  return { total, errors };
}

// Update prices only for existing products (cheaper than full sync)
export async function updateExistingPrices(env: Env): Promise<{ updated: number; errors: string[] }> {
  let updated = 0;
  const errors: string[] = [];

  // Get all product ASINs
  const { results } = await env.DB.prepare(
    'SELECT id, asin FROM products ORDER BY last_updated ASC LIMIT 200'
  ).all<{ id: number; asin: string }>();

  for (const row of results ?? []) {
    try {
      const data = await getProduct(env, row.asin);
      const p = data.product;
      const price = p.buybox_winner?.price?.value ?? null;
      const rrp = p.buybox_winner?.rrp?.value ?? price;
      const discountPct =
        price && rrp && rrp > price
          ? Math.round(((rrp - price) / rrp) * 100)
          : 0;

      await env.DB.prepare(
        `UPDATE products SET
           current_price = ?1, original_price = ?2, discount_pct = ?3,
           rating = ?4, ratings_total = ?5, last_updated = datetime('now')
         WHERE id = ?6`
      )
        .bind(price, rrp, discountPct, p.rating ?? null, p.ratings_total ?? 0, row.id)
        .run();

      if (price) {
        await recordPriceHistory(env.DB, row.asin, price);
      }
      updated++;

      // Rate limiting
      await new Promise((r) => setTimeout(r, 300));
    } catch (e) {
      errors.push(`${row.asin}: ${(e as Error).message}`);
    }
  }

  return { updated, errors };
}
