# CORRECTED Database Functions for Product Origin View

**IMPORTANT: In your data, flow = 1 means IMPORTS (not exports)**

Run these SQL queries in your Supabase SQL Editor:

## 1. Get Product List for Dropdown (CORRECTED)
```sql
CREATE OR REPLACE FUNCTION get_products_for_origin()
RETURNS TABLE (
  product_code VARCHAR,
  description TEXT,
  category VARCHAR,
  total_imports NUMERIC
) 
LANGUAGE sql
AS $function$
  SELECT 
    p.hs_code as product_code,
    p.description,
    COALESCE(p.category, 'Uncategorized') as category,
    COALESCE(SUM(t.value), 0) as total_imports
  FROM products p
  LEFT JOIN trade_data t ON p.hs_code = t.product_code AND t.flow = 1
  WHERE p.hs_code IN (SELECT DISTINCT product_code FROM trade_data WHERE flow = 1)
  GROUP BY p.hs_code, p.description, p.category
  ORDER BY total_imports DESC
  LIMIT 500;
$function$;
```

## 2. Get Geographic Data for Last Month (CORRECTED)
```sql
CREATE OR REPLACE FUNCTION get_product_origin_map(
  selected_product VARCHAR
)
RETURNS TABLE (
  country_code VARCHAR,
  country_name VARCHAR,
  total_value NUMERIC
) 
LANGUAGE sql
AS $function$
  SELECT 
    t.partner_country as country_code,
    COALESCE(c.name, t.partner_country) as country_name,
    SUM(t.value) as total_value
  FROM trade_data t
  LEFT JOIN countries c ON t.partner_country = c.code
  WHERE t.product_code = selected_product 
    AND t.flow = 1
    AND t.period = (SELECT MAX(period) FROM trade_data)
  GROUP BY t.partner_country, c.name
  ORDER BY total_value DESC;
$function$;
```

## 3. Get Time Series by Country for Product (CORRECTED)
```sql
CREATE OR REPLACE FUNCTION get_product_origin_timeseries(
  selected_product VARCHAR
)
RETURNS TABLE (
  period INTEGER,
  month_name TEXT,
  country_code VARCHAR,
  country_name VARCHAR,
  total_value NUMERIC
) 
LANGUAGE sql
AS $function$
  SELECT 
    t.period,
    TO_CHAR(TO_DATE(t.period::TEXT, 'MM'), 'Month') as month_name,
    t.partner_country as country_code,
    COALESCE(c.name, t.partner_country) as country_name,
    SUM(t.value) as total_value
  FROM trade_data t
  LEFT JOIN countries c ON t.partner_country = c.code
  WHERE t.product_code = selected_product 
    AND t.flow = 1
  GROUP BY t.period, t.partner_country, c.name
  ORDER BY t.period, total_value DESC;
$function$;
```

Run all three queries to replace the old functions with the corrected versions!
