# Fixed: Get Products Filtered By Countries (No Duplicates)

Replace the `get_products_by_countries` function with this corrected version:

```sql
CREATE OR REPLACE FUNCTION get_products_by_countries(
  country_codes TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  product_code VARCHAR,
  description TEXT,
  category VARCHAR
) 
LANGUAGE sql
AS $function$
  SELECT 
    p.hs_code as product_code,
    p.description,
    COALESCE(p.category, 'Uncategorized') as category
  FROM products p
  WHERE p.hs_code IN (
    SELECT DISTINCT t.product_code 
    FROM trade_data t
    WHERE country_codes IS NULL OR t.partner_country = ANY(country_codes)
  )
  GROUP BY p.hs_code, p.description, p.category
  ORDER BY p.category, p.description
  LIMIT 1000;
$function$;
```

The key change is using `GROUP BY` instead of `DISTINCT ON` to ensure we get unique products.
