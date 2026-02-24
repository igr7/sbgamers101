interface Env {
  CACHE: KVNamespace;
  RAPIDAPI_KEY: string;
  DB: D1Database;
}

const CATEGORIES = {
  gpu: { name: 'Graphics Cards', search_query: 'Gaming Graphics Cards RTX 4090 4080 4070' },
  cpu: { name: 'Processors', search_query: 'Gaming Processors Intel AMD Ryzen' },
  monitor: { name: 'Gaming Monitors', search_query: 'Gaming Monitors 144Hz 240Hz' },
  keyboard: { name: 'Gaming Keyboards', search_query: 'Mechanical Gaming Keyboards RGB' },
  mouse: { name: 'Gaming Mouse', search_query: 'Gaming Mouse High DPI' },
  headset: { name: 'Gaming Headsets', search_query: 'Gaming Headsets Wireless' },
  ram: { name: 'Memory (RAM)', search_query: 'Gaming RAM DDR5 DDR4' },
  ssd: { name: 'Storage (SSD)', search_query: 'NVMe SSD M.2 Gaming' },
  motherboard: { name: 'Motherboards', search_query: 'Gaming Motherboard ATX' },
  psu: { name: 'Power Supply', search_query: 'Gaming PSU Modular 80 Plus' },
  case: { name: 'PC Cases', search_query: 'Gaming PC Case RGB' },
  cooling: { name: 'Cooling', search_query: 'CPU Cooler AIO Liquid Cooling' },
};

