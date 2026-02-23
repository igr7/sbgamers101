---
## Goal

Build a complete Amazon Saudi Arabia (amazon.sa) data API system deployed on CranL.com, while maintaining an existing web frontend on sbgamers.com. The user has **TWO separate deployments**:
1. **sbgamers.com** (Cloudflare Pages) - Web frontend for browsing products
2. **sbgamers101-5amqpe.cranl.net** (CranL) - API backend with PostgreSQL + Redis

## Instructions

- Use omkar.cloud Amazon Scraper API (API Key: `ok_cbf6195901abcccbea4b2c804778c9b3`)
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

## Accomplished

**COMPLETED:**
- Built complete API system with 6 main routes + 3 admin routes + 1 categories route
- Created Prisma schema with 5 models (Product, PriceHistory, TrackedProduct, SearchCache, ApiUsageLog)
- Implemented omkar.cloud client with usage logging
- Implemented Redis caching with stale-while-revalidate
- Created Bull queue with 4 background jobs
- Successfully pushed to GitHub (`main` branch)
- CranL deployment succeeds and API is responding
- Created `web/src/lib/api.ts` to connect to CranL API
- Added `getPriceHistory` function to api.ts
- Added `PriceHistoryEntry` type to api.ts
- Type check passes for web frontend
- All changes committed and pushed
- **FIXED**: TypeScript export errors for Redis client
- **FIXED**: Lazy-loaded Bull queues to prevent serverless startup timeouts
- **FIXED**: Removed Prisma dependency from omkar-client for faster API responses
- **VERIFIED**: All API endpoints working (categories, deals, search)

**VERIFIED WORKING:**
- `/api/v1/categories` - Returns list of gaming categories
- `/api/v1/deals` - Returns products from Omkar API
- `/api/v1/search` - Returns search results from Omkar API

## Relevant files / directories

**API (in `api/` folder - READY):**
- `api/src/app/api/v1/` - All API routes
- `api/src/app/api/v1/categories/route.ts` - Categories endpoint (NEW)
- `api/src/lib/omkar/omkar-client.ts` - omkar.cloud API client
- `api/src/lib/cache/` - Redis caching
- `api/src/lib/db/prisma-client.ts` - Database connection
- `api/src/lib/queue/` - Bull queue jobs
- `api/prisma/schema.prisma` - Database schema
- `api/package.json` - API dependencies
- `api/.env.example` - Environment variables template

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
