interface Env {
  CACHE: KVNamespace;
  RAPIDAPI_KEY: string;
}

const CATEGORIES = {
  gpu: { name_en: 'Graphics Cards', name_ar: 'كرت الشاشة' },
  cpu: { name_en: 'Processors', name_ar: 'المعالجات' },
  monitor: { name_en: 'Monitors', name_ar: 'الشاشات' },
  keyboard: { name_en: 'Keyboards', name_ar: 'لوحات المفاتيح' },
  mouse: { name_en: 'Mouse', name_ar: 'الفأرة' },
  headset: { name_en: 'Headsets', name_ar: 'سماعات الرأس' },
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

async function searchNeweggSA(query: string, apiKey: string): Promise<any> {
  const response = await fetch(
    `https://newegg-api.p.rapidapi.com/products/search?keyword=${encodeURIComponent(query)}&country=SA&language=en`,
    {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'newegg-api.p.rapidapi.com',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Newegg API error: ${response.status}`);
  }

  return response.json();
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

function mapNeweggProduct(item: any) {
  const price = item.FinalPrice ? parseFloat(item.FinalPrice) : null;
  const originalPrice = item.OriginalPrice ? parseFloat(item.OriginalPrice) : price;

  return {
    asin: item.ItemNumber || '',
    title: item.Title || '',
    main_image: item.ImageUrl || '',
    price: price,
    original_price: originalPrice,
    discount_percentage: originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    rating: item.ReviewSummary?.Rating || null,
    ratings_count: item.ReviewSummary?.TotalReviews || 0,
    is_prime: false,
    is_best_seller: false,
    is_amazon_choice: false,
    currency: 'SAR',
    amazon_url: item.ProductUrl || '',
    source: 'newegg_sa',
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
        apis: ['amazon_sa', 'newegg_sa'],
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

      const [amazonResult, neweggResult] = await Promise.all([
        searchAmazonSA('Graphics Cards', env.RAPIDAPI_KEY).catch(() => ({ products: [] })),
        searchNeweggSA('Graphics Cards', env.RAPIDAPI_KEY).catch(() => ({ ProductListItems: [] })),
      ]);

      const amazonProducts = (amazonResult.products || []).map(mapAmazonProduct);
      const neweggProducts = (neweggResult.ProductListItems || []).map(mapNeweggProduct);

      const allProducts = [...amazonProducts, ...neweggProducts]
        .filter((p: any) => p.price && p.price > 0)
        .sort((a: any, b: any) => b.discount_percentage - a.discount_percentage)
        .slice(0, limit);

      const response = {
        success: true,
        data: {
          total_count: allProducts.length,
          page: 1,
          total_pages: 1,
          filters_applied: {},
          deals: allProducts.map(p => ({ ...p, category_slug: 'gpu', category_name: 'Graphics Cards' })),
        },
        cached: false,
        sources: ['amazon_sa', 'newegg_sa'],
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

      const [amazonResult, neweggResult] = await Promise.all([
        searchAmazonSA(category.name_en, env.RAPIDAPI_KEY).catch(() => ({ products: [] })),
        searchNeweggSA(category.name_en, env.RAPIDAPI_KEY).catch(() => ({ ProductListItems: [] })),
      ]);

      const amazonProducts = (amazonResult.products || []).map(mapAmazonProduct);
      const neweggProducts = (neweggResult.ProductListItems || []).map(mapNeweggProduct);

      const allProducts = [...amazonProducts, ...neweggProducts]
        .filter((p: any) => p.price && p.price > 0)
        .slice(0, limit);

      const response = {
        success: true,
        data: {
          category_slug: slug,
          category_name_en: category.name_en,
          category_name_ar: category.name_ar,
          total_count: allProducts.length,
          page: 1,
          total_pages: 1,
          products: allProducts,
        },
        cached: false,
        sources: ['amazon_sa', 'newegg_sa'],
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
