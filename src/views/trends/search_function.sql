-- Function to search products and their hierarchies
CREATE OR REPLACE FUNCTION search_products(
    p_search_term TEXT
)
RETURNS TABLE (
    hs_code VARCHAR,
    description TEXT,
    hs_chapter VARCHAR,
    hs_heading VARCHAR,
    category VARCHAR,
    match_type TEXT,
    sort_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        p.hs_code,
        p.description,
        p.hs_chapter,
        p.hs_heading,
        p.category,
        CASE 
            WHEN LOWER(p.description) LIKE '%' || LOWER(p_search_term) || '%' THEN 'product'
            WHEN LOWER(p.category) LIKE '%' || LOWER(p_search_term) || '%' THEN 'category'
            ELSE 'chapter'
        END as match_type,
        CASE 
            WHEN LOWER(p.description) LIKE '%' || LOWER(p_search_term) || '%' THEN 1
            WHEN LOWER(p.category) LIKE '%' || LOWER(p_search_term) || '%' THEN 2
            ELSE 3
        END as sort_order
    FROM products p
    WHERE 
        LOWER(p.description) LIKE '%' || LOWER(p_search_term) || '%'
        OR LOWER(p.category) LIKE '%' || LOWER(p_search_term) || '%'
        OR p.hs_code LIKE '%' || p_search_term || '%'
    ORDER BY sort_order, p.hs_code;
END;
$$ LANGUAGE plpgsql;

-- Function to get countries that have traded specific products in the last year
CREATE OR REPLACE FUNCTION get_countries_with_products(
    p_product_codes TEXT[],
    p_flow INTEGER
)
RETURNS TABLE (
    partner_country VARCHAR,
    latest_year INTEGER,
    latest_period INTEGER,
    total_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_date AS (
        SELECT 
            MAX(year) as max_year
        FROM trade_data
        WHERE product_code = ANY(p_product_codes)
            AND flow = p_flow
    ),
    one_year_ago AS (
        SELECT 
            CASE 
                WHEN ld.max_year IS NULL THEN NULL
                ELSE ld.max_year - 1
            END as cutoff_year
        FROM latest_date ld
    )
    SELECT DISTINCT
        td.partner_country,
        MAX(td.year) as latest_year,
        MAX(td.period) as latest_period,
        SUM(td.value) as total_value
    FROM trade_data td, one_year_ago oya
    WHERE 
        td.product_code = ANY(p_product_codes)
        AND td.flow = p_flow
        AND td.year >= COALESCE(oya.cutoff_year, 0)
        AND td.partner_country IS NOT NULL
    GROUP BY td.partner_country
    ORDER BY total_value DESC;
END;
$$ LANGUAGE plpgsql;
