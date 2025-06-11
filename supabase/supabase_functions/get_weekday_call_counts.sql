CREATE OR REPLACE FUNCTION get_weekday_call_counts()
RETURNS TABLE (
    weekday TEXT,
    call_count BIGINT
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dim_date.weekday, 
        COUNT(*) AS call_count
    FROM fact_calls 
    JOIN dim_date ON fact_calls.date_id = dim_date.date_id
    GROUP BY dim_date.weekday
    ORDER BY MAX(dim_date.day_number);
END;
$$ LANGUAGE plpgsql;