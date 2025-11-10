# Israel Trade

Interactive visualizations and AI-powered insights for exploring Israeli import/export trade data (2023-2025).

## 🎯 What This App Does

Ask questions about Israeli trade data in natural language and get instant answers:
- "Where do our tomatoes come from?"
- "What are our top 5 import partners in 2024?"
- "How much did we export in 2024?"
- "Compare our exports to the US versus Germany"

The app uses Claude AI to understand your questions, query the PostgreSQL database, and provide clear, data-driven answers.

---

## 🏗️ Architecture

**Simple 2-tier architecture:**

```
┌─────────────────────────────────────────┐
│  Frontend (Vue 3 + TailwindCSS)        │
│  • Single chat interface                │
│  • Sends questions to backend           │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTP POST /api/chat
                  │
┌─────────────────▼───────────────────────┐
│  Backend (Express + Claude AI)          │
│  • Receives questions                    │
│  • Claude generates SQL queries          │
│  • Executes queries on PostgreSQL        │
│  • Returns natural language answers      │
└─────────────────┬───────────────────────┘
                  │
                  │ SQL queries
                  │
┌─────────────────▼───────────────────────┐
│  Database (Supabase PostgreSQL)         │
│  • trade_data: ~1.5M rows               │
│  • products: HS code descriptions        │
│  • countries: Country metadata           │
└─────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
trade-app/
├── src/                           # Vue 3 frontend
│   ├── views/
│   │   └── ChatPage.vue          # Main chat interface
│   ├── composables/
│   │   └── useChatQuery.js       # Backend API integration
│   ├── router/
│   │   └── index.ts              # Vue Router config
│   ├── App.vue                   # App shell
│   └── main.ts                   # Entry point
│
├── backend/                       # Express API server
│   ├── server.js                 # Claude AI + PostgreSQL
│   └── package.json              # Backend dependencies
│
├── public/                        # Static assets
├── .env.example                  # Environment template
├── package.json                  # Frontend dependencies
└── README.md                     # This file
```

**That's it!** Clean and focused architecture.

---

## 💻 Local Development

### 1. Prerequisites

