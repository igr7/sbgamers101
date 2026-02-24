# Cloudflare Pages Configuration

## Your Site
- **URL**: https://sbgamers.pages.dev
- **Status**: Live but showing old deployment (404 on /deals page)

## Required Configuration

### 1. Build Settings

Go to: https://dash.cloudflare.com/3e629dea176d44ca5711a240d21b6e55/pages

Find your project → Settings → Builds & deployments

**Configure:**
- **Root directory**: `web`
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Framework preset**: Next.js

### 2. Environment Variables

Go to: Settings → Environment variables

**Add this variable:**
- **Variable name**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://sbgamers-api.ghmeshal7.workers.dev`
- **Environment**: Production

### 3. Trigger New Deployment

After configuring:
1. Go to: Deployments tab
2. Click "Retry deployment" on the latest deployment
3. Or wait for automatic deployment (I just pushed a commit)
4. Wait 2-3 minutes for build to complete

### 4. Verify Deployment

Once deployed, test:
- Homepage: https://sbgamers.pages.dev
- Deals: https://sbgamers.pages.dev/deals (should show real products)
- Category: https://sbgamers.pages.dev/category/gpu

## If Configuration is Too Complex

Use Vercel instead (faster and easier):
1. Go to: https://vercel.com/new
2. Import: igr7/sbgamers101
3. Root Directory: `web`
4. Add env var: `NEXT_PUBLIC_API_URL` = `https://sbgamers-api.ghmeshal7.workers.dev`
5. Deploy
6. Done in 5 minutes!
