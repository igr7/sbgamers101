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

// Mock product data for testing
const MOCK_PRODUCTS = [
  {
    asin: 'B0BQWK9PC3',
    title: 'NVIDIA GeForce RTX 4090 24GB GDDR6X Graphics Card',
    main_image: 'https://m.media-amazon.com/images/I/81SvQG+HPUL._AC_SL1500_.jpg',
    price: 7999,
    original_price: 8999,
    discount_percentage: 11,
    rating: 4.8,
    ratings_count: 1247,
    is_prime: true,
    is_best_seller: true,
    is_amazon_choice: false,
    currency: 'SAR',
    amazon_url: 'https://www.amazon.sa/dp/B0BQWK9PC3',
  },
  {
    asin: 'B0BQWK8PC2',
    title: 'AMD Radeon RX 7900 XTX 24GB GDDR6 Gaming Graphics Card',
    main_image: 'https://m.media-amazon.com/images/I/71kZGFKql9L._AC_SL1500_.jpg',
    price: 4499,
    original_price: 4999,
    discount_percentage: 10,
    rating: 4.6,
    ratings_count: 892,
    is_prime: true,
    is_best_seller: false,
    is_amazon_choice: true,
    currency: 'SAR',
    amazon_url: 'https://www.amazon.sa/dp/B0BQWK8PC2',
  },
  {
    asin: 'B0BQWK7PC1',
    title: 'NVIDIA GeForce RTX 4080 16GB GDDR6X Graphics Card',
    main_image: 'https://m.media-amazon.com/images/I/81kZGFKql9L._AC_SL1500_.jpg',
    price: 5499,
    original_price: 5999,
    discount_percentage: 8,
    rating: 4.7,
    ratings_count: 654,
    is_prime: true,
    is_best_seller: false,
    is_amazon_choice: false,
    currency: 'SAR',
    amazon_url: 'https://www.amazon.sa/dp/B0BQWK7PC1',
  },
];

async function callDecodoAPI(query: string, apiKey: string): Promise<any> {
  // Temporary mock response while API credentials are being fixed
  console.log('Using mock data - Decodo API credentials need to be updated');

  return {
    results: [{
      content: {
        results: {
          results: {
            organic: MOCK_PRODUCTS
          }
        }
      }
    }]
  };
}

function mapProduct(item: any) {
  return {
    asin: item.asin || '',
    title: item.title || '',
    main_image: item.main_image || item.url_image || item.image || '',
    price: item.price || null,
    original_price: item.original_price || item.price_strikethrough || null,
    discount_percentage: item.discount_percentage || (item.price_strikethrough && item.price
      ? Math.round(((item.price_strikethrough - item.price) / item.price_strikethrough) * 100)
      : null),
    rating: item.rating || null,
    ratings_count: item.ratings_count || item.ratings_total || null,
    is_prime: item.is_prime || false,
    is_best_seller: item.is_best_seller || false,
    is_amazon_choice: item.is_amazon_choice || false,
    currency: item.currency || 'SAR',
    amazon_url: item.amazon_url || item.url || `https://www.amazon.sa/dp/${item.asin}`,
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
        mode: 'mock_data',
        message: 'Using mock data - Decodo API credentials need update',
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
        source: 'mock_data',
        message: 'Using mock data - Update Decodo API credentials for real data',
      };

      return new Response(JSON.stringify(response), {
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
        source: 'mock_data',
        message: 'Using mock data - Update Decodo API credentials for real data',
      };

      return new Response(JSON.stringify(response), {
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
