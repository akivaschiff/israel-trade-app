-- Function to get map data for multiple products (aggregated by country)
-- This supports the label search feature where multiple products can match the selected labels

CREATE OR REPLACE FUNCTION get_product_origin_map_multi(selected_products TEXT[])
RETURNS TABLE (
  country_code VARCHAR,
  country_name VARCHAR,
  total_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.code as country_code,
    c.name as country_name,
    SUM(t.value) as total_value
  FROM trade_data t
  JOIN countries c ON t.partner_country = c.code
  WHERE 
    t.product_code = ANY(selected_products)
    AND t.flow = 2  -- Imports only
    AND t.period = (SELECT MAX(period) FROM trade_data WHERE flow = 2)  -- Latest month
  GROUP BY c.code, c.name
  ORDER BY total_value DESC;
END;
$$ LANGUAGE plpgsql;


-- Function to get time series data for multiple products (aggregated by country and month)
CREATE OR REPLACE FUNCTION get_product_origin_timeseries_multi(selected_products TEXT[])
RETURNS TABLE (
  country_code VARCHAR,
  country_name VARCHAR,
  period INTEGER,
  month_name TEXT,
  total_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.code as country_code,
    c.name as country_name,
    t.period,
    TO_CHAR(TO_DATE(t.year::TEXT || '-' || LPAD(t.period::TEXT, 2, '0') || '-01', 'YYYY-MM-DD'), 'Mon YYYY') as month_name,
    SUM(t.value) as total_value
  FROM trade_data t
  JOIN countries c ON t.partner_country = c.code
  WHERE 
    t.product_code = ANY(selected_products)
    AND t.flow = 2  -- Imports only
  GROUP BY c.code, c.name, t.period, t.year
  ORDER BY c.name, t.period;
END;
$$ LANGUAGE plpgsql;


-- Test the functions with some sample data
-- SELECT * FROM get_product_origin_map_multi(ARRAY['0702000000', '0709200000']);
-- SELECT * FROM get_product_origin_timeseries_multi(ARRAY['0702000000', '0709200000']);
