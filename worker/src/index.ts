import { AutoRouter, cors, json, error } from 'itty-router';
import { Env } from './types';
import { syncAllProducts, updateExistingPrices } from './cron';
import { searchProducts } from './rainforest';

const { preflight, corsify } = cors({
  origin: (origin: string) => origin, // Allow all origins in dev; restrict in production via ALLOWED_ORIGIN
  allowMethods: ['GET'],
});

const router = AutoRouter({
  before: [preflight],
  finally: [corsify],
});

// --- API Routes ---

// Health check
router.get('/api/health', () => json({ status: 'ok', time: new Date().toISOString() }));

// Get all categories
router.get('/api/categories', async (req, env: Env) => {
  const { results } = await env.DB.prepare(
    'SELECT * FROM categories ORDER BY sort_order'
  ).all();
  return json(results);
});

// Get products by category
router.get('/api/categories/:slug/products', async (req, env: Env) => {
  const { slug } = req.params;
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '24'), 50);
  const sort = url.searchParams.get('sort') ?? 'discount';
  const offset = (page - 1) * limit;

  let orderBy = 'discount_pct DESC';
  if (sort === 'price_asc') orderBy = 'current_price ASC';
  else if (sort === 'price_desc') orderBy = 'current_price DESC';
  else if (sort === 'rating') orderBy = 'rating DESC';
  else if (sort === 'newest') orderBy = 'last_updated DESC';

  const { results } = await env.DB.prepare(
    `SELECT p.*, c.slug as category_slug, c.name_en as category_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE c.slug = ?1 AND p.current_price IS NOT NULL
     ORDER BY ${orderBy}
     LIMIT ?2 OFFSET ?3`
  )
    .bind(slug, limit, offset)
    .all();

  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) as total FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE c.slug = ?1 AND p.current_price IS NOT NULL`
  )
    .bind(slug)
    .first<{ total: number }>();

  return json({
    products: results,
    total: countRow?.total ?? 0,
    page,
    totalPages: Math.ceil((countRow?.total ?? 0) / limit),
  });
});

// Search products
router.get('/api/search', async (req, env: Env) => {
  const url = new URL(req.url);
  const q = url.searchParams.get('q')?.trim();
  if (!q) return json({ products: [], total: 0 });

  const page = parseInt(url.searchParams.get('page') ?? '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '24'), 50);
  const offset = (page - 1) * limit;

  const { results } = await env.DB.prepare(
    `SELECT p.*, c.slug as category_slug, c.name_en as category_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.title LIKE ?1 AND p.current_price IS NOT NULL
     ORDER BY p.discount_pct DESC
     LIMIT ?2 OFFSET ?3`
  )
    .bind(`%${q}%`, limit, offset)
    .all();

  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) as total FROM products p
     WHERE p.title LIKE ?1 AND p.current_price IS NOT NULL`
  )
    .bind(`%${q}%`)
    .first<{ total: number }>();

  return json({
    products: results,
    total: countRow?.total ?? 0,
    page,
    totalPages: Math.ceil((countRow?.total ?? 0) / limit),
  });
});

// Get single product by ASIN
router.get('/api/products/:asin', async (req, env: Env) => {
  const { asin } = req.params;
  const product = await env.DB.prepare(
    `SELECT p.*, c.slug as category_slug, c.name_en as category_name, c.name_ar as category_name_ar
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.asin = ?1`
  )
    .bind(asin)
    .first();

  if (!product) return error(404, 'Product not found');
  return json(product);
});

// Get price history for a product
router.get('/api/products/:asin/history', async (req, env: Env) => {
  const { asin } = req.params;

  const product = await env.DB.prepare('SELECT id FROM products WHERE asin = ?1')
    .bind(asin)
    .first<{ id: number }>();

  if (!product) return error(404, 'Product not found');

  const { results } = await env.DB.prepare(
    `SELECT price, recorded_at FROM price_history
     WHERE product_id = ?1
     ORDER BY recorded_at ASC`
  )
    .bind(product.id)
    .all();

  return json(results);
});

// Get deals — shows discounted products first, then top-rated products with best prices
router.get('/api/deals', async (req, env: Env) => {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') ?? '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '24'), 50);
  const offset = (page - 1) * limit;
  const minDiscount = parseInt(url.searchParams.get('min_discount') ?? '0');

  const { results } = await env.DB.prepare(
    `SELECT p.*, c.slug as category_slug, c.name_en as category_name
     FROM products p
     JOIN categories c ON c.id = p.category_id
     WHERE p.current_price IS NOT NULL AND p.discount_pct >= ?1
     ORDER BY p.discount_pct DESC, p.rating DESC, p.ratings_total DESC
     LIMIT ?2 OFFSET ?3`
  )
    .bind(minDiscount, limit, offset)
    .all();

  const countRow = await env.DB.prepare(
    `SELECT COUNT(*) as total FROM products p
     WHERE p.current_price IS NOT NULL AND p.discount_pct >= ?1`
  )
    .bind(minDiscount)
    .first<{ total: number }>();

  return json({
    products: results,
    total: countRow?.total ?? 0,
    page,
    totalPages: Math.ceil((countRow?.total ?? 0) / limit),
  });
});

// Manual trigger: full sync (protected - use with wrangler or secret header)
router.get('/api/admin/sync', async (req, env: Env) => {
  const url = new URL(req.url);
  const key = url.searchParams.get('key');
  if (key !== env.RAINFOREST_API_KEY) return error(403, 'Forbidden');

  const result = await syncAllProducts(env);
  return json(result);
});

// Manual trigger: update existing prices
router.get('/api/admin/update-prices', async (req, env: Env) => {
  const url = new URL(req.url);
  const key = url.searchParams.get('key');
  if (key !== env.RAINFOREST_API_KEY) return error(403, 'Forbidden');

  const result = await updateExistingPrices(env);
  return json(result);
});

// 404 fallback
router.all('*', () => error(404, 'Not found'));

export default {
  fetch: router.fetch,

  // Cron handler — runs daily to update prices
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      updateExistingPrices(env).then((result) => {
        console.log(`Cron complete: ${result.updated} updated, ${result.errors.length} errors`);
      })
    );
  },
} satisfies ExportedHandler<Env>;
