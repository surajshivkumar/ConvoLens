CREATE OR REPLACE FUNCTION get_daily_sentiment_pct()
RETURNS TABLE (
    date_id DATE,
    positive_pct NUMERIC,
    negative_pct NUMERIC
)
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.date_id, 
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END)::NUMERIC * 100.0 / COUNT(*) AS positive_pct,
        SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END)::NUMERIC * 100.0 / COUNT(*) AS negative_pct
    FROM fact_calls f
    GROUP BY f.date_id
    ORDER BY f.date_id;
END;
$$ LANGUAGE plpgsql;
