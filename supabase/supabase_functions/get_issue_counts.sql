CREATE OR REPLACE FUNCTION get_issue_counts()
RETURNS TABLE (
    issue_type TEXT,
    issue_count BIGINT
)
AS $$
BEGIN
    RETURN QUERY
    SELECT fact_calls.issue_type, COUNT(*) AS issue_count
    FROM fact_calls
    GROUP BY fact_calls.issue_type;
END;
$$ LANGUAGE plpgsql;