- Node.js 18+ and npm
- Git
- Anthropic API key (get from [console.anthropic.com](https://console.anthropic.com))
- Supabase database (or any PostgreSQL database)

### 2. Clone & Install

```bash
git clone <your-repo>
cd trade-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Configure Environment

**Frontend `.env`:**
```bash
VITE_API_URL=http://localhost:3001
```

**Backend `backend/.env`:**
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres

# Optional
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
→ Backend runs on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
npm run dev
```
→ Frontend runs on http://localhost:5173

**Open your browser:** http://localhost:5173

---

## 🗄️ Database Schema

The backend queries three main tables:

### trade_data
Main trade transactions table (~1.5 million rows):
```sql
- reporting_country: VARCHAR (always 'IL' for Israel)
- flow: INTEGER (1 = Import, 2 = Export)
- year: INTEGER (2023-2025)
- period: INTEGER (month 1-12)
- partner_country: VARCHAR (ISO alpha-2 code: 'US', 'DE', 'TR', etc.)
- product_code: VARCHAR (10-digit HS code)
- value: NUMERIC (trade value in USD)
```

### products
HS code descriptions:
```sql
- hs_code: VARCHAR(20) PRIMARY KEY
- description: TEXT (human-readable product name)
- category: VARCHAR(100)
```

### countries
Country metadata:
```sql
- code: VARCHAR(10) PRIMARY KEY (ISO alpha-2)
- name: VARCHAR(100) (full country name)
- region: VARCHAR(50)
```

**Important notes:**
- Flow 1 = goods Israel **imports** (buys from other countries)
- Flow 2 = goods Israel **exports** (sells to other countries)
- All monetary values are in USD
- Date range: January 2023 - October 2025

---

## 🚀 Deployment

### Deploy to Railway (Recommended)

**1. Install Railway CLI:**
```bash
npm i -g @railway/cli
railway login
```

**2. Create project:**
```bash
railway init
```

**3. Deploy backend:**
```bash
cd backend
railway up
```

**4. Set backend environment variables in Railway dashboard:**
- `ANTHROPIC_API_KEY`
- `DATABASE_URL` 
- `FRONTEND_URL` (set after frontend deployed)
- `NODE_ENV=production`

**5. Deploy frontend:**
```bash
cd ..
railway up
```

**6. Set frontend environment variable:**
- `VITE_API_URL` = your backend Railway URL

**Estimated cost:** $5-15/month

### Other Platforms

The app can deploy to any platform supporting Node.js:
- **Vercel:** Frontend + Backend (serverless)
- **Netlify:** Frontend + Netlify Functions (backend)
- **Heroku:** Both frontend and backend
- **DigitalOcean App Platform:** Both tiers

---

## 🧪 Testing

### Health Checks

```bash
# Backend health
curl http://localhost:3001/health

# Database connection
curl http://localhost:3001/api/db-test

# Frontend
open http://localhost:5173
```

### Test Chat Queries

Try these questions in the chat interface:
- "How many trading partners does Israel have?"
- "What are the top 10 products we import?"
- "Show me our imports from Turkey in 2024"
- "Which countries do we export electronics to?"

---

## 📜 Available Scripts

### Frontend
```bash
npm run dev          # Start dev server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend
```bash
npm start            # Start production server
npm run dev          # Start with auto-reload (nodemon)
```

---

## 🔧 Tech Stack

**Frontend:**
- Vue 3 (Composition API)
- TypeScript
- TailwindCSS
- Vite

**Backend:**
- Express.js
- Claude AI (Anthropic SDK)
- node-postgres (pg)

**Database:**
- PostgreSQL (Supabase)

**Deployment:**
- Railway (recommended)

---

## 🤖 How the AI Works

1. **User asks a question** in natural language
2. **Frontend sends** question to backend `/api/chat` endpoint
3. **Backend sends** question to Claude with database schema context
4. **Claude generates** appropriate SQL queries
5. **Backend executes** queries against PostgreSQL
6. **Backend returns** results to Claude
7. **Claude formulates** natural language answer
8. **Frontend displays** answer to user

Claude can make multiple database queries for complex questions (up to 8 iterations).

---

## ⚠️ Important Notes

### Query Safety
- Only `SELECT` queries allowed (read-only)
- Dangerous keywords blocked (`DROP`, `DELETE`, `UPDATE`, etc.)
- Query timeout: 30 seconds
- Results limited to 100 rows per query

### Database Connection
- Use Supabase pooler port (`:6543`) for connection pooling
- Connection timeout: 10 seconds
- Idle timeout: 30 seconds

### CORS Configuration
Backend allows requests from:
- `http://localhost:5173` (local dev)
- `http://localhost:3000` (alternate local)
- Production frontend URL (set via `FRONTEND_URL` env var)

---

## 🆘 Troubleshooting

### CORS Errors
**Problem:** "Not allowed by CORS"  
**Solution:** Add your frontend URL to `FRONTEND_URL` in backend `.env`

### Database Timeouts
**Problem:** "Query execution failed: timeout"  
**Solution:** Use Supabase pooler port `:6543` instead of `:5432`

### Chat Not Working
**Problem:** Backend returns 500 error  
**Solutions:**
- Check `ANTHROPIC_API_KEY` is set correctly
- Verify API key has credits (check Anthropic console)
- Check backend logs for specific error

### Frontend Can't Connect to Backend
**Problem:** "Failed to fetch"  
**Solutions:**
- Ensure backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env`
- Verify no firewall blocking localhost:3001

---

## 💰 Cost Estimate

### Development
**Free** - runs entirely on localhost

### Production (Railway)
- Backend: $3-8/month (24/7 running)
- Frontend: $2-5/month (static hosting)
- Claude AI: Pay-per-use (~$0.003 per message)
- **Total: $5-15/month** + AI usage

### Database (Supabase)
- Free tier: Up to 500MB, 2GB bandwidth
- Pro tier: $25/month (if needed for larger datasets)

---

## 📄 License

MIT

---

## 🙋 Support

**Questions or issues?**
1. Check the troubleshooting section above
2. Review backend logs: `cd backend && npm run dev`
3. Inspect browser console for frontend errors
4. Check database connection with `/api/db-test` endpoint

**Need help with deployment?**
- Railway docs: [docs.railway.app](https://docs.railway.app)
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Claude AI docs: [docs.anthropic.com](https://docs.anthropic.com)
