# World Map Page

Interactive world map showing trade data by country with detailed product breakdowns.

## Quick Setup

1. **Run SQL function** (important for performance):
   ```sql
   -- Copy contents from sql_functions.sql and run in Supabase SQL Editor
   ```
   This creates an aggregation function that makes queries 100x faster!

2. **Colors**: 
   - Blue = Exports
   - Orange = Imports

3. **Default view**: Exports (blue)

## Important Data Notes

⚠️ **Values in database are stored in thousands of USD**
- Database value of `1000` = $1,000,000 (one million USD)
- Database value of `201469.793` = $201,469,793 (two hundred million USD)
- All display values are automatically multiplied by 1000 for accurate representation

📊 **Linear scale with minimum threshold**
- Uses linear scale (not logarithmic) for intuitive color progression
- Minimum threshold set at $1M to clearly distinguish between:
  - Countries with no trade (gray)
  - Countries with minimal trade (lightest color)
- Countries below $1M threshold are shown as gray (no data)

## Components

### WorldMapPage.vue
Main page component with:
- **Flow toggle**: Switch between Exports (blue) and Imports (orange)
- **Month selector**: Dropdown to select any of the last 12 months
- **Interactive map**: Click countries to see details
- **Logarithmic color scale**: Better visualization of wide value ranges
- **Actual values in tooltips**: Shows real dollar amounts (not log values)

### CountryDetailPanel.vue
Slide-in panel from the right showing:
- **Country header**: Name, total trade value, month
- **Top 5 Chapters chart**: Donut chart of main categories
- **Product tree view**: Collapsible hierarchy
  - Chapter (2-digit HS codes)
    - Heading (4-digit HS codes)
      - Individual Products (6-digit HS codes)

### useWorldMap.js
Composable handling all data fetching:
- `loadCountries()`: Load static countries from /data/countries.json
- `fetchAvailableMonths()`: Get last 12 months from database
- `fetchCountryTotals(year, period, flow)`: Get trade totals per country with SQL aggregation
- `fetchCountryDetails(countryCode, year, period, flow)`: Get product breakdown

## Data Flow

1. **Page loads** → Load countries.json → Fetch available months → Default to latest month + exports
2. **User toggles flow** → Re-fetch country totals with new flow
3. **User changes month** → Re-fetch country totals with new month  
4. **User clicks country** → Fetch detailed product breakdown → Show panel

## Performance Optimizations

- ✅ **SQL Aggregation**: Uses database-side GROUP BY instead of fetching all rows
- ✅ **Static countries file**: Loads from /data/countries.json instead of querying DB
- ✅ **Logarithmic scale**: Better color distribution across value ranges
- ✅ **Batched queries**: Falls back to client-side aggregation if SQL function not available

## Key Features

- ✅ Uses /data/countries.json for country names (no DB query needed)
- ✅ Orange/blue color scheme (imports/exports)
- ✅ SQL aggregation for fast performance
- ✅ **Linear color scale** with $1M minimum threshold for better distinction
- ✅ **Correct value display** (database values multiplied by 1000)
- ✅ Actual values in tooltips showing proper millions/billions
- ✅ Tree view with collapsible chapters/headings/products
- ✅ Donut chart showing top 5 HS chapters
- ✅ Smooth slide-in animation for detail panel
- ✅ Hover tooltips on map with actual trade values

## Navigation

Access via: `/world-map` tab in the main navigation

## Troubleshooting

**Slow queries?** → Run the SQL function from `sql_functions.sql` in Supabase

**Countries not showing?** → Check that countries.json loaded properly (check console)

**Wrong values?** → Verify flow parameter (1=exports, 2=imports)
