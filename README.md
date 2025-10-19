# Israel Trade Data Visualization

A Vue 3 web application for visualizing and exploring Israel's import trade data from January-April 2024. The app provides interactive dashboards to analyze trade patterns, partner countries, product categories, and geographic origins of imports.

---

## 📊 Project Overview

This application visualizes Israel's **import data** (products coming INTO Israel from other countries) across a 4-month period. It features three main dashboards accessible via tabs:

1. **Overview Dashboard** - High-level statistics and top trading partners
2. **Time Series Analysis** - Multi-country trade trends with advanced filtering
3. **Product Origins** - Geographic visualization of where specific products come from

### Key Capabilities
- Database-driven aggregations for performance with 200k+ rows
- Interactive charts with ECharts (maps, bar charts, line charts)
- Real-time filtering by countries, products, and categories
- Hierarchical product selection by category
- Responsive design with Tailwind CSS

---

## 🗄️ Database Structure

### Supabase PostgreSQL Database

**CRITICAL NOTE:** All data represents **IMPORTS to Israel**. In this dataset, `flow = 1` indicates imports (not exports). The `partner_country` field shows where Israel is importing FROM.

### Tables

#### `trade_data`
Core transaction records:
- `id` - bigint, primary key
- `reporting_country` - varchar (Israel's country code)
- `flow` - integer (1 = imports in this dataset)
- `year` - integer (2024)
- `period` - integer (month: 1-4 for Jan-Apr)
- `partner_country` - varchar (country code Israel imports from)
- `product_code` - varchar (HS code)
- `value` - numeric (USD value)
- `created_at`, `updated_at` - timestamps

#### `products`
Product information and HS code hierarchy:
- `hs_code` - varchar, primary key
- `description` - text
- `hs_chapter` - varchar(2)
- `hs_heading` - varchar(4)
- `hs_subheading` - varchar(6)
- `category` - varchar(100)
- `unit_of_measure` - varchar(50)
- `created_at`, `updated_at` - timestamps

#### `countries`
Country reference data:
- `code` - varchar(10), primary key
- `name` - varchar(100)
- `region` - varchar(50)
- `sub_region` - varchar(100)
- `iso_alpha3` - varchar(3)
- `created_at` - timestamp

### Views

#### `trade_with_products`
Convenient joined view:
```sql
SELECT 
    t.*,
    p.description as product_description,
    p.category as product_category,
    p.hs_chapter
FROM trade_data t
LEFT JOIN products p ON t.product_code = p.hs_code;
```

### Required Database Functions

All aggregation happens server-side via PostgreSQL functions. These MUST be created in Supabase:

#### Overview Dashboard Functions

**`get_trade_overview_stats()`**
Returns total value, number of partners, number of products:
```sql
RETURNS TABLE (total_value NUMERIC, num_partners BIGINT, num_products BIGINT)
```

**`get_top_trading_partners(limit_count INTEGER DEFAULT 10)`**
Returns top N countries with joined names:
```sql
RETURNS TABLE (partner_code VARCHAR, partner_name VARCHAR, total_value NUMERIC)
```

#### Time Series Functions

**`get_time_series_data(country_codes TEXT[], product_codes TEXT[])`**
Returns monthly data grouped by country (one line per country):
```sql
RETURNS TABLE (
  period INTEGER, 
  month_name TEXT, 
  partner_country VARCHAR, 
  country_name VARCHAR, 
  total_value NUMERIC
)
```

**`get_all_countries()`**
Returns all countries that appear in trade data:
```sql
RETURNS TABLE (code VARCHAR, name VARCHAR)
```

**`get_products_by_countries(country_codes TEXT[])`**
Returns products filtered by selected countries:
```sql
RETURNS TABLE (product_code VARCHAR, description TEXT, category VARCHAR)
```

**`get_product_categories(country_codes TEXT[])`**
Returns categories with product counts:
```sql
RETURNS TABLE (category VARCHAR, product_count BIGINT)
```

#### Product Origins Functions

**`get_products_for_origin()`**
Returns products sorted by total import value:
```sql
RETURNS TABLE (
  product_code VARCHAR, 
  description TEXT, 
  category VARCHAR, 
  total_imports NUMERIC
)
```

**`get_product_origin_map(selected_product VARCHAR)`**
Returns geographic data for latest month:
```sql
RETURNS TABLE (country_code VARCHAR, country_name VARCHAR, total_value NUMERIC)
```

**`get_product_origin_timeseries(selected_product VARCHAR)`**
Returns time series by country for a product:
```sql
RETURNS TABLE (
  period INTEGER, 
  month_name TEXT, 
  country_code VARCHAR, 
  country_name VARCHAR, 
  total_value NUMERIC
)
```

**Important:** All function definitions are in `DATABASE_FUNCTIONS*.md` files in the project root. They must use `flow = 1` for imports.

---

## 📁 Project Structure

```
trade-app/
├── src/
│   ├── components/
│   │   └── trade/
│   │       └── ProductSelector.vue      # Hierarchical category/product picker
│   ├── composables/
│   │   ├── useTradeOverview.js          # Overview stats & top partners
│   │   ├── useTimeSeries.js             # Filtered time series data
│   │   └── useProductOrigin.js          # Product origin map & trends
│   ├── lib/
│   │   └── supabase.js                  # Supabase client configuration
│   ├── views/
│   │   ├── OverviewPage.vue             # Tab 1: Dashboard with cards & chart
│   │   ├── TimeSeriesPage.vue           # Tab 2: Multi-line filtered trends
│   │   └── ProductOriginPage.vue        # Tab 3: Map + product origins
│   ├── App.vue                           # Root with tab navigation
│   ├── main.ts                           # App entry point
│   └── style.css                         # Tailwind imports
├── public/
├── DATABASE_FUNCTIONS*.md                # SQL function definitions
├── .env                                  # Supabase credentials (not in git)
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **Vue 3.5** - Composition API with TypeScript support
- **Vite 7** - Fast build tool and dev server
- **TailwindCSS 4** - Utility-first styling
- **TypeScript** - Type safety

### Data & Visualization
- **Supabase** - PostgreSQL database with REST API
- **@supabase/supabase-js** - Database client
- **ECharts 6** - Charts, maps, and visualizations
- **vue-echarts 8** - Vue wrapper for ECharts

### Utilities
- **date-fns** - Date manipulation
- **Pinia** - State management (minimal use)

---

## 🎨 Design System

### Color Schemes by Tab
- **Overview**: Blue/Indigo gradients (📊)
- **Time Series**: Purple/Pink gradients (📈)
- **Product Origins**: Emerald/Teal gradients (🌍)

### Visual Patterns
- Gradient cards with hover effects for summary stats
- Horizontal bar charts for rankings
- Multi-line charts for time series comparisons
- Choropleth maps for geographic data
- Rounded corners (xl), shadows, and smooth transitions throughout

### Typography & Formatting
- Currency: `$X.XXB`, `$X.XXM`, `$X.XXK` format
- Large numbers: `X.XM`, `X.XK` format (no currency)
- Headers: Bold, hierarchical sizing
- Monospace for debug/technical info

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 20+ or 22+
- Supabase account with project created
- Trade data loaded into Supabase tables

### Installation

1. **Clone and install:**
```bash
cd trade-app
npm install
```

2. **Configure environment:**
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. **Create database functions:**
Run all SQL queries from `DATABASE_FUNCTIONS*.md` files in Supabase SQL Editor. These are critical for app functionality.

4. **Run development server:**
```bash
npm run dev
```

5. **Build for production:**
```bash
npm run build
```

---

## 🎯 Feature Breakdown

### Tab 1: Overview Dashboard ✅
**Purpose:** High-level snapshot of trade activity

**Components:**
- 3 gradient stat cards (total value, partners, products)
- Horizontal bar chart of top 10 trading partners
- All data aggregated in database via `get_trade_overview_stats()` and `get_top_trading_partners()`

**Data Flow:**
1. `useTradeOverview.js` composable calls Supabase RPC functions
2. Stats calculated entirely in PostgreSQL
3. ECharts renders bar chart with gradient colors
4. Hover tooltips show formatted values

**Key Files:**
- `src/views/OverviewPage.vue`
- `src/composables/useTradeOverview.js`

---

### Tab 2: Time Series Analysis ✅
**Purpose:** Compare trade trends across countries and products over time

**Components:**
- Country multi-select dropdown
- Hierarchical product selector by category (ProductSelector component)
- Apply/Clear filter buttons
- Multi-line chart (one line per country)
- Visual filter tags

**Smart Features:**
- Products auto-filter when countries selected (via `get_products_by_countries()`)
- Category-level selection (check category = select all products in it)
- Expandable category trees with individual product checkboxes
- Product selection clears when country filter changes

**Data Flow:**
1. Load all countries with `get_all_countries()`
2. Load products (optionally filtered) with `get_products_by_countries()`
3. User selects filters
4. Click "Apply" → calls `get_time_series_data(country_codes, product_codes)`
5. Data grouped by country in composable
6. ECharts renders one line per country

**Key Files:**
- `src/views/TimeSeriesPage.vue`
- `src/components/trade/ProductSelector.vue`
- `src/composables/useTimeSeries.js`

---

### Tab 3: Product Origins ✅
**Purpose:** Visualize where specific products come from geographically

**Components:**
- Product dropdown (organized by category, sorted by import value)
- Interactive world map (zoom/pan enabled)
- Countries colored by import value (latest month only)
- Time series chart showing imports over all months by source country

**Map Implementation:**
- World GeoJSON loaded from CDN on mount
- Registered with ECharts via `registerMap('world', geoJson)`
- Visual map component shows color scale (dark green = high imports)
- Choropleth coloring based on last month's data

**Data Flow:**
1. Load products with `get_products_for_origin()` (sorted by total imports)
2. User selects product
3. Fetch map data: `get_product_origin_map(product_code)` → last month only
4. Fetch time series: `get_product_origin_timeseries(product_code)` → all months
5. Render map and line chart

**Key Files:**
- `src/views/ProductOriginPage.vue`
- `src/composables/useProductOrigin.js`

---

## 🔧 Development Patterns

### Composables Pattern
Each view has a corresponding composable that handles:
- Data fetching via Supabase RPC calls
- Loading/error state management
- Data transformation for Vue components

Example structure:
```javascript
export function useTradeOverview() {
  const loading = ref(false)
  const error = ref(null)
  const data = ref([])
  
  async function fetchData() {
    loading.value = true
    try {
      const { data, error } = await supabase.rpc('function_name')
      if (error) throw error
      // transform data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }
  
  return { loading, error, data, fetchData }
}
```

### ECharts Integration
- Components imported individually for tree-shaking
- Registered via `use()` before component use
- Options defined as `computed()` for reactivity
- Autoresize enabled for responsive behavior

### Error Handling
- All database calls wrapped in try/catch
- Errors displayed in red alert boxes
- Loading spinners during async operations
- Empty state messages when no data

---

## 🚨 Common Gotchas

### Flow Value Confusion
**CRITICAL:** In this dataset, `flow = 1` means **imports**, not exports. This is opposite of typical UN Comtrade convention. All database functions use `WHERE flow = 1`.

### World Map Loading
The world GeoJSON must be loaded from CDN and registered before map renders. Current source: `https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json` with fallback.

### Product Selector State
When country filters change in Time Series view, product selection automatically clears to prevent invalid state.

### Supabase RPC Naming
Functions must be called with `supabase.rpc('function_name', { params })` - exact name match required.

### Tailwind v4 Syntax
Uses `@import "tailwindcss";` not `@tailwind` directives. PostCSS configured with `@tailwindcss/postcss`.

### Number Formatting
- Currency values use `formatValue()` → `$X.XXB/M/K`
- Count values use `formatNumber()` → `X.XM/K`
- Keep functions consistent across views

---

## 📝 Data Notes

- **Time Period:** January - April 2024 (4 months)
- **Data Granularity:** Country × Product × Month
- **Flow Type:** All data is imports (flow = 1)
- **Country Codes:** Standard ISO codes (linked to `countries` table)
- **Product Codes:** HS (Harmonized System) codes (linked to `products` table)
- **Values:** USD amounts
- **Row Count:** ~200,000+ trade records

---

## 🔜 Future Enhancements

Possible additions for future iterations:
- **Export data integration** - Add flow = 2 exports and comparison views
- **Trade balance analysis** - Calculate surplus/deficit by country
- **Product deep-dive pages** - Click-through from charts to detailed views
- **Date range filtering** - Custom month selection beyond Jan-Apr
- **Data export** - Download filtered data as CSV
- **Saved filters** - Persist user filter preferences
- **Mobile optimization** - Enhanced touch interactions for charts

---

## 📚 Reference Documents

- `DATABASE_FUNCTIONS.md` - Overview & Time Series SQL functions
- `DATABASE_FUNCTIONS_TIMESERIES.md` - Corrected Time Series functions
- `DATABASE_FUNCTIONS_ORIGIN.md` - Product Origins SQL functions (flow = 1 corrected)
- `israel_trade_project_ref.md` - Original project requirements (if exists)

---

## 🤝 Development Tips

### Starting a New AI Conversation
This README provides complete context for AI assistants to understand:
1. Data structure (especially flow = 1 = imports)
2. Database functions and their purposes
3. Component architecture and file locations
4. Tech stack and design patterns
5. Current features and implementation details

### Adding New Features
1. Create database function first (server-side aggregation)
2. Build composable to call function and manage state
3. Create Vue component with ECharts visualization
4. Add tab to `App.vue` if needed
5. Update README with new feature documentation

### Debugging
- Check browser console for Supabase errors
- Verify database functions exist: `SELECT * FROM pg_proc WHERE proname = 'function_name'`
- Test functions directly in SQL Editor before using in app
- Use Vue DevTools to inspect reactive state
- Add temporary debug boxes to views (see ProductOriginPage example)

---

**Last Updated:** October 2025  
**Version:** 1.0  
**Status:** Production Ready
