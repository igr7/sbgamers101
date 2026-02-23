# Cloudflare Deployment Steps

## Current Status
✅ Cloudflare Worker API deployed: `https://sbgamers-api.ghmeshal7.workers.dev`
✅ Code updated with new API URL
✅ Changes pushed to GitHub (commit e79339b)
⚠️ Cloudflare Pages needs environment variable configuration

## Next Steps

### 1. Configure Cloudflare Pages Environment Variable

Go to Cloudflare Dashboard and set the environment variable:

1. Visit: https://dash.cloudflare.com/3e629dea176d44ca5711a240d21b6e55/pages/view/sbgamers/settings/environment-variables
2. Add Production environment variable:
   - **Variable name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://sbgamers-api.ghmeshal7.workers.dev`
3. Click "Save"

### 2. Configure Build Settings (if needed)

Build settings should be:
- **Build command**: `cd web && npm install && npm run build`
- **Build output directory**: `web/.next`
- **Root directory**: `/` (or leave empty)

### 3. Trigger Deployment

After setting the environment variable, trigger a new deployment:

**Option A: Via Dashboard**
- Go to Deployments tab
- Click "Retry deployment" on the latest deployment

**Option B: Via Git Push**
```bash
git commit --allow-empty -m "Trigger deployment with env vars"
git push origin main
```

### 4. Verify Deployment

Once deployed, test:
- https://sbgamers.com - Should load with new API
- Check browser console for API calls to `sbgamers-api.ghmeshal7.workers.dev`

## API Endpoints (Working)

- Health: https://sbgamers-api.ghmeshal7.workers.dev/api/v1/health
- Categories: https://sbgamers-api.ghmeshal7.workers.dev/api/v1/categories
- Deals: https://sbgamers-api.ghmeshal7.workers.dev/api/v1/deals
- Category: https://sbgamers-api.ghmeshal7.workers.dev/api/v1/category/gpu
