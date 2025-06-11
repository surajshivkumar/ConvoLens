CREATE OR REPLACE FUNCTION get_call_center_metrics()
RETURNS TABLE (
    total_conversations BIGINT,
    latest_agent_count BIGINT,
    avg_handle_time NUMERIC,
    avg_sentiment_score NUMERIC
)
AS $$
BEGIN
    RETURN QUERY
    WITH fact_metrics AS (
        SELECT 
            COUNT(*) AS total_conversations,
            AVG(duration_seconds) AS avg_handle_time,
            AVG(sentiment_score) AS avg_sentiment_score
        FROM fact_calls
    ),
    latest_date AS (
        SELECT MAX(date_id) AS id FROM fact_calls
    ),
    last_active_agents AS (
        SELECT COUNT(*) AS latest_agent_count
        FROM fact_calls 
        CROSS JOIN latest_date
        WHERE fact_calls.date_id = latest_date.id
    )
    SELECT
        f.total_conversations,
        l.latest_agent_count,
        ROUND(f.avg_handle_time, 2),
        ROUND(f.avg_sentiment_score::DECIMAL, 2)
    FROM fact_metrics f
    CROSS JOIN last_active_agents l;
END;
$$ LANGUAGE plpgsql;