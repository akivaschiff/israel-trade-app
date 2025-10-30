# Trends View - Product Trends Over Time

## Overview
This view allows users to explore trade trends over time by:
- Selecting products using the hierarchical category system (Category → Chapter → Products)
- Comparing multiple countries side-by-side
- Filtering by time range (with automatic detection of available data)
- Viewing interactive line charts with zoom/pan capabilities

## Database Functions Required

You need to run the SQL functions in `sql_functions.sql` in your Supabase SQL editor. These functions are:

### 1. `get_product_trends`
Retrieves aggregated trade data for specific products and countries over time.

**Parameters:**
- `p_product_codes`: Array of HS product codes
- `p_country_codes`: Array of country codes  
- `p_flow`: Trade flow (1 for imports, 2 for exports)
- `p_start_year`, `p_start_period`: Optional start date
- `p_end_year`, `p_end_period`: Optional end date

**Returns:** Table with partner_country, year, period, total_value

### 2. `get_product_time_range`
Gets the available time range for selected products and countries.

**Parameters:**
- `p_product_codes`: Array of HS product codes
- `p_country_codes`: Array of country codes
- `p_flow`: Trade flow (1 for imports, 2 for exports)

**Returns:** min_year, min_period, max_year, max_period

### 3. `get_chapter_products`
Retrieves all products in a specific HS chapter.

**Parameters:**
- `p_chapter_code`: Two-digit chapter code (e.g., '84')

**Returns:** Table with hs_code, description, hs_heading

### 4. `get_heading_products`
Retrieves all products in a specific HS heading.

**Parameters:**
- `p_heading_code`: Four-digit heading code (e.g., '8401')

**Returns:** Table with hs_code, description

## Installation Steps

1. **Run SQL Functions:**
   ```bash
   # Copy the contents of sql_functions.sql
   # Paste into Supabase SQL Editor
   # Execute the script
   ```

2. **The view is automatically available** at `/trends` route

## Features

### Product Selection
- **Hierarchical browsing**: Start with category (e.g., "Machinery & Electronics")
- **Chapter selection**: Choose specific chapter (e.g., "Nuclear reactors, machinery")
- **Multi-select products**: Select multiple products to aggregate their data
- **Checkbox interface**: Easy selection with product codes and descriptions

### Country Comparison
- **Multi-select**: Compare up to 10 countries simultaneously
- **Color-coded lines**: Each country gets a distinct color
- **Alphabetically sorted**: Easy to find countries in the list

### Time Range Controls
- **Auto-detection**: Automatically finds available date range for selected products/countries
- **Custom range**: Set specific start and end dates
- **Reset button**: Quickly return to full available range
- **Visual feedback**: Shows available range below inputs

### Interactive Chart
- **Smooth lines**: ECharts line chart with smooth curves
- **Hover tooltips**: See exact values on hover
- **Zoom/Pan**: Slider and mouse controls for exploring data
- **Responsive legend**: Scrollable when many countries selected
- **Formatted values**: Automatic K/M/B formatting

## UI Layout

```
┌─────────────────────────────────────┐
│ Header: "Product Trends Over Time"  │
├─────────────────────────────────────┤
│ Controls Panel (white card):        │
│                                      │
│ • Flow Toggle (Exports/Imports)     │
│ • Product Selection                 │
│   - Category dropdown               │
│   - Chapter dropdown                │
│   - Product checkboxes              │
│ • Country Selection (checkboxes)    │
│ • Time Range (from/to inputs)       │
│ • [Show Trends] Button              │
├─────────────────────────────────────┤
│ Chart Panel (white card):           │
│                                      │
│ [Interactive Line Chart]            │
│ [Zoom Slider]                       │
└─────────────────────────────────────┘
```

## Data Flow

1. User selects category → chapters load
2. User selects chapter → products load
3. User selects products + countries → time range auto-fetches
4. User clicks "Show Trends" → data fetches and chart displays
5. User can adjust time range → refetch with new parameters

## Performance Notes

- Server-side aggregation via SQL functions for fast queries
- Products loaded per-chapter to avoid overwhelming UI
- Time range pre-calculated to guide user selection
- Chart updates smoothly with ECharts animations

## Future Enhancements

Potential improvements:
- Save/load favorite product-country combinations
- Export chart as image or data as CSV
- Add year-over-year comparison mode
- Add statistical analysis (growth rate, volatility)
- Add forecasting based on historical trends
