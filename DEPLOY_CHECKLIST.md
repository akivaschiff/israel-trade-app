# Railway Deployment Checklist

## Pre-Deployment (5 min)

- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login to Railway: `railway login`
- [ ] Code pushed to GitHub
- [ ] `.env` files have real values (not .example)
- [ ] Run verification: `./verify-deploy.sh`
- [ ] Check environment vars: `./check-env.sh`

## Prepare Environment Variables

### Backend Variables
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
DATABASE_URL=postgresql://postgres.[project]:password@...pooler.supabase.com:6543/postgres
NODE_ENV=production
```

### Frontend Variables
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

**Get credentials from:**
- Anthropic: console.anthropic.com
- Supabase URL/Key: Dashboard → Settings → API
- Database URL: Dashboard → Settings → Database → Connection Pooling (:6543 port)

---

## Deploy Steps

### 1. Deploy Backend (5 min)

```bash
cd /path/to/trade-app

# Create/link Railway project
railway link  # or railway init if new project

# Deploy backend
railway up -s backend -d backend

# Set environment variables
railway variables -s backend set ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
railway variables -s backend set DATABASE_URL=postgresql://...
railway variables -s backend set NODE_ENV=production

# Generate domain and get URL
railway domain -s backend
```

- [ ] Backend deployed successfully
- [ ] Copy backend URL: `https://backend-production-xxxx.up.railway.app`

### 2. Deploy Frontend (3 min)

```bash
# Deploy frontend (from project root)
railway up -s frontend

# Set environment variables (use backend URL from step 1)
railway variables -s frontend set VITE_SUPABASE_URL=https://xxxxx.supabase.co
railway variables -s frontend set VITE_SUPABASE_ANON_KEY=eyJxxx...
railway variables -s frontend set VITE_API_URL=https://backend-production-xxxx.up.railway.app

# Generate domain
railway domain -s frontend
```

- [ ] Frontend deployed successfully
- [ ] Copy frontend URL: `https://frontend-production-xxxx.up.railway.app`

### 3. Update Backend CORS (2 min)

```bash
# Add frontend URL to backend
railway variables -s backend set FRONTEND_URL=https://frontend-production-xxxx.up.railway.app

# Redeploy backend
railway up -s backend -d backend
```

- [ ] Backend updated with FRONTEND_URL
- [ ] Backend redeployed

---

## Testing (5 min)

### Backend Tests
```bash
# Health check
curl https://backend-production-xxxx.up.railway.app/health

# Database test
curl https://backend-production-xxxx.up.railway.app/api/db-test
```

- [ ] Health check returns `{"status":"ok"}`
- [ ] DB test returns row count

### Frontend Tests
```bash
# Open in browser
open https://frontend-production-xxxx.up.railway.app
```

- [ ] Frontend loads without errors
- [ ] No console errors (F12)
- [ ] Chat interface visible
- [ ] Try query: "What are Israel's top 5 export partners?"
- [ ] Chat returns data successfully

---

## Common Issues

### Backend won't start
- [ ] Check logs: `railway logs -s backend`
- [ ] Verify DATABASE_URL uses `:6543` not `:5432`
- [ ] Ensure ANTHROPIC_API_KEY is valid
- [ ] All environment variables set

### CORS errors in browser
- [ ] FRONTEND_URL matches actual frontend domain
- [ ] No trailing slashes in URLs
- [ ] Backend redeployed after adding FRONTEND_URL

### Frontend can't reach backend
- [ ] VITE_API_URL matches backend URL exactly
- [ ] Backend service is running: `railway status -s backend`
- [ ] No typos in environment variables

### "Service not found" error
- [ ] In correct project: `railway status`
- [ ] Link project: `railway link`
- [ ] Check service names: `railway service`

---

## Post-Deployment

- [ ] Bookmark backend URL
- [ ] Bookmark frontend URL
- [ ] Test from different device/network
- [ ] Monitor usage in Railway dashboard
- [ ] Set up billing alerts (optional)

---

## Done! 🎉

Your app is live at: `https://frontend-production-xxxx.up.railway.app`

**Expected monthly cost:** $5-15
- Includes $5 in credits
- Backend: ~$3-8/month
- Frontend: ~$2-5/month

**Monitor usage:** [railway.app/dashboard](https://railway.app/dashboard)
