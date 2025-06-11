CREATE OR REPLACE FUNCTION get_call_summary()
RETURNS TABLE (
    total_calls BIGINT,
    avg_duration_in_sec NUMERIC,
    avg_sentiment NUMERIC,
    frequent_sentiment NUMERIC,
    top_issue TEXT,
    issue_count BIGINT,
    busiest_agent TEXT,
    total_duration_in_sec BIGINT,
    pct_positive NUMERIC
)
AS $$
BEGIN
    RETURN QUERY
    WITH fact_data AS (
        SELECT 
            COUNT(*) AS total_calls,
            AVG(duration_seconds) AS avg_duration_in_sec,
            AVG(sentiment_score) AS avg_sentiment
        FROM fact_calls
    ),
    freq_sentiment AS (
        SELECT sentiment_score, COUNT(*) AS count
        FROM fact_calls
        GROUP BY sentiment_score
        ORDER BY count DESC
        LIMIT 1
    ),
    freq_issue AS (
        SELECT issue_type, COUNT(issue_type) AS issue_count
        FROM fact_calls
        GROUP BY issue_type
        ORDER BY COUNT(issue_type) DESC
        LIMIT 1
    ),
    busy_agents AS (
        SELECT dim_agents.name, SUM(duration_seconds) AS total_duration
        FROM fact_calls
        JOIN dim_agents ON fact_calls.agent_id = dim_agents.agent_id
        GROUP BY dim_agents.name
        ORDER BY SUM(duration_seconds) DESC
        LIMIT 1
    ),
    pct_positive AS (
        SELECT 
            100 * (
                SUM(CASE WHEN sentiment = 'positive' THEN 1.00 ELSE 0 END) - 
                SUM(CASE WHEN sentiment = 'negative' THEN 1.00 ELSE 0 END)
            ) / COUNT(*) AS pct
        FROM fact_calls
    )
    SELECT 
        f.total_calls,
        ROUND(f.avg_duration_in_sec, 2),
        ROUND(f.avg_sentiment::NUMERIC, 2),
        s.sentiment_score::numeric,
        i.issue_type,
        i.issue_count,
        a.name,
        a.total_duration,
        ROUND(p.pct::NUMERIC, 2)
    FROM fact_data f
    CROSS JOIN freq_sentiment s
    CROSS JOIN freq_issue i
    CROSS JOIN busy_agents a
    CROSS JOIN pct_positive p;
END;
$$ LANGUAGE plpgsql;
