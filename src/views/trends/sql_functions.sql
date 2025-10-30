-- Function to get product trends over time for multiple countries
-- This aggregates trade data for specific products and countries across time periods
CREATE OR REPLACE FUNCTION get_product_trends(
    p_product_codes TEXT[],
    p_country_codes TEXT[],
    p_flow INTEGER,
    p_start_year INTEGER DEFAULT NULL,
    p_start_period INTEGER DEFAULT NULL,
    p_end_year INTEGER DEFAULT NULL,
    p_end_period INTEGER DEFAULT NULL
)
RETURNS TABLE (
    partner_country VARCHAR,
    year INTEGER,
    period INTEGER,
    total_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        td.partner_country,
        td.year,
        td.period,
        SUM(td.value) as total_value
    FROM trade_data td
    WHERE 
        td.product_code = ANY(p_product_codes)
        AND td.partner_country = ANY(p_country_codes)
        AND td.flow = p_flow
        -- Optional date range filtering
        AND (p_start_year IS NULL OR 
             (td.year > p_start_year OR 
              (td.year = p_start_year AND td.period >= p_start_period)))
        AND (p_end_year IS NULL OR 
             (td.year < p_end_year OR 
              (td.year = p_end_year AND td.period <= p_end_period)))
    GROUP BY td.partner_country, td.year, td.period
    ORDER BY td.partner_country, td.year, td.period;
END;
$$ LANGUAGE plpgsql;

-- Function to get available time range for a product/country combination
CREATE OR REPLACE FUNCTION get_product_time_range(
    p_product_codes TEXT[],
    p_country_codes TEXT[],
    p_flow INTEGER
)
RETURNS TABLE (
    min_year INTEGER,
    min_period INTEGER,
    max_year INTEGER,
    max_period INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH time_bounds AS (
        SELECT 
            MIN(td.year) as min_y,
            MAX(td.year) as max_y
        FROM trade_data td
        WHERE 
            td.product_code = ANY(p_product_codes)
            AND td.partner_country = ANY(p_country_codes)
            AND td.flow = p_flow
    )
    SELECT 
        tb.min_y as min_year,
        MIN(td.period) as min_period,
        tb.max_y as max_year,
        MAX(td.period) as max_period
    FROM trade_data td, time_bounds tb
    WHERE 
        td.product_code = ANY(p_product_codes)
        AND td.partner_country = ANY(p_country_codes)
        AND td.flow = p_flow
        AND (td.year = tb.min_y OR td.year = tb.max_y)
    GROUP BY tb.min_y, tb.max_y;
END;
$$ LANGUAGE plpgsql;

-- Function to get all products in a chapter for easier selection
CREATE OR REPLACE FUNCTION get_chapter_products(
    p_chapter_code TEXT
)
RETURNS TABLE (
    hs_code VARCHAR,
    description TEXT,
    hs_heading VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.hs_code,
        p.description,
        p.hs_heading
    FROM products p
    WHERE p.hs_chapter = p_chapter_code
    ORDER BY p.hs_code;
END;
$$ LANGUAGE plpgsql;

-- Function to get all products in a heading for easier selection
CREATE OR REPLACE FUNCTION get_heading_products(
    p_heading_code TEXT
)
RETURNS TABLE (
    hs_code VARCHAR,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.hs_code,
        p.description
    FROM products p
    WHERE p.hs_heading = p_heading_code
    ORDER BY p.hs_code;
END;
$$ LANGUAGE plpgsql;
