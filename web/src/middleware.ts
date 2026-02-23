import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Ensure CDN (BunnyCDN) varies cache on RSC header so it doesn't serve
  // RSC payloads for HTML requests or vice versa
  response.headers.set('Vary', 'RSC, Next-Router-State-Tree, Next-Router-Prefetch');

  // For RSC requests (client-side navigation), prevent CDN caching
  // so the CDN only caches full HTML pages
  if (request.headers.get('RSC') === '1') {
    response.headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    response.headers.set('CDN-Cache-Control', 'no-store');
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