async function searchAmazonSA(query: string, apiKey: string): Promise<any> {
  // Request English content from Amazon.sa with Saudi pricing
  const response = await fetch(
    `https://scout-amazon-data.p.rapidapi.com/Amazon-Search-Data?query=${encodeURIComponent(query)}&region=SA&language=en`,
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
  // Search by ASIN to get product details in English
  const response = await fetch(
    `https://scout-amazon-data.p.rapidapi.com/Amazon-Search-Data?query=${asin}&region=SA&language=en`,
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

// Strict category validation to prevent cross-contamination
const CATEGORY_VALIDATORS = {
  gpu: {
    required: ['rtx', 'gtx', 'radeon', 'geforce', 'graphics card', 'gpu', 'rx 6', 'rx 7', 'arc', 'video card'],
    excluded: ['laptop', 'notebook', 'pc', 'desktop', 'computer', 'bundle', 'system', 'prebuilt', 'cpu', 'processor', 'motherboard', 'case', 'psu', 'power supply'],
    mustNotContain: ['intel core', 'ryzen', 'i5', 'i7', 'i9', 'threadripper']
  },
  cpu: {
    required: ['processor', 'cpu', 'intel core', 'ryzen', 'threadripper', 'i3', 'i5', 'i7', 'i9'],
    excluded: ['laptop', 'notebook', 'pc', 'desktop', 'computer', 'bundle', 'system', 'prebuilt', 'graphics', 'gpu', 'rtx', 'gtx', 'motherboard'],
    mustNotContain: ['geforce', 'radeon', 'graphics card']
  },
  monitor: {
    required: ['monitor', 'display', 'screen', 'hz', 'ips', 'va panel', 'oled'],
    excluded: ['laptop', 'tablet', 'phone', 'tv', 'television', 'projector', 'mount', 'arm', 'stand only'],
    mustNotContain: []
  },
  keyboard: {
    required: ['keyboard', 'mechanical', 'switches', 'keycaps'],
    excluded: ['mouse', 'headset', 'controller', 'case', 'cover', 'skin', 'sticker'],
    mustNotContain: []
  },
  mouse: {
    required: ['mouse', 'mice', 'dpi', 'sensor'],
    excluded: ['keyboard', 'headset', 'controller', 'pad only', 'mat only', 'mousepad'],
    mustNotContain: []
  },
  headset: {
    required: ['headset', 'headphone', 'earphone', 'audio'],
    excluded: ['mouse', 'keyboard', 'controller', 'stand', 'hanger', 'case only'],
    mustNotContain: []
  },
  ram: {
    required: ['ram', 'memory', 'ddr4', 'ddr5', 'dimm', 'sodimm'],
    excluded: ['laptop', 'ssd', 'hdd', 'storage', 'motherboard', 'cpu', 'gpu'],
    mustNotContain: []
  },
  ssd: {
    required: ['ssd', 'nvme', 'm.2', 'solid state', 'storage'],
    excluded: ['hdd', 'hard drive', 'external', 'enclosure', 'adapter', 'ram', 'memory'],
    mustNotContain: []
  },
  motherboard: {
    required: ['motherboard', 'mobo', 'socket', 'chipset', 'atx', 'itx'],
    excluded: ['cpu', 'processor', 'gpu', 'case', 'bundle', 'pc', 'system'],
    mustNotContain: []
  },
  psu: {
    required: ['power supply', 'psu', 'watt', 'modular', '80 plus'],
    excluded: ['cable only', 'adapter', 'ups', 'battery', 'case'],
    mustNotContain: []
  },
  case: {
    required: ['case', 'chassis', 'tower', 'enclosure'],
    excluded: ['psu', 'fan only', 'motherboard', 'bundle', 'pc', 'system', 'prebuilt'],
    mustNotContain: []
  },
  cooling: {
    required: ['cooler', 'cooling', 'fan', 'aio', 'liquid', 'radiator', 'heatsink'],
    excluded: ['case only', 'thermal paste only', 'pad only'],
    mustNotContain: []
  }
};

function validateProductForCategory(title: string, category: string): boolean {
  const titleLower = title.toLowerCase();
  const validator = CATEGORY_VALIDATORS[category as keyof typeof CATEGORY_VALIDATORS];

  if (!validator) return false;

  // Global exclusions (applies to all categories)
  const globalExclusions = ['food', 'kitchen', 'cooking', 'coffee', 'blender', 'oven', 'refrigerator',
    'dishwasher', 'washing', 'vacuum', 'furniture', 'bed', 'mattress', 'clothing', 'shoes',
    'watch', 'jewelry', 'toy', 'baby', 'pet', 'garden'];

  for (const keyword of globalExclusions) {
    if (titleLower.includes(keyword)) return false;
  }

  // Check category-specific exclusions
  for (const keyword of validator.excluded) {
    if (titleLower.includes(keyword)) return false;
  }

  // Check must-not-contain (stricter than excluded)
  for (const keyword of validator.mustNotContain) {
    if (titleLower.includes(keyword)) return false;
  }

  // Must have at least one required keyword
  const hasRequired = validator.required.some(keyword => titleLower.includes(keyword));

  return hasRequired;
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
        name: data.name,
        search_query: data.search_query,
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
      const cacheKey = `deals:all:${limit}`;

      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch deals from top 3 categories (GPU, CPU, Monitor)
      const topCategories = ['gpu', 'cpu', 'monitor'];
      const allProducts: any[] = [];

      for (const slug of topCategories) {
        const category = CATEGORIES[slug as keyof typeof CATEGORIES];
        try {
          const result = await searchAmazonSA(category.search_query, env.RAPIDAPI_KEY);
          const products = (result.products || [])
            .map(mapAmazonProduct)
            .filter((p: any) => p.price && p.price > 0 && validateProductForCategory(p.title, slug))
            .map((p: any) => ({ ...p, category_slug: slug, category_name: category.name }));

          allProducts.push(...products);
        } catch (error) {
          console.error(`Error fetching ${slug}:`, error);
        }
      }

      // Sort by discount and take top deals
      const deals = allProducts
        .sort((a: any, b: any) => b.discount_percentage - a.discount_percentage)
        .slice(0, limit);

      const response = {
        success: true,
        data: {
          total_count: deals.length,
          page: 1,
          total_pages: 1,
          filters_applied: {},
          deals,
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

      const result = await searchAmazonSA(category.search_query, env.RAPIDAPI_KEY);
      const products = (result.products || [])
        .map(mapAmazonProduct)
        .filter((p: any) => p.price && p.price > 0 && validateProductForCategory(p.title, slug))
        .slice(0, limit);

      const response = {
        success: true,
        data: {
          category_slug: slug,
          category_name: category.name,
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
        images: productData.product_photos || [productData.product_image],
        price: price,
        original_price: originalPrice || price,
        discount_percentage: originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
        rating: productData.product_star_rating ? parseFloat(productData.product_star_rating) : 0,
        ratings_count: productData.product_num_ratings || 0,
        is_prime: productData.is_prime || false,
        is_best_seller: productData.is_best_seller || false,
        is_amazon_choice: productData.is_amazon_choice || false,
        currency: 'SAR',
        amazon_url: `https://www.amazon.sa/dp/${asin}`,
        availability: productData.delivery_info || 'In Stock',
        brand: '',
        category: null,
        category_hierarchy: null,
        key_features: [],
        top_reviews: [],
        frequently_bought_together: [],
        variants: [],
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
