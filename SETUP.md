# SB Gamers - Setup & Deployment Guide

## Local Development

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Set Up Cloudflare D1 Database
```bash
cd worker

# Create the D1 database
npx wrangler d1 create sbgamers-db

# Copy the database_id from the output and paste it in worker/wrangler.toml

# Run migrations (local)
npx wrangler d1 execute sbgamers-db --local --file=../schema.sql

# Run migrations (production)
npx wrangler d1 execute sbgamers-db --remote --file=../schema.sql
```

### 3. Start the Worker (Backend)
```bash
cd worker
npm run dev
# Runs on http://localhost:8787
```

### 4. Start Next.js (Frontend)
```bash
cd web
npm run dev
# Runs on http://localhost:3000
```

### 5. Seed Products (First Time)
Open in browser or curl:
```
http://localhost:8787/api/admin/sync?key=C6DCFF3EF58A4D34919C533F13B832CB
```
This will fetch ~600 products from Amazon.sa via Rainforest API.

## Production Deployment

### Deploy Worker
```bash
cd worker
npx wrangler deploy
```

### Deploy Frontend to Cloudflare Pages
```bash
cd web
npm run deploy
```

Or connect to GitHub and set up automatic deployments in Cloudflare Pages dashboard:
- Build command: `cd web && npm run build`
- Output directory: `web/.next`

### Custom Domain (sbgamers.com)
1. In Cloudflare Dashboard > Pages > your project > Custom domains
2. Add `sbgamers.com` and `www.sbgamers.com`
3. Update DNS records as prompted

### Environment Variables
Set in Cloudflare Pages dashboard:
- `NEXT_PUBLIC_API_URL` = `https://sbgamers-api.YOUR_SUBDOMAIN.workers.dev`

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/categories` | List all categories |
| `GET /api/categories/:slug/products` | Products by category |
| `GET /api/search?q=...` | Search products |
| `GET /api/products/:asin` | Single product details |
| `GET /api/products/:asin/history` | Price history |
| `GET /api/deals?min_discount=10` | Best deals |
| `GET /api/admin/sync?key=...` | Trigger full product sync |
| `GET /api/admin/update-prices?key=...` | Update existing prices |
