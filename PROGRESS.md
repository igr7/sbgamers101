---
## Goal

Build a complete Amazon Saudi Arabia (amazon.sa) data API system deployed on Cloudflare Workers, with a web frontend on Cloudflare Pages.

**Deployments:**
1. **sbgamers.com** (Cloudflare Pages) - Web frontend for browsing products
2. **sbgamers-api.ghmeshal7.workers.dev** (Cloudflare Workers) - API backend with KV cache

## Current Status

### ✅ Completed
- **Cloudflare Worker API**: Deployed and fully functional
  - URL: `https://sbgamers-api.ghmeshal7.workers.dev`
  - All endpoints working: `/api/v1/health`, `/api/v1/categories`, `/api/v1/deals`, `/api/v1/category/[slug]`
  - KV caching configured (15 min TTL)
  - Decodo API integrated
- **Code Migration**: All CranL references removed
  - Updated `web/src/lib/api.ts` with Cloudflare Worker URL
  - Updated `web/.env.production` with new API URL
  - All changes committed to GitHub (main branch)
- **Workers Directory**: Added complete Cloudflare Worker code
  - `workers/src/index.ts` - Main worker with all routes
  - `workers/wrangler.toml` - Configuration with KV binding

### ⏳ Pending
- **Cloudflare Pages Configuration**: Needs environment variable setup
  - Must set `NEXT_PUBLIC_API_URL=https://sbgamers-api.ghmeshal7.workers.dev` in dashboard
  - Current production deployment still uses old CranL URL
  - See `SETUP_COMPLETE.md` for detailed instructions

## Instructions

- **API**: Cloudflare Worker at `sbgamers-api.ghmeshal7.workers.dev`
- **Decodo API Key**: Stored in Cloudflare Worker secrets
- GitHub repo: `https://github.com/igr7/sbgamers101.git`
- Branch: `main`

## Architecture

```
sbgamers.com (Cloudflare Pages)
    ↓ HTTPS
sbgamers-api.ghmeshal7.workers.dev (Cloudflare Worker + KV)
    ↓ HTTPS
Decodo API (Smartproxy) → Amazon.sa data
```

## Verified Working Endpoints

- `GET /api/v1/health` - Health check
- `GET /api/v1/categories` - Returns 6 gaming categories
- `GET /api/v1/deals` - Returns GPU products with caching
- `GET /api/v1/category/{slug}` - Returns products by category

## Files Structure

**Cloudflare Worker (workers/):**
- `src/index.ts` - Main worker code
- `wrangler.toml` - Worker configuration
- `package.json` - Dependencies

**Web Frontend (web/):**
- `src/app/` - Next.js pages
- `src/lib/api.ts` - API client (updated with Worker URL)
- `src/components/` - React components
- `.env.production` - Production environment variables
- `package.json` - Dependencies

## Next Action Required

**Set environment variable in Cloudflare Pages dashboard:**
1. Go to: https://dash.cloudflare.com → Pages → sbgamers → Settings → Environment variables
2. Add Production variable: `NEXT_PUBLIC_API_URL` = `https://sbgamers-api.ghmeshal7.workers.dev`
3. Retry latest deployment or push new commit

See `SETUP_COMPLETE.md` for detailed step-by-step instructions.
