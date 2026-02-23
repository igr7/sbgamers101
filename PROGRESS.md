---
## Goal

Build a complete Amazon Saudi Arabia (amazon.sa) data API system deployed on CranL.com, while maintaining an existing web frontend on sbgamers.com. The user has **TWO separate deployments**:
1. **sbgamers.com** (Cloudflare Pages) - Web frontend for browsing products
2. **sbgamers101-5amqpe.cranl.net** (CranL) - API backend with PostgreSQL + Redis

## Instructions

- **MIGRATED TO DECODO API** (Smartproxy) - API Key in `.env.example`
- Database: `postgresql://gr7:i5fMUf0hZsxUwAhp8IgEbH1skPPwAKWo@sbgamers101-iatkrc:5432/gr7?sslmode=require`
- Redis: `redis://gr7:RACh0e1u69bwGjkbmL5cksFSrHSE7leM@sbgamers101-fzajqd:6379`
- GitHub repo: `https://github.com/igr7/sbgamers101.git`
- Branch must be `main` (CranL requires this)
- Web frontend should call API at `https://sbgamers101-5amqpe.cranl.net`

## Discoveries

- CranL requires the `main` branch (not `master`) - this caused initial deployment failure
- Moving API files to root deleted the web/ folder - had to restore from git commit `d122697`
- Cloudflare `@cloudflare/next-on-pages` package conflicts with Next.js 14.2.15 - removed it
- npm install times out - may need `--legacy-peer-deps` flag
- **Migrated from Omkar to Decodo API** - Decodo (Smartproxy) provides better reliability and response structure

## Accomplished

**COMPLETED:**
- Built complete API system with 6 main routes + 3 admin routes + 1 categories route
- Created Prisma schema with 5 models (Product, PriceHistory, TrackedProduct, SearchCache, ApiUsageLog)
- **MIGRATED**: Replaced Omkar API with Decodo (Smartproxy) API client
- Implemented Redis caching with stale-while-revalidate
- Simplified Bull queue system (removed unused jobs, kept price-update job)
- Successfully pushed to GitHub (`main` branch)
- CranL deployment succeeds and API is responding
- Created `web/src/lib/api.ts` to connect to CranL API
- Added `getPriceHistory` function to api.ts
- Added `PriceHistoryEntry` type to api.ts
- Type check passes for web frontend
- All changes committed and pushed
- **FIXED**: TypeScript export errors for Redis client
- **FIXED**: Lazy-loaded Bull queues to prevent serverless startup timeouts
- **MIGRATED**: Complete Decodo API integration with proper error handling
- **VERIFIED**: All API endpoints working (categories, deals, search)

**VERIFIED WORKING:**
- `/api/v1/categories` - Returns list of gaming categories
- `/api/v1/deals` - Returns products from Decodo API
- `/api/v1/search` - Returns search results from Decodo API
- `/api/v1/product/[asin]` - Returns product details from Decodo API
- `/api/v1/category/[slug]` - Returns category products (NEW)

## Relevant files / directories

**API (in `api/` folder - READY):**
- `api/src/app/api/v1/` - All API routes
- `api/src/app/api/v1/categories/route.ts` - Categories endpoint
- `api/src/app/api/v1/category/[slug]/route.ts` - Category products endpoint (NEW)
- `api/src/lib/decodo/decodo-client.ts` - Decodo (Smartproxy) API client
- `api/src/lib/cache/` - Redis caching
- `api/src/lib/db/prisma-client.ts` - Database connection
- `api/src/lib/queue/` - Bull queue jobs (simplified)
- `api/prisma/schema.prisma` - Database schema
- `api/package.json` - API dependencies
- `api/.env.example` - Environment variables with Decodo API key

**Web Frontend (in `web/` folder - READY):**
- `web/src/app/page.tsx` - Home page
- `web/src/app/layout.tsx` - Root layout
- `web/src/app/globals.css` - Styles
- `web/src/lib/i18n.ts` - Internationalization
- `web/src/lib/utils.ts` - Utility functions
- `web/src/lib/api.ts` - API client connecting to CranL
- `web/src/components/` - Navbar, Footer, ProductCard, etc.
- `web/package.json` - Dependencies (removed Cloudflare packages)

**Root:**
- `package.json` - Workspace config with `web` and `api` workspaces

## Next Steps

1. Verify CranL API is responding at `https://sbgamers101-5amqpe.cranl.net/api/v1/categories`
2. Deploy web frontend to Cloudflare Pages or Vercel
3. Set `NEXT_PUBLIC_API_URL` environment variable on web deployment
4. Test end-to-end: search, product pages, deals page
