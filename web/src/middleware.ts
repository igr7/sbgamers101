import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // CRITICAL: Prevent BunnyCDN from caching HTML pages for too long.
  // Next.js defaults to s-maxage=31536000 (1 year) for static pages,
  // which causes stale HTML to be served after redeploys (referencing
  // old CSS/JS filenames that no longer exist = white page).
  //
  // Use short CDN cache (60s) with stale-while-revalidate for fast
  // responses while ensuring fresh content after deploys.
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  response.headers.set('CDN-Cache-Control', 'max-age=60');
  response.headers.set('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch');

  // For RSC requests (client-side navigation), don't cache at CDN at all
  if (request.headers.get('RSC') === '1') {
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    response.headers.set('CDN-Cache-Control', 'no-store');
  }

  return response;
}

export const config = {
  matcher: [
    // Match all page routes, not static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
