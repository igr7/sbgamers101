# SB Gamers - Final Setup Instructions

## ✅ Completed

1. **Cloudflare Worker API** - Deployed and working
   - URL: `https://sbgamers-api.ghmeshal7.workers.dev`
   - Endpoints verified: `/api/v1/health`, `/api/v1/categories`, `/api/v1/deals`

2. **Code Updates** - All CranL references removed
   - Updated `web/src/lib/api.ts` with new API URL
   - Updated `web/.env.production` with new API URL
   - All changes committed to GitHub (main branch)

3. **Workers Configuration**
   - KV namespace configured for caching
   - Decodo API key set as secret
   - All endpoints working correctly

## 🔧 Required: Cloudflare Pages Setup

You need to configure Cloudflare Pages in the dashboard to complete the deployment:

### Step 1: Configure Build Settings

1. Go to: https://dash.cloudflare.com/3e629dea176d44ca5711a240d21b6e55/pages/view/sbgamers/settings/builds
2. Set these build settings:
   - **Build command**: `cd web && npm install && npm run build`
   - **Build output directory**: `web/.next`
   - **Root directory**: `/` (leave empty or set to root)
   - **Node version**: `18` or higher

### Step 2: Add Environment Variable

1. Go to: https://dash.cloudflare.com/3e629dea176d44ca5711a240d21b6e55/pages/view/sbgamers/settings/environment-variables
2. Click "Add variable" under **Production**
3. Add:
   - **Variable name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://sbgamers-api.ghmeshal7.workers.dev`
4. Click "Save"

### Step 3: Trigger New Deployment

After saving the environment variable:
1. Go to: https://dash.cloudflare.com/3e629dea176d44ca5711a240d21b6e55/pages/view/sbgamers/deployments
2. Click "Retry deployment" on the latest deployment
   OR
3. Push a new commit to trigger automatic deployment

### Step 4: Verify

Once deployed, test these URLs:
- https://sbgamers.com - Main site
- https://sbgamers.com/categories - Categories page
- https://sbgamers.com/deals - Deals page

Check browser console to verify API calls go to `sbgamers-api.ghmeshal7.workers.dev`

## 📊 Architecture Summary

```
┌─────────────────────────────────────────────────────┐
│  sbgamers.com (Cloudflare Pages)                    │
│  - Next.js 15 frontend                              │
│  - Static + Server-side rendering                   │
│  - Calls API via NEXT_PUBLIC_API_URL                │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────┐
│  sbgamers-api.ghmeshal7.workers.dev                 │
│  - Cloudflare Worker                                │
│  - KV cache (15 min TTL)                            │
│  - Decodo API integration                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTPS
                   ▼
┌─────────────────────────────────────────────────────┐
│  Decodo API (Smartproxy)                            │
│  - Amazon.sa product data                           │
│  - Real-time scraping                               │
└─────────────────────────────────────────────────────┘
```

## 🎯 What's Working Now

- ✅ Cloudflare Worker API responding correctly
- ✅ All API endpoints functional
- ✅ Code updated and pushed to GitHub
- ✅ KV caching configured
- ⏳ Cloudflare Pages needs environment variable configuration

## 📝 Notes

- The current production deployment (commit c41a503) still uses old CranL URL
- Once you set the environment variable and redeploy, everything will be connected
- No database or Redis needed - using Cloudflare KV for caching
- Worker handles all API logic, Pages just serves the frontend
