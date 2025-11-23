# CLAUDE.md

## Commands
```bash
# Frontend (Vercel)
npm run dev          # Dev server at localhost:5173
npm run build        # Production build
npm run type-check   # TypeScript checking

# Backend (Supabase)
cd backend && npm run dev  # Dev server at localhost:3001
```

## Workflow - IMPORTANT

### Task Planning
Break every task into steps that can be verified via **Playwright MCP**:
1. Define the goal
2. Break into verifiable sub-tasks
3. Each sub-task ends with a Playwright snapshot verification
4. Commit after each verified sub-task

### Development Order
**Backend changes**: Implement logic → Test logic → Frontend integration
**Frontend-only changes**: Implement UI → Playwright snapshot → Verify design

### Git Commits
- Commit message completes: "This commit will..."
- Example: `Add country filter dropdown to trade map`
- Only commit working, verified versions
- One commit per verified sub-task

## Code Style - CRITICAL

### No Edge Case Handling
This is a small app that should always work. DO NOT:
- Add try-catch blocks
- Add null/undefined checks
- Handle edge cases defensively

When encountering an edge case: **STOP and consult me** to discuss the root cause and proper fix location.

### Data Transformations
Use lodash chain style in frontend:
```javascript
import _ from 'lodash'

const result = _.chain(data)
  .filter(item => item.value > 0)
  .groupBy('country')
  .mapValues(items => _.sumBy(items, 'value'))
  .value()
```

### Vue Patterns
- Composition API only (not Options API)
- TypeScript for `.ts`, JavaScript for composables
- Use `ref()` and `computed()` for reactive state
- Import alias: `@/` → `src/`

### Colors
Use `src/lib/tradeConstants.js`:
- Imports (flow=1): Blue `#3b82f6`
- Exports (flow=2): Orange `#f97316`

## Architecture

### Stack
- **Frontend**: Vue 3, TypeScript, TailwindCSS, Vite → Vercel
- **Backend**: Supabase PostgreSQL, Express API for Claude AI chat

### Data Flow
1. **Direct queries**: Frontend → Supabase (visualization pages)
2. **AI Chat**: Frontend → Express backend → Claude AI → PostgreSQL

### Key Files
- `src/views/` - Page components
- `src/composables/` - Reusable logic
- `src/lib/tradeConstants.js` - Colors and constants
- `backend/server.js` - Express API

### Database (flow convention is non-standard)
- `flow=1` = IMPORTS (Israel buying)
- `flow=2` = EXPORTS (Israel selling)

Tables: `trade_data`, `products`, `countries`

## Verification

After frontend changes, use Playwright MCP:
```
browser_snapshot → verify layout/content
browser_take_screenshot → verify visual design
```

After backend changes:
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/db-test
```
