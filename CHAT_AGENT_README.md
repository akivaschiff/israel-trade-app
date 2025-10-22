# Trade Data Chat Agent - Implementation Plan

## Overview

Build a conversational interface for exploring Israeli trade data using Claude Agent SDK with a custom MCP server for database access.

**Architecture:** Vue.js frontend → Express backend (Agent SDK + custom MCP) → Supabase PostgreSQL

---

## Tech Stack

**Backend:**
- Node.js + Express
- `@anthropic-ai/claude-agent-sdk` - Agent framework
- Custom MCP server for SQL execution
- PostgreSQL client for Supabase

**Frontend:**
- Vue 3 (existing)
- Simple chat UI
- HTTP client to backend API

---

## Database Schema

```
trade_data (reporting_country, flow, year, period, partner_country, product_code, value)
  - flow: 1=Export, 2=Import
  - period: month (1-12)
  - value: USD

products (hs_code, description, category)
  - hs_code: 10-digit harmonized system code

countries (code, name, region)
  - code: ISO alpha-2 (e.g., 'US', 'DE', 'TR')

Data range: January 2023 - October 2025
```

---

## Implementation Steps

### Phase 1: Backend Setup

**Directory structure:**
```
trade-app/
├── backend/              # NEW
│   ├── server.js        # Express server + Agent SDK
│   ├── package.json
│   └── .env
├── src/                 # Existing Vue app
└── CHAT_AGENT_README.md
```

**1.1 Initialize backend:**
```bash
mkdir backend
cd backend
npm init -y
npm install express @anthropic-ai/claude-agent-sdk pg cors dotenv
```

**1.2 Create `.env` file:**
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

**1.3 Create `backend/server.js`:**

Key components:
- Express server with CORS
- PostgreSQL connection pool to Supabase
- Custom MCP server using `createSdkMcpServer()` with SQL query tool
- `POST /api/chat` endpoint that uses Agent SDK `query()` function
- System prompt with database schema context

The MCP server provides one tool:
```javascript
tool({
  name: 'query_database',
  description: 'Execute read-only SQL queries',
  parameters: { sql: string },
  execute: async ({ sql }) => {
    // Validate SELECT only
    // Execute via pg pool
    // Return rows
  }
})
```

**1.4 Test backend:**
```bash
node server.js
# Should see: "Backend running on port 3001"

# Test with curl:
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How many rows in trade_data?"}'
```

---

### Phase 2: Frontend Integration

**2.1 Create `src/composables/useChatQuery.js`:**

Simple composable that:
- Maintains `messages` array (user/assistant turns)
- `sendMessage()` posts to backend API
- `clearChat()` resets conversation
- Returns reactive state for UI

**2.2 Create `src/views/ChatPage.vue`:**

Components:
- Message list (scrollable, user messages right/blue, assistant left/gray)
- Text input + send button
- Loading state ("Thinking...")
- Clear chat button

**2.3 Add route:**
```javascript
// src/router/index.ts
{
  path: '/chat',
  name: 'chat',
  component: () => import('@/views/ChatPage.vue')
}
```

---

### Phase 3: Testing

**3.1 Backend tests:**
```javascript
// Test 1: Simple query
POST /api/chat
{ "message": "How many countries are in the database?" }
// Should return count

// Test 2: Product search
POST /api/chat
{ "message": "Where do our tomatoes come from?" }
// Should search products for "tomato", query origins

// Test 3: Complex question
POST /api/chat
{ "message": "What are our top 5 import partners in 2024?" }
// Should join tables, aggregate, sort
```

**3.2 Frontend tests:**
- Open http://localhost:5173/chat
- Type question, verify loading state
- Check response displays
- Test follow-up questions (context maintained)
- Test error handling
- Test clear chat button

---

## Key Behaviors

**Agent SDK handles:**
- Context management across turns
- Tool calling (MCP server)
- Iterative query refinement if SQL fails
- Natural language response formatting

**Custom MCP server enforces:**
- Read-only queries (SELECT only validation)
- Connection pooling
- Error handling
- Result formatting

**Frontend provides:**
- Clean conversational UI
- Message history display
- Loading states
- Simple, focused UX

---

## Example Queries

**Simple:**
- "How many trading partners does Israel have?"
- "What products do we export most?"
- "Show me trade volume by year"

**Complex:**
- "Which countries import the most vegetables from us?"
- "Compare exports to Europe vs Asia in 2024"
- "What are the top 10 products we import from Turkey?"

**Product search:**
- "Where do our tomatoes come from?"
- "What electronics do we export to Germany?"
- "Show me all dairy imports"

---

## Security Notes

**Current approach (MVP):**
- Backend validates SELECT-only queries
- API keys stored server-side
- CORS enabled for localhost
- No authentication yet

**For production:**
- Add authentication (JWT tokens)
- Rate limiting per user
- Query timeout limits (5s max)
- Row limits (1000 max)
- Whitelist allowed operations
- Add request logging

---

## Development Workflow

**Start backend:**
```bash
cd backend
node server.js
```

**Start frontend:**
```bash
cd ..
npm run dev
```

**Access:**
- Frontend: http://localhost:5173/chat
- Backend: http://localhost:3001

---

## Debugging

**Backend logs:**
- Agent SDK outputs thinking/tool calls to console
- PostgreSQL errors logged
- HTTP request/response logged

**Frontend logs:**
- Network tab shows API requests
- Console shows any errors
- Vue DevTools for state inspection

**Common issues:**
- Database connection: Check .env DATABASE_URL
- API key: Check ANTHROPIC_API_KEY is set
- CORS: Backend must allow frontend origin
- Port conflicts: Change PORT if 3001 in use

---

## File Checklist

```
✅ backend/server.js          - Express + Agent SDK + MCP
✅ backend/.env                - Secrets (DATABASE_URL, API key)
✅ backend/package.json        - Dependencies

✅ src/composables/useChatQuery.js  - Chat state management
✅ src/views/ChatPage.vue           - Chat UI component
✅ src/router/index.ts              - Add /chat route
```

---

## Next Steps After MVP

1. Add conversation persistence (save chat history to DB)
2. Add user authentication
3. Add chart visualization for numeric results
4. Add export results (CSV, Excel)
5. Add query history/favorites
6. Deploy backend to production server
7. Add monitoring/logging (Sentry, LogRocket)
8. Add rate limiting per user

---

## Resources

- [Claude Agent SDK Docs](https://docs.claude.com/en/api/agent-sdk/overview)
- [Custom MCP Tools](https://docs.claude.com/en/api/agent-sdk/custom-tools)
- [Supabase Connection](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Express.js Guide](https://expressjs.com/en/starter/installing.html)

---

**Status:** Ready to implement  
**Estimated time:** 1-2 days for full MVP  
**Priority:** Phase 1 (backend) first, then Phase 2 (frontend)
