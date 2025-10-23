# Israel Trade Data App

Full-stack application for visualizing and querying Israeli trade data with AI-powered chat.

## 🚀 Quick Links

- **[START_HERE.md](START_HERE.md)** - 👈 Begin deployment here
- **[RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)** - Complete Railway guide

---

## 🏗️ Tech Stack

- **Frontend:** Vue 3 + TypeScript + TailwindCSS + ECharts
- **Backend:** Express.js + Claude AI + PostgreSQL
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Railway

---

## 📁 Project Structure

```
trade-app/
├── src/                    # Vue 3 frontend
│   ├── components/        # UI components
│   ├── views/             # Page views
│   └── stores/            # Pinia state management
├── backend/                # Express API server
│   ├── server.js          # Main server with Claude AI
│   ├── package.json       # Backend dependencies
│   └── railway.json       # Railway config
├── public/                 # Static assets
├── .env.example           # Frontend env template
├── backend/.env.example   # Backend env template
└── railway.toml           # Railway monorepo config
```

---

## 💻 Local Development

### 1. Setup

```bash
# Clone and install
git clone <your-repo>
cd trade-app
npm install

# Backend
cd backend
npm install
```

### 2. Environment Variables

**Frontend** (root `.env`):
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_API_URL=http://localhost:3001
```

**Backend** (`backend/.env`):
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
DATABASE_URL=postgresql://...
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Run Dev Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
# http://localhost:5173
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
# http://localhost:3001
```

---

## 🚂 Deployment to Railway

See **[START_HERE.md](START_HERE.md)** for deployment instructions.

**Quick commands:**
```bash
railway login
railway up -s backend -d backend
railway up -s frontend
```

**Estimated cost:** $5-15/month

---

## 🎯 Features

- 📊 Interactive trade visualizations with ECharts
- 💬 AI-powered chat for database queries (Claude)
- 🗺️ Geographic trade analysis by region
- 📈 Time series trends (2023-2025)
- 🔍 Product and country filtering
- 📱 Responsive design

---

## 🗄️ Database Schema

Main tables in Supabase:
- **trade_data** - Import/export transactions (~1.5M rows)
- **products** - HS code descriptions
- **countries** - Country names and regions

See `backend/server.js` for full schema documentation.

---

## 📜 Scripts

### Frontend
```bash
npm run dev          # Dev server (Vite)
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # ESLint
```

### Backend
```bash
npm start            # Production mode
npm run dev          # Dev with auto-reload
```

---

## 🧪 Testing Deployment

After deploying:

```bash
# Health check
curl https://[backend-url]/health

# Database connection
curl https://[backend-url]/api/db-test

# Frontend
open https://[frontend-url]
```

---

## 📚 Additional Documentation

- `RAILWAY_DEPLOY.md` - Complete Railway deployment guide
- `CHECK_DATA_STRUCTURE.md` - Database structure reference
- `DATABASE_FUNCTIONS.md` - SQL functions documentation
- `CHAT_AGENT_README.md` - AI chat agent details

---

## 💰 Costs

**Development:** Free (local)  
**Production (Railway):** $5-15/month
- Backend: ~$3-8/month (24/7)
- Frontend: ~$2-5/month (static)

---

## 🆘 Support

**Common issues:**
- CORS errors → Add FRONTEND_URL to backend
- Database timeout → Use `:6543` pooler port
- Chat not working → Check ANTHROPIC_API_KEY

**Full troubleshooting:** See `RAILWAY_DEPLOY.md`

---

## 📄 License

MIT
