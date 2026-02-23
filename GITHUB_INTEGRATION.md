# Cloudflare Pages GitHub Integration Setup

## Issue
Cloudflare Pages is not connected to GitHub, so deployments aren't building automatically with the correct environment variables.

## Solution: Connect GitHub to Cloudflare Pages

### Step 1: Connect GitHub Repository

1. Go to: https://dash.cloudflare.com/3e629dea176d44ca5711a240d21b6e55/pages/view/sbgamers/settings/builds
2. Under "Source", click "Connect to Git"
3. Select GitHub and authorize Cloudflare
4. Choose repository: `igr7/sbgamers101`
5. Set branch: `main`

### Step 2: Configure Build Settings

Set these build settings:

**Framework preset**: `Next.js`

**Build command**:
```bash
cd web && npm install && npm run build
```

**Build output directory**:
```
web/.next
```

**Root directory**: `/` (leave empty)

**Environment variables** (Production):
- `NEXT_PUBLIC_API_URL` = `https://sbgamers-api.ghmeshal7.workers.dev`
- `NODE_VERSION` = `18`

### Step 3: Save and Deploy

1. Click "Save and Deploy"
2. Cloudflare will automatically build from your GitHub repository
3. Every push to `main` branch will trigger a new deployment

## Alternative: Use Vercel (Recommended for Next.js)

If Cloudflare Pages continues to have issues, Vercel is optimized for Next.js:

1. Go to: https://vercel.com/new
2. Import `igr7/sbgamers101`
3. Set Root Directory: `web`
4. Add environment variable: `NEXT_PUBLIC_API_URL` = `https://sbgamers-api.ghmeshal7.workers.dev`
5. Deploy

Vercel will handle Next.js builds automatically and you can point sbgamers.com to it.

## Current Status

- ✅ Cloudflare Worker API: Working perfectly
- ⚠️ Cloudflare Pages: Needs GitHub connection
- 📦 Manual deployments: Not working (404 errors)

The API is ready - we just need to connect the frontend properly.
