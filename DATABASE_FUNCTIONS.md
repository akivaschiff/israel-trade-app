# Database Functions for Trade App

Run these SQL queries in your Supabase SQL Editor:

## Option 1: Try this syntax (without $$)

### 1. Get Overview Stats
```sql
CREATE OR REPLACE FUNCTION get_trade_overview_stats()
RETURNS TABLE (
  total_value NUMERIC,
  num_partners BIGINT,
  num_products BIGINT
) 
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(value) as total_value,
    COUNT(DISTINCT partner_country) as num_partners,
    COUNT(DISTINCT product_code) as num_products
  FROM trade_data;
END;
$function$;
```

### 2. Get Top Trading Partners
```sql
CREATE OR REPLACE FUNCTION get_top_trading_partners(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  partner_code VARCHAR,
  partner_name VARCHAR,
  total_value NUMERIC
) 
LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    t.partner_country as partner_code,
    COALESCE(c.name, t.partner_country) as partner_name,
    SUM(t.value) as total_value
  FROM trade_data t
  LEFT JOIN countries c ON t.partner_country = c.code
  GROUP BY t.partner_country, c.name
  ORDER BY total_value DESC
  LIMIT limit_count;
END;
$function$;
```

## Option 2: Simpler SQL syntax (if Option 1 doesn't work)

### 1. Get Overview Stats
```sql
CREATE OR REPLACE FUNCTION get_trade_overview_stats()
RETURNS TABLE (
  total_value NUMERIC,
  num_partners BIGINT,
  num_products BIGINT
) 
LANGUAGE sql
AS '
  SELECT 
    SUM(value) as total_value,
    COUNT(DISTINCT partner_country) as num_partners,
    COUNT(DISTINCT product_code) as num_products
  FROM trade_data;
';
```

### 2. Get Top Trading Partners
```sql
CREATE OR REPLACE FUNCTION get_top_trading_partners(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  partner_code VARCHAR,
  partner_name VARCHAR,
  total_value NUMERIC
) 
LANGUAGE sql
AS '
  SELECT 
    t.partner_country as partner_code,
    COALESCE(c.name, t.partner_country) as partner_name,
    SUM(t.value) as total_value
  FROM trade_data t
  LEFT JOIN countries c ON t.partner_country = c.code
  GROUP BY t.partner_country, c.name
  ORDER BY total_value DESC
  LIMIT limit_count;
';
```

## Try Option 1 first, then Option 2 if that fails!
