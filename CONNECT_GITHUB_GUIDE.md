# How to Connect GitHub to Cloudflare Pages

## Current Status
- Git Provider: **No** (still not connected)
- Latest deployment: c580321 (48 minutes ago - manual deployment)
- Products not loading because environment variables aren't baked into the build

## Exact Steps to Connect GitHub

### Option 1: Via Settings

1. **Go to this exact URL**:
   https://dash.cloudflare.com/3e629dea176d44ca5711a240d21b6e55/pages/view/sbgamers/settings/builds

2. **Look for "Source" section** - it should show "Direct Upload" or "None"

3. **Click "Connect to Git"** button

4. **Authorize GitHub**:
   - Click "Connect GitHub"
   - Authorize Cloudflare Pages in the popup
   - Select repository: `igr7/sbgamers101`
   - Choose branch: `main`

5. **Configure build**:
   - Build command: `cd web && npm install && npm run build`
   - Build output directory: `web/.next`
   - Root directory: `/` (or leave empty)

6. **Click "Save and Deploy"**

### Option 2: Create New Pages Project

If the above doesn't work, you may need to recreate the Pages project:

1. Go to: https://dash.cloudflare.com/3e629dea176d44ca5711a240d21b6e55/pages

2. Click "Create a project"

3. Click "Connect to Git"

4. Select GitHub → `igr7/sbgamers101` → branch `main`

5. Configure:
   - Project name: `sbgamers`
   - Build command: `cd web && npm install && npm run build`
   - Build output: `web/.next`
   - Root directory: `/`

6. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://sbgamers-api.ghmeshal7.workers.dev`

7. Click "Save and Deploy"

8. After deployment, go to Custom domains and add: `sbgamers.com` and `www.sbgamers.com`

## How to Verify It Worked

After connecting, you should see:
- "Git Provider: GitHub" (not "No")
- New deployment triggered automatically
- Commit hash changes to latest (91d6ac1)

## Alternative: Use Vercel

If Cloudflare Pages continues to have issues, I recommend using Vercel instead:

1. Go to: https://vercel.com/new
2. Import: `igr7/sbgamers101`
3. Root Directory: `web`
4. Add env: `NEXT_PUBLIC_API_URL` = `https://sbgamers-api.ghmeshal7.workers.dev`
5. Deploy
6. Update DNS for sbgamers.com

Vercel is optimized for Next.js and will work immediately.
