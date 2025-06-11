CREATE OR REPLACE FUNCTION get_issue_distribution()
RETURNS TABLE (
    issue_type TEXT,
    issue_dist NUMERIC
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.issue_type, 
        100.0 * COUNT(*) / SUM(COUNT(*)) OVER () AS issue_dist
    FROM fact_calls f
    GROUP BY f.issue_type;
END;
$$ LANGUAGE plpgsql;