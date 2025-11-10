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

-- Function to get available months efficiently (no row scanning!)
CREATE OR REPLACE FUNCTION get_available_months(max_months INTEGER DEFAULT 12)
RETURNS TABLE (
  year INTEGER,
  period INTEGER
) 
LANGUAGE SQL
AS $$
  SELECT DISTINCT year, period
  FROM trade_data
  ORDER BY year DESC, period DESC
  LIMIT max_months;
$$;

-- This function will be automatically called by the useWorldMap composable
-- It aggregates data in the database instead of fetching thousands of rows
-- Result: Much faster queries and less data transfer

-- Function to get country monthly totals (time series)
-- Drop existing function first if it has a different signature
DROP FUNCTION IF EXISTS get_country_monthly_totals(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION get_country_monthly_totals(
  p_country_code TEXT,
  p_flow INTEGER
)
RETURNS TABLE (
  year INTEGER,
  period INTEGER,
  total_value NUMERIC
)
LANGUAGE SQL
AS $$
  SELECT
    year,
    period,
    SUM(value) as total_value
  FROM trade_data
  WHERE partner_country = p_country_code
    AND flow = p_flow
  GROUP BY year, period
  ORDER BY year ASC, period ASC;
$$;

-- Function to get country chapter-level monthly data
-- Drop existing function first if it has a different signature
DROP FUNCTION IF EXISTS get_country_chapter_monthly(TEXT, INTEGER);

CREATE OR REPLACE FUNCTION get_country_chapter_monthly(
  p_country_code TEXT,
  p_flow INTEGER
)
RETURNS TABLE (
  year INTEGER,
  period INTEGER,
  chapter_code TEXT,
  total_value NUMERIC
)
LANGUAGE SQL
AS $$
  SELECT
    year,
    period,
    LEFT(product_code, 2) as chapter_code,
    SUM(value) as total_value
  FROM trade_data
  WHERE partner_country = p_country_code
    AND flow = p_flow
    AND product_code IS NOT NULL
  GROUP BY year, period, LEFT(product_code, 2)
  ORDER BY year ASC, period ASC, chapter_code ASC;
$$;

-- NEW: Function to get country heading-level monthly data (4-digit HS codes)
CREATE OR REPLACE FUNCTION get_country_heading_monthly(
  p_country_code TEXT,
  p_flow INTEGER,
  p_chapter_code TEXT DEFAULT NULL
)
RETURNS TABLE (
  year INTEGER,
  period INTEGER,
  chapter_code TEXT,
  heading_code TEXT,
  total_value NUMERIC
)
LANGUAGE SQL
AS $$
  SELECT
    year,
    period,
    LEFT(product_code, 2) as chapter_code,
    LEFT(product_code, 4) as heading_code,
    SUM(value) as total_value
  FROM trade_data
  WHERE partner_country = p_country_code
    AND flow = p_flow
    AND product_code IS NOT NULL
    AND (p_chapter_code IS NULL OR LEFT(product_code, 2) = p_chapter_code)
  GROUP BY year, period, LEFT(product_code, 2), LEFT(product_code, 4)
  ORDER BY year ASC, period ASC, heading_code ASC;
$$;
