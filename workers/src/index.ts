interface Env {
  CACHE: KVNamespace;
  RAPIDAPI_KEY: string;
  DB: D1Database;
}

const CATEGORIES = {
  gpu: { name_en: 'Gaming Graphics Cards RTX', name_ar: 'كرت الشاشة للألعاب' },
  cpu: { name_en: 'Gaming Processors', name_ar: 'معالجات الألعاب' },
  monitor: { name_en: 'Gaming Monitors', name_ar: 'شاشات الألعاب' },
  keyboard: { name_en: 'Gaming Keyboards Mechanical', name_ar: 'لوحات مفاتيح الألعاب' },
  mouse: { name_en: 'Gaming Mouse', name_ar: 'فأرة الألعاب' },
  headset: { name_en: 'Gaming Headsets', name_ar: 'سماعات رأس الألعاب' },
};

async function searchAmazonSA(query: string, apiKey: string): Promise<any> {
  const response = await fetch(
    `https://scout-amazon-data.p.rapidapi.com/Amazon-Search-Data?query=${encodeURIComponent(query)}&region=SA`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'scout-amazon-data.p.rapidapi.com',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Amazon API error: ${response.status}`);
  }

  return response.json();
}

async function getProductDetails(asin: string, apiKey: string): Promise<any> {
  // Search by ASIN to get product details
  const response = await fetch(
    `https://scout-amazon-data.p.rapidapi.com/Amazon-Search-Data?query=${asin}&region=SA`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'scout-amazon-data.p.rapidapi.com',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Amazon API error: ${response.status}`);
  }

  const result = await response.json();

  // Find the product with matching ASIN
  if (result.products && result.products.length > 0) {
    const product = result.products.find((p: any) => p.asin === asin);
    return product || result.products[0];
  }

  return null;
}

function isGamingProduct(title: string): boolean {
  const titleLower = title.toLowerCase();

  // Gaming keywords that should be present
  const gamingKeywords = ['gaming', 'rtx', 'gtx', 'radeon', 'geforce', 'rx ', 'nvidia', 'amd', 'intel', 'mechanical', 'rgb', 'dpi', 'hz', 'fps', 'pc', 'computer', 'esports'];

  // Non-gaming keywords that should exclude the product
  const excludeKeywords = ['food', 'kitchen', 'cooking', 'coffee', 'tea', 'blender', 'mixer', 'oven', 'refrigerator', 'dishwasher', 'washing', 'vacuum', 'iron', 'fan', 'heater', 'air conditioner', 'furniture', 'bed', 'mattress', 'pillow', 'blanket', 'towel', 'soap', 'shampoo', 'perfume', 'makeup', 'clothing', 'shoes', 'watch', 'jewelry', 'toy', 'baby', 'pet', 'garden', 'tool', 'drill', 'hammer'];

  // Check if product contains any excluded keywords
  for (const keyword of excludeKeywords) {
    if (titleLower.includes(keyword)) {
      return false;
    }
  }

  // Check if product contains at least one gaming keyword
  for (const keyword of gamingKeywords) {
    if (titleLower.includes(keyword)) {
      return true;
    }
  }

  return false;
}

async function savePriceHistory(env: Env, asin: string, price: number, originalPrice: number, title: string) {
  try {
    // Save or update product
    await env.DB.prepare(
      'INSERT OR REPLACE INTO products (asin, title, last_updated, first_seen) VALUES (?, ?, ?, COALESCE((SELECT first_seen FROM products WHERE asin = ?), ?))'
    ).bind(asin, title, Date.now(), asin, Date.now()).run();

    // Save price history
    await env.DB.prepare(
      'INSERT INTO price_history (asin, price, original_price, discount_percentage, timestamp) VALUES (?, ?, ?, ?, ?)'
    ).bind(
      asin,
      price,
      originalPrice || price,
      originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
      Date.now()
    ).run();
  } catch (error) {
    console.error('Error saving price history:', error);
  }
}

function mapAmazonProduct(item: any) {
  const price = item.product_price ? parseFloat(item.product_price.replace(/[^0-9.]/g, '')) : null;
  const originalPrice = item.product_original_price ? parseFloat(item.product_original_price.replace(/[^0-9.]/g, '')) : null;

  return {
    asin: item.asin || '',
    title: item.product_title || '',
    main_image: item.product_image || '',
    price: price,
    original_price: originalPrice || price,
    discount_percentage: originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    rating: item.product_star_rating ? parseFloat(item.product_star_rating) : null,
    ratings_count: item.product_num_ratings || 0,
    is_prime: item.is_prime || false,
    is_best_seller: false,
    is_amazon_choice: false,
    currency: 'SAR',
    amazon_url: `https://www.amazon.sa/dp/${item.asin}`,
    source: 'amazon_sa',
  };
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (path === '/api/v1/health') {
      return new Response(JSON.stringify({
        success: true,
        status: 'healthy',
        apis: ['amazon_sa'],
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/api/v1/categories') {
      const categories = Object.entries(CATEGORIES).map(([slug, data], index) => ({
        id: String(index + 1),
        slug,
        name_en: data.name_en,
        name_ar: data.name_ar,
      }));

      return new Response(JSON.stringify({
        success: true,
        data: categories,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (path === '/api/v1/deals') {
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const cacheKey = `deals:gpu:${limit}`;

      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const result = await searchAmazonSA('Gaming Graphics Cards RTX', env.RAPIDAPI_KEY);
      const products = (result.products || [])
        .map(mapAmazonProduct)
        .filter((p: any) => p.price && p.price > 0 && isGamingProduct(p.title))
        .sort((a: any, b: any) => b.discount_percentage - a.discount_percentage)
        .slice(0, limit);

      const response = {
        success: true,
        data: {
          total_count: products.length,
          page: 1,
          total_pages: 1,
          filters_applied: {},
          deals: products.map(p => ({ ...p, category_slug: 'gpu', category_name: 'Graphics Cards' })),
        },
        cached: false,
        source: 'amazon_sa',
      };

      const responseStr = JSON.stringify(response);
      await env.CACHE.put(cacheKey, responseStr, { expirationTtl: 900 });

      return new Response(responseStr, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const categoryMatch = path.match(/^\/api\/v1\/category\/([^\/]+)$/);
    if (categoryMatch) {
      const slug = categoryMatch[1];
      const category = CATEGORIES[slug as keyof typeof CATEGORIES];

      if (!category) {
        return new Response(JSON.stringify({
          success: false,
          error: 'CATEGORY_NOT_FOUND',
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const limit = parseInt(url.searchParams.get('limit') || '50');
      const cacheKey = `category:${slug}:${limit}`;

      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const result = await searchAmazonSA(category.name_en, env.RAPIDAPI_KEY);
      const products = (result.products || [])
        .map(mapAmazonProduct)
        .filter((p: any) => p.price && p.price > 0 && isGamingProduct(p.title))
        .slice(0, limit);

      const response = {
        success: true,
        data: {
          category_slug: slug,
          category_name_en: category.name_en,
          category_name_ar: category.name_ar,
          total_count: products.length,
          page: 1,
          total_pages: 1,
          products,
        },
        cached: false,
        source: 'amazon_sa',
      };

      const responseStr = JSON.stringify(response);
      await env.CACHE.put(cacheKey, responseStr, { expirationTtl: 1800 });

      return new Response(responseStr, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const productMatch = path.match(/^\/api\/v1\/product\/([^\/]+)$/);
    if (productMatch) {
      const asin = productMatch[1];
      const cacheKey = `product:${asin}`;

      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const productData = await getProductDetails(asin, env.RAPIDAPI_KEY);

      if (!productData || !productData.product_title) {
        return new Response(JSON.stringify({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const price = productData.product_price ? parseFloat(productData.product_price.replace(/[^0-9.]/g, '')) : null;
      const originalPrice = productData.product_original_price ? parseFloat(productData.product_original_price.replace(/[^0-9.]/g, '')) : null;

      // Save price history
      if (price) {
        await savePriceHistory(env, asin, price, originalPrice || price, productData.product_title);
      }

      const product = {
        asin: productData.asin || asin,
        title: productData.product_title || '',
        description: productData.product_description || '',
        main_image: productData.product_image || productData.product_photo || '',
        image_url: productData.product_image || productData.product_photo || '',
        images: productData.product_photos || [productData.product_image],
        current_price: price || 0,
        price: price,
        original_price: originalPrice || price,
        discount_pct: originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
        discount_percentage: originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
        rating: productData.product_star_rating ? parseFloat(productData.product_star_rating) : 0,
        ratings_total: productData.product_num_ratings || 0,
        ratings_count: productData.product_num_ratings || 0,
        reviews_count: productData.product_num_reviews || 0,
        is_prime: productData.is_prime || false,
        is_best_seller: productData.is_best_seller || false,
        is_amazon_choice: productData.is_amazon_choice || false,
        currency: 'SAR',
        amazon_url: `https://www.amazon.sa/dp/${asin}`,
        availability: productData.delivery_info || 'In Stock',
        brand: '',
        category_name: '',
        key_features: [],
        specifications: productData.product_details || {},
        features: productData.product_features || [],
        top_reviews: [],
        frequently_bought_together: [],
        source: 'amazon_sa',
      };

      const response = {
        success: true,
        data: product,
        cached: false,
      };

      const responseStr = JSON.stringify(response);
      await env.CACHE.put(cacheKey, responseStr, { expirationTtl: 3600 });

      return new Response(responseStr, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const priceHistoryMatch = path.match(/^\/api\/v1\/price-history\/([^\/]+)$/);
    if (priceHistoryMatch) {
      const asin = priceHistoryMatch[1];
      const cacheKey = `price-history:${asin}`;

      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const history = await env.DB.prepare(
        'SELECT price, original_price, discount_percentage, timestamp FROM price_history WHERE asin = ? ORDER BY timestamp DESC LIMIT 30'
      ).bind(asin).all();

      const response = {
        success: true,
        data: {
          asin,
          history: history.results || [],
        },
      };

      const responseStr = JSON.stringify(response);
      await env.CACHE.put(cacheKey, responseStr, { expirationTtl: 3600 });

      return new Response(responseStr, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'NOT_FOUND',
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Daily price update job - runs at 2 AM
    console.log('Running daily price update job');

    try {
      // Get all tracked products
      const products = await env.DB.prepare(
        'SELECT DISTINCT asin, title FROM products ORDER BY last_updated ASC LIMIT 100'
      ).all();

      if (!products.results || products.results.length === 0) {
        console.log('No products to update');
        return;
      }

      // Update prices for each product
      for (const product of products.results) {
        try {
          const productData = await getProductDetails(product.asin as string, env.RAPIDAPI_KEY);

          if (productData && productData.product_price) {
            const price = parseFloat(productData.product_price.replace(/[^0-9.]/g, ''));
            const originalPrice = productData.product_original_price
              ? parseFloat(productData.product_original_price.replace(/[^0-9.]/g, ''))
              : price;

            await savePriceHistory(env, product.asin as string, price, originalPrice, productData.product_title);
            console.log(`Updated price for ${product.asin}: ${price} SAR`);
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error updating ${product.asin}:`, error);
        }
      }

      console.log(`Daily price update completed: ${products.results.length} products updated`);
    } catch (error) {
      console.error('Error in daily price update job:', error);
    }
  },
};
