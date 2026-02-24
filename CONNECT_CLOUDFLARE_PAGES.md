# Connect Cloudflare Pages to GitHub

## Current Status
- ✅ Worker API: Live with real Amazon products
- ✅ Code: Pushed to GitHub
- ❌ Pages Project: NOT connected to GitHub (shows "Git Provider: No")

## Steps to Connect

### 1. Go to Cloudflare Pages Dashboard
https://dash.cloudflare.com/3e629dea176d44ca5711a240d21b6e55/pages

### 2. Delete or Rename Old Project (Optional)
If you want to start fresh:
- Click on "sbgamers" project
- Go to Settings → scroll to bottom
- Click "Delete project"

### 3. Create New Git-Connected Project
- Click "Create a project"
- Click "Connect to Git"
- Select "GitHub"
- Authorize Cloudflare if needed
- Select repository: `igr7/sbgamers101`
- Click "Begin setup"

### 4. Configure Build Settings
**Framework preset**: Next.js

**Build settings:**
- **Build command**: `npm run pages:build`
- **Build output directory**: `.vercel/output/static`
- **Root directory**: `web`

**Environment variables:**
- Click "Add variable"
- **Variable name**: `NEXT_PUBLIC_API_URL`
- **Value**: `https://sbgamers-api.ghmeshal7.workers.dev`

### 5. Deploy
- Click "Save and Deploy"
- Wait 3-5 minutes for build
- Your site will be live!

## If Build Fails on Cloudflare

If the Cloudflare build fails (Windows compatibility issues), use Vercel instead:

### Vercel Deployment (5 minutes)
1. Go to: https://vercel.com/new
2. Sign in with GitHub
3. Import: `igr7/sbgamers101`
4. Configure:
   - **Root Directory**: `web`
   - **Framework**: Next.js (auto-detected)
   - **Environment Variable**:
     - Name: `NEXT_PUBLIC_API_URL`
     - Value: `https://sbgamers-api.ghmeshal7.workers.dev`
5. Click "Deploy"
6. Done!

## What You'll Get

Once deployed:
- ✅ Real Amazon.sa products
- ✅ All categories working
- ✅ Deals page with discounts
- ✅ Search functionality
- ✅ Product details pages
- ✅ Prices in SAR

## Current API Status
- ✅ Amazon API: Working perfectly
- ⚠️ Newegg API: Endpoint needs verification (only has single product lookup, not search)
