# Deploy to Vercel - Complete Guide

## Why Vercel?
- Optimized for Next.js (your frontend framework)
- Automatic GitHub integration
- Will work immediately with your Cloudflare Worker API
- Simpler than recreating Cloudflare Pages project

## Step-by-Step Instructions

### 1. Go to Vercel
Open this link: https://vercel.com/new

### 2. Sign In / Sign Up
- If you have a Vercel account, sign in
- If not, sign up with your GitHub account (recommended)

### 3. Import Repository
- Click "Import Git Repository"
- You'll see a list of your GitHub repos
- Find and select: `igr7/sbgamers101`
- Click "Import"

### 4. Configure Project
You'll see a configuration screen. Set these values:

**Project Name**: `sbgamers` (or any name you prefer)

**Framework Preset**: Next.js (should auto-detect)

**Root Directory**: `web` ⚠️ IMPORTANT - Click "Edit" and type `web`

**Build Command**: Leave default (`npm run build`)

**Output Directory**: Leave default (`.next`)

### 5. Add Environment Variable
Click "Environment Variables" section and add:

**Name**: `NEXT_PUBLIC_API_URL`
**Value**: `https://sbgamers-api.ghmeshal7.workers.dev`

Click "Add"

### 6. Deploy
Click the big "Deploy" button

### 7. Wait for Build (2-3 minutes)
Vercel will:
- Clone your repository
- Install dependencies
- Build your Next.js app with the environment variable
- Deploy to their global CDN

### 8. Test the Deployment
Once complete, Vercel will give you a URL like:
`https://sbgamers-xxx.vercel.app`

Click it and test:
- Homepage should load
- Categories should work
- Deals page should show products from your API

### 9. Add Custom Domain
Once you verify it works:

1. In Vercel project, go to "Settings" → "Domains"
2. Add: `sbgamers.com`
3. Add: `www.sbgamers.com`
4. Vercel will show you DNS records to update

### 10. Update DNS (if needed)
If sbgamers.com is currently pointing to Cloudflare Pages:
1. Go to Cloudflare DNS settings
2. Update the records as Vercel instructs
3. Wait 5-10 minutes for DNS propagation

## What Happens After
- Every push to GitHub `main` branch will automatically deploy
- Your Cloudflare Worker API will continue working perfectly
- Products will load from Amazon.sa via your API

## Need Help?
Let me know when you:
- Complete the deployment
- Get stuck on any step
- Want to verify it's working

Your API is ready - this will connect everything!
