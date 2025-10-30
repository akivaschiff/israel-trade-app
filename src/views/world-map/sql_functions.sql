-- SQL function for efficient country-level aggregation
-- Run this in your Supabase SQL Editor to enable fast aggregation

CREATE OR REPLACE FUNCTION get_country_totals(
  p_year INTEGER,
  p_period INTEGER,
  p_flow INTEGER
)
RETURNS TABLE (
  partner_country TEXT,
  total_value NUMERIC
) 
LANGUAGE SQL
AS $$
  SELECT 
    partner_country,
    SUM(value) as total_value
  FROM trade_data
  WHERE year = p_year 
    AND period = p_period 
    AND flow = p_flow
    AND partner_country IS NOT NULL
  GROUP BY partner_country
  ORDER BY total_value DESC;
$$;

-- This function will be automatically called by the useWorldMap composable
-- It aggregates data in the database instead of fetching thousands of rows
-- Result: Much faster queries and less data transfer
