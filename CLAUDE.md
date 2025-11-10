# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Israel Trade** - A Vue 3 application for exploring Israeli import/export trade data (2023-2025) with interactive visualizations and AI-powered chat using Claude AI.

**Key Technologies:**
- Frontend: Vue 3 (Composition API), TypeScript, TailwindCSS, Vite
- Backend: Express.js, Claude AI (Anthropic SDK), PostgreSQL
- Database: Supabase PostgreSQL (~1.5M trade records)
- Charts: ECharts via vue-echarts

## Development Commands

### Frontend
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint with auto-fix
npm run preview      # Preview production build locally
```

### Backend
```bash
cd backend
npm run dev          # Start with auto-reload (http://localhost:3001)
npm start            # Start production server
```

### Running Both Servers
Development requires both servers running:
1. Terminal 1: `cd backend && npm run dev`
2. Terminal 2: `npm run dev`

## Architecture

### Two-Tier Architecture
1. **Frontend (Vue 3 SPA)**: Multi-page dashboard with chat, visualizations, and data exploration
2. **Backend (Express API)**: Claude AI integration + PostgreSQL query execution

### Data Flow Modes

The application has two distinct data access patterns:

1. **AI Chat Mode** (ChatPage.vue):
   - User asks questions in natural language
   - Frontend → Backend `/api/chat` → Claude AI generates SQL → PostgreSQL
   - Backend executes queries (read-only, up to 8 iterations)
   - Returns natural language answers

2. **Direct Visualization Mode** (Other pages):
   - Frontend queries Supabase directly via `@supabase/supabase-js`
   - Pre-cached static data files in `/public/data/` (countries.json, hs_codes.json, etc.)
   - No backend involvement for performance

### Key Components

**Views** (`src/views/`):
- `WorldMapPage.vue` - Geographic visualization of trade partners (default home page)
- `ProductOriginPage.vue` - Product-specific import/export origins
- `TrendsPage.vue` - Time-series analysis and trends
- `HSCodeLookupPage.vue` - HS code search and exploration
- `ChatPage.vue` - AI-powered natural language chat interface
- `DashboardLayout.vue` - Main layout with navigation

**Composables** (`src/composables/`):
- `useChatQuery.js` - Backend API integration for AI chat
- `useConversations.js` - LocalStorage-based conversation management
- `useProductOrigin.js` - Direct Supabase queries for product origins
- `useHSCodeLookup.js` - HS code search functionality

**Utilities** (`src/lib/`):
- `supabase.js` - Supabase client initialization
- `tradeConstants.js` - Shared color scheme and flow type constants

### Important Constants

**Flow Types** (defined in `src/lib/tradeConstants.js`):
- Flow 1 = IMPORTS (Israel buying from other countries) - Blue color scheme
- Flow 2 = EXPORTS (Israel selling to other countries) - Orange color scheme

**Non-standard convention**: Typically UN Comtrade uses flow=1 for exports, but this database uses flow=1 for imports.

### Database Schema

Three main tables in PostgreSQL:

**trade_data** (~1.5M rows):
- `reporting_country` VARCHAR (always 'IL')
- `flow` INTEGER (1=Import, 2=Export)
- `year` INTEGER (2023-2025)
- `period` INTEGER (month 1-12)
- `partner_country` VARCHAR (ISO alpha-2: 'US', 'DE', 'TR')
- `product_code` VARCHAR (10-digit HS code)
- `value` NUMERIC (USD)

**products**:
- `hs_code` VARCHAR(20) PRIMARY KEY
- `description` TEXT
- `category` VARCHAR(100)

**countries**:
- `code` VARCHAR(10) PRIMARY KEY (ISO alpha-2)
- `name` VARCHAR(100)
- `region` VARCHAR(50)

## Environment Configuration

**Frontend `.env`:**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:3001  # Backend URL
```

**Backend `backend/.env`:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.com:6543/postgres
PORT=3001
NODE_ENV=development
```

**Important**: Use Supabase Transaction mode pooler (port 6543) for DATABASE_URL, not direct connection (5432).

## Code Conventions

### Color Consistency
Always use colors from `src/lib/tradeConstants.js`:
- Imports: Blue (`TRADE_COLORS.IMPORTS.primary` = '#3b82f6')
- Exports: Orange (`TRADE_COLORS.EXPORTS.primary` = '#f97316')
- Use helper functions: `getFlowColor()`, `getFlowGradient()`, `getFlowLabel()`

### Component Patterns
- Use Vue 3 Composition API (not Options API)
- TypeScript for `.ts` files, JavaScript for Vue composables
- Reactive state with `ref()` and `computed()`
- Import path alias: `@/` points to `src/`

### Conversation Management
Chat conversations are stored in browser localStorage:
- Multiple conversations supported
- Auto-generated titles from first user message
- Managed via `useConversations` composable
- Conversation IDs in URL: `/chat/:conversationId`

## Important Notes

### Backend Query Safety
The backend (`backend/server.js`) enforces strict read-only access:
- Only SELECT queries allowed
- Blocks: DROP, DELETE, UPDATE, INSERT, ALTER, CREATE, GRANT, REVOKE
- 30-second query timeout
- Results limited to 100 rows per query
- Up to 8 Claude AI query iterations per chat message

### CORS Configuration
Backend allows requests from:
- `http://localhost:5173` (local dev)
- `http://localhost:3000` (alternate)
- Production frontend URL (via `FRONTEND_URL` env var)

### Performance Considerations
- Static data files cached in `/public/data/` for faster page loads
- Direct Supabase queries bypass backend for visualization pages
- Backend only used for AI chat feature

## Deployment

The app deploys to Railway (or any Node.js platform):

**Frontend**: Static build served via `serve` package
**Backend**: Express server with Claude AI integration

See `railway.json` for deployment configuration.

## Testing the Application

### Health Checks
```bash
curl http://localhost:3001/health          # Backend health
curl http://localhost:3001/api/db-test     # Database connection
```

### Sample Chat Queries
- "How many trading partners does Israel have?"
- "What are the top 10 products we import?"
- "Show me our imports from Turkey in 2024"
- "Which countries do we export electronics to?"

## Node Version
Requires Node.js 20.19.0+ or 22.12.0+
