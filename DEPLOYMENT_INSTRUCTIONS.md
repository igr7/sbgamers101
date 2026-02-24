# Frontend Deployment Instructions

## Current Status
- ✅ Worker API: Live at https://sbgamers-api.ghmeshal7.workers.dev
- ✅ Real Amazon.sa products working
- ✅ Code pushed to GitHub
- ⏳ Frontend: Needs deployment

## Option 1: Vercel (Recommended - 5 minutes)

### Steps:
1. Go to: https://vercel.com/new
2. Sign in with GitHub
3. Click "Import Git Repository"
4. Select: `igr7/sbgamers101`
5. Configure:
   - **Root Directory**: `web`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
6. Add Environment Variable:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://sbgamers-api.ghmeshal7.workers.dev`
7. Click "Deploy"
8. Wait 2-3 minutes
9. Your site will be live!

### After Deployment:
- Test the site at the Vercel URL
- Add custom domain: sbgamers.com (if desired)

## Option 2: Cloudflare Pages (If Already Connected)

If you already connected Cloudflare Pages to GitHub:

1. Go to: https://dash.cloudflare.com/3e629dea176d44ca5711a240d21b6e55/pages
2. Find your project connected to `igr7/sbgamers101`
3. Go to Settings → Environment Variables
4. Add:
   - **Variable name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://sbgamers-api.ghmeshal7.workers.dev`
   - **Environment**: Production
5. Go to Deployments → Retry deployment
6. Wait 2-3 minutes

## What You'll Get

Once deployed:
- ✅ Homepage with categories
- ✅ Deals page with real Amazon.sa products
- ✅ Category pages (GPU, CPU, Monitor, etc.)
- ✅ Real prices in SAR
- ✅ Real product images and links
- ✅ Working search functionality

## Newegg API Note

The Newegg API endpoint you provided (`/scrapers/api/newegg/product/get-by-url`) is for fetching a single product by URL, not for searching products. We need a search endpoint to fetch products by category.

If you want Newegg products:
1. Check your RapidAPI subscription page
2. Find the Newegg API documentation
3. Look for a search/list products endpoint
4. Share the endpoint path with me

For now, Amazon products are working perfectly!
