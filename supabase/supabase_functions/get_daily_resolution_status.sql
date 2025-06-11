CREATE OR REPLACE FUNCTION get_daily_resolution_status()
RETURNS TABLE (
    date_id DATE,
    resolved BIGINT,
    unresolved BIGINT
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.date_id, 
        SUM(CASE WHEN f.resolved = true THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN f.resolved = false THEN 1 ELSE 0 END) AS unresolved
    FROM fact_calls f
    GROUP BY f.date_id
    ORDER BY f.date_id;
END;
$$ LANGUAGE plpgsql;