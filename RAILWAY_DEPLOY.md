# 🚂 Railway Deployment - Ready to Deploy

Your Israel Trade Data App is fully configured for **Railway**.

---

## ⚡ Quick Deploy (10 minutes)

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 2. Deploy Backend Service

```bash
cd /Users/akivaschiff/projects/trade-app

# Link to Railway project (or create new one)
railway link

# Deploy backend
railway up -s backend -d backend

# Set environment variables
railway variables -s backend set ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
railway variables -s backend set DATABASE_URL=postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
railway variables -s backend set NODE_ENV=production

# Get backend URL
railway domain -s backend
# Copy URL like: https://backend-production-xxxx.up.railway.app
```

### 3. Deploy Frontend Service

```bash
# Still in project root
railway up -s frontend

# Set frontend environment variables (use backend URL from step 2)
railway variables -s frontend set VITE_SUPABASE_URL=https://xxxxx.supabase.co
railway variables -s frontend set VITE_SUPABASE_ANON_KEY=eyJxxx...
railway variables -s frontend set VITE_API_URL=https://backend-production-xxxx.up.railway.app

# Get frontend URL
railway domain -s frontend
```

### 4. Update Backend CORS

```bash
# Add frontend URL to backend
railway variables -s backend set FRONTEND_URL=https://frontend-production-xxxx.up.railway.app

# Redeploy backend
railway up -s backend -d backend
```

---

## 🎯 Alternative: Railway Dashboard

### Deploy via Web UI

1. Go to [railway.app/new](https://railway.app/new)
2. Click "Deploy from GitHub repo"
3. Select your `trade-app` repository
4. Railway creates a project

#### Backend Service:
- Click "New" → "GitHub Repo" → Select same repo
- Set variables in Settings:
  ```
  Root Directory: backend
  Build Command: (auto-detected)
  Start Command: npm start
  ```
- Add Environment Variables:
  - `ANTHROPIC_API_KEY`
  - `DATABASE_URL`
  - `FRONTEND_URL` (add after frontend deploys)
  - `NODE_ENV=production`
- Generate Domain → Copy URL

#### Frontend Service:
- Click "New" → "GitHub Repo" → Select same repo
- Set variables in Settings:
  ```
  Root Directory: (leave empty - uses root)
  Build Command: npm install && npm run build
  Start Command: npm run preview
  ```
- Add Environment Variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL` (use backend URL)
- Generate Domain

---

## 📋 Environment Variables Reference

### Backend Service

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
DATABASE_URL=postgresql://postgres.[project]:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
FRONTEND_URL=https://frontend-production-xxxx.up.railway.app
NODE_ENV=production
```

**Critical:** DATABASE_URL must use port `:6543` (Supabase pooler), not `:5432`

### Frontend Service

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_API_URL=https://backend-production-xxxx.up.railway.app
```

---

## ✅ Configuration Files

Your project has:
- ✅ `railway.toml` - Railway config (legacy, can ignore)
- ✅ `backend/railway.json` - Backend service config
- ✅ `railway-frontend.json` - Frontend service config (if needed)

Railway auto-detects from these files when deploying.

---

## 🧪 Testing After Deploy

```bash
# Backend health check
curl https://backend-production-xxxx.up.railway.app/health

# Database test
curl https://backend-production-xxxx.up.railway.app/api/db-test

# Frontend
open https://frontend-production-xxxx.up.railway.app
```

---

## 💰 Pricing

**Hobby Plan:** $5/month + usage
- Includes $5 in monthly credits
- Pay only for what you use beyond that
- Typical cost: $5-15/month for both services

**Usage-based pricing:**
- CPU: ~$0.000463/vCPU-minute
- Memory: ~$0.000231/GB-minute
- Network: First 100GB free

Your typical costs:
- Backend (24/7): ~$3-8/month
- Frontend (static): ~$2-5/month

---

## 🔧 Common Railway Commands

```bash
# View logs
railway logs -s backend
railway logs -s frontend

# Open service in browser
railway open -s backend

# View environment variables
railway variables -s backend

# Redeploy
railway up -s backend -d backend

# Check status
railway status
```

---

## 🆘 Troubleshooting

**Backend fails to start:**
- Check logs: `railway logs -s backend`
- Verify DATABASE_URL has `:6543` port
- Ensure ANTHROPIC_API_KEY is valid
- Check all env vars are set

**CORS errors:**
- Verify FRONTEND_URL matches actual frontend domain
- No trailing slashes in URLs
- Redeploy backend after adding FRONTEND_URL

**Frontend can't reach backend:**
- Check VITE_API_URL matches backend URL exactly
- Backend must be running (check logs)
- No typos in environment variables

**"Service not found":**
- Ensure you're in the right project: `railway status`
- Link project: `railway link`

---

## 📚 Resources

- Railway Docs: https://docs.railway.app
- Railway CLI: https://docs.railway.app/develop/cli
- Railway Templates: https://railway.app/templates

---

## 🎉 You're Ready!

Railway is configured and ready. Follow the Quick Deploy steps above!

**Pro tip:** Deploy backend first, get its URL, then deploy frontend with that URL.
