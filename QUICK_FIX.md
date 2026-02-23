# Quick Fix: Recreate Cloudflare Pages with GitHub

## Problem
Your current Cloudflare Pages project was created with "Direct Upload" mode, which doesn't have GitHub integration. You need to recreate it.

## Solution: Recreate with GitHub Connection

### Step 1: Delete Current Project (Optional - or just create new one)

You can either delete the old one or just create a new project and switch DNS later.

### Step 2: Create New Pages Project with GitHub

1. **Go to**: https://dash.cloudflare.com/3e629dea176d44ca5711a240d21b6e55/pages

2. **Click**: "Create a project" button

3. **Click**: "Connect to Git" tab (NOT "Direct Upload")

4. **Connect GitHub**:
   - Click "Connect GitHub"
   - Authorize Cloudflare in the popup
   - Select repository: `igr7/sbgamers101`

5. **Configure Build**:
   - Project name: `sbgamers` (or `sbgamers-new` if keeping old one)
   - Production branch: `main`
   - Framework preset: `Next.js`
   - Build command: `cd web && npm install && npm run build`
   - Build output directory: `web/.next`
   - Root directory: `/` (leave empty)

6. **Add Environment Variable**:
   - Click "Add variable"
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://sbgamers-api.ghmeshal7.workers.dev`

7. **Click**: "Save and Deploy"

8. **Wait for build** (2-3 minutes)

9. **Add Custom Domain**:
   - Go to project → Settings → Custom domains
   - Add: `sbgamers.com` and `www.sbgamers.com`

## Option 2: Use Vercel (Faster & Easier)

Vercel is optimized for Next.js and will work immediately:

1. **Go to**: https://vercel.com/new
2. **Import**: `igr7/sbgamers101`
3. **Configure**:
   - Root Directory: `web`
   - Framework: Next.js (auto-detected)
   - Environment variable: `NEXT_PUBLIC_API_URL` = `https://sbgamers-api.ghmeshal7.workers.dev`
4. **Deploy** (takes 1-2 minutes)
5. **Add domain**: sbgamers.com in project settings
6. **Update DNS**: Point sbgamers.com to Vercel

## Which Should You Choose?

- **Vercel**: Faster, easier, optimized for Next.js ✅ Recommended
- **Cloudflare Pages**: Need to recreate project with GitHub

Both will work perfectly with your Cloudflare Worker API.
