# 🎯 START HERE - Railway Deployment

Your Israel Trade Data App is **100% ready for Railway**.

---

## ⚡ Quick Deploy (10 Minutes)

### Option A: Railway CLI (Recommended)

```bash
# 1. Install CLI
npm install -g @railway/cli
railway login

# 2. Deploy Backend
cd /Users/akivaschiff/projects/trade-app
railway up -s backend -d backend
railway variables -s backend set ANTHROPIC_API_KEY=your-key
railway variables -s backend set DATABASE_URL=your-supabase-url
railway domain -s backend  # Get backend URL

# 3. Deploy Frontend
railway up -s frontend
railway variables -s frontend set VITE_API_URL=your-backend-url
railway variables -s frontend set VITE_SUPABASE_URL=your-supabase-url
railway variables -s frontend set VITE_SUPABASE_ANON_KEY=your-key
railway domain -s frontend

# 4. Update Backend CORS
railway variables -s backend set FRONTEND_URL=your-frontend-url
railway up -s backend -d backend  # Redeploy
```

### Option B: Railway Dashboard

1. Go to [railway.app/new](https://railway.app/new)
2. Deploy from GitHub → Select `trade-app` repo
3. Create Backend service → Set env vars → Deploy
4. Create Frontend service → Set env vars → Deploy
5. Update Backend with FRONTEND_URL → Redeploy

**Full guide:** See `RAILWAY_DEPLOY.md`

---

## 📋 Required Environment Variables

### Backend
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
DATABASE_URL=postgresql://...pooler.supabase.com:6543/postgres
FRONTEND_URL=https://frontend-production.up.railway.app
NODE_ENV=production
```

### Frontend
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_API_URL=https://backend-production.up.railway.app
```

**Get these from:**
- Anthropic API: [console.anthropic.com](https://console.anthropic.com)
- Supabase: Dashboard → Settings → API
- Database URL: Dashboard → Settings → Database → Connection Pooling (port `:6543`)

---

## ✅ Pre-Deploy Checklist

```bash
# Run verification
chmod +x verify-deploy.sh check-env.sh
./verify-deploy.sh
./check-env.sh

# Ensure:
- [ ] Code pushed to GitHub
- [ ] .env files have real values (not examples)
- [ ] DATABASE_URL uses :6543 (pooler port)
- [ ] Anthropic API key is valid
```

---

## 🧪 Test After Deploy

```bash
# Backend health
curl https://[backend-url]/health

# Database test
curl https://[backend-url]/api/db-test

# Frontend
open https://[frontend-url]

# Try chat: "What are Israel's top 5 export partners?"
```

---

## 💰 Expected Costs

**Hobby Plan:** $5/month + usage
- Includes $5 monthly credits
- Typical total: **$5-15/month** for both services
- Pay only for what you use

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `RAILWAY_DEPLOY.md` | Complete deployment guide |
| `README.md` | Project overview |
| `check-env.sh` | Environment variable checker |
| `verify-deploy.sh` | Pre-deployment verification |

---

## 🆘 Common Issues

**Backend won't start:**
- DATABASE_URL must use `:6543` not `:5432`
- Check logs: `railway logs -s backend`

**CORS errors:**
- Add FRONTEND_URL to backend env vars
- Redeploy backend

**Frontend can't reach backend:**
- Check VITE_API_URL matches backend URL
- No typos, no trailing slashes

---

## 🎉 Ready to Deploy!

**Quick start:**
```bash
railway login
railway up -s backend -d backend
```

See `RAILWAY_DEPLOY.md` for full instructions.
