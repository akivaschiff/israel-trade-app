-- SQL functions for Trade Balance Overview page
-- Run this in your Supabase SQL Editor

-- Function to get total monthly balance (all countries combined)
-- Aggregates imports and exports by month across ALL countries
CREATE OR REPLACE FUNCTION get_total_monthly_balance(
  p_start_year INTEGER,
  p_start_period INTEGER,
  p_end_year INTEGER,
  p_end_period INTEGER
)
RETURNS TABLE (
  year INTEGER,
  period INTEGER,
  import_value NUMERIC,
  export_value NUMERIC
)
LANGUAGE SQL
AS $$
  WITH monthly_totals AS (
    SELECT
      t.year,
      t.period,
      t.flow,
      SUM(t.value) as total_value
    FROM trade_data t
    WHERE
      -- Filter by date range
      (t.year * 12 + t.period) >= (p_start_year * 12 + p_start_period)
      AND (t.year * 12 + t.period) <= (p_end_year * 12 + p_end_period)
    GROUP BY t.year, t.period, t.flow
  )
  SELECT
    COALESCE(imports.year, exports.year) as year,
    COALESCE(imports.period, exports.period) as period,
    COALESCE(imports.total_value, 0) as import_value,
    COALESCE(exports.total_value, 0) as export_value
  FROM
    (SELECT year, period, total_value FROM monthly_totals WHERE flow = 1) imports
  FULL OUTER JOIN
    (SELECT year, period, total_value FROM monthly_totals WHERE flow = 2) exports
  ON imports.year = exports.year AND imports.period = exports.period
  ORDER BY year, period;
$$;

-- Function to get country-specific monthly balance
-- Aggregates imports and exports by month for a single country
CREATE OR REPLACE FUNCTION get_country_monthly_balance(
  p_country_code TEXT,
  p_start_year INTEGER,
  p_start_period INTEGER,
  p_end_year INTEGER,
  p_end_period INTEGER
)
RETURNS TABLE (
  year INTEGER,
  period INTEGER,
  import_value NUMERIC,
  export_value NUMERIC
)
LANGUAGE SQL
AS $$
  WITH monthly_totals AS (
    SELECT
      t.year,
      t.period,
      t.flow,
      SUM(t.value) as total_value
    FROM trade_data t
    WHERE
      t.partner_country = p_country_code
      AND (t.year * 12 + t.period) >= (p_start_year * 12 + p_start_period)
      AND (t.year * 12 + t.period) <= (p_end_year * 12 + p_end_period)
    GROUP BY t.year, t.period, t.flow
  )
  SELECT
    COALESCE(imports.year, exports.year) as year,
    COALESCE(imports.period, exports.period) as period,
    COALESCE(imports.total_value, 0) as import_value,
    COALESCE(exports.total_value, 0) as export_value
  FROM
    (SELECT year, period, total_value FROM monthly_totals WHERE flow = 1) imports
  FULL OUTER JOIN
    (SELECT year, period, total_value FROM monthly_totals WHERE flow = 2) exports
  ON imports.year = exports.year AND imports.period = exports.period
  ORDER BY year, period;
$$;
