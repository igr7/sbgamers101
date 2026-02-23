interface Env {
  CACHE: KVNamespace;
  DECODO_API_KEY: string;
}

const CATEGORIES = {
  gpu: { name_en: 'Graphics Cards', name_ar: 'كرت الشاشة' },
  cpu: { name_en: 'Processors', name_ar: 'المعالجات' },
  monitor: { name_en: 'Monitors', name_ar: 'الشاشات' },
  keyboard: { name_en: 'Keyboards', name_ar: 'لوحات المفاتيح' },
  mouse: { name_en: 'Mouse', name_ar: 'الفأرة' },
  headset: { name_en: 'Headsets', name_ar: 'سماعات الرأس' },
};

async function callDecodoAPI(query: string, apiKey: string): Promise<any> {
  // Debug: Check if API key exists
  if (!apiKey) {
    throw new Error('DECODO_API_KEY not set');
  }

  const response = await fetch('https://realtime.oxylabs.io/v1/queries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${apiKey}`,
    },
    body: JSON.stringify({
      source: 'amazon_search',
      domain: 'sa',
      query: query,
      parse: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Decodo API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

function mapProduct(item: any) {
  return {
    asin: item.asin || '',
    title: item.title || '',
    main_image: item.url_image || item.image || '',
    price: item.price || null,
    original_price: item.price_strikethrough || null,
    discount_percentage: item.price_strikethrough && item.price
      ? Math.round(((item.price_strikethrough - item.price) / item.price_strikethrough) * 100)
      : null,
    rating: item.rating || null,
    ratings_count: item.ratings_total || null,
    is_prime: item.is_prime || false,
    is_best_seller: item.is_best_seller || false,
    is_amazon_choice: item.is_amazon_choice || false,
    currency: 'SAR',
    amazon_url: item.url || `https://www.amazon.sa/dp/${item.asin}`,
  };
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Health endpoint
    if (path === '/api/v1/health') {
      return new Response(JSON.stringify({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Categories endpoint
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

    // Deals endpoint
    if (path === '/api/v1/deals') {
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const cacheKey = `deals:gpu:${limit}`;

      // Try cache first
      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        return new Response(cached, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Fetch from Decodo
      const result = await callDecodoAPI('Graphics Cards', env.DECODO_API_KEY);
      const products = (result.results?.[0]?.content?.results?.results?.organic || [])
        .map(mapProduct)
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
        source: 'decodo_api',
      };

      const responseStr = JSON.stringify(response);
      await env.CACHE.put(cacheKey, responseStr, { expirationTtl: 900 });

      return new Response(responseStr, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Category endpoint
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

      const result = await callDecodoAPI(category.name_en, env.DECODO_API_KEY);
      const products = (result.results?.[0]?.content?.results?.results?.organic || [])
        .map(mapProduct)
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
        source: 'decodo_api',
      };

      const responseStr = JSON.stringify(response);
      await env.CACHE.put(cacheKey, responseStr, { expirationTtl: 1800 });

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
};
