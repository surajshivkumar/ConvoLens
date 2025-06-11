CREATE OR REPLACE FUNCTION search_similar_calls(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    call_id UUID,
    agent_id TEXT,
    transcript TEXT,
    summary TEXT,
    sentiment TEXT,
    issue_type TEXT,
    call_timestamp TIMESTAMPTZ,
    similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        fc.call_id,
        fc.agent_id,
        fc.transcript,
        fc.summary,
        fc.sentiment,
        fc.issue_type,
        fc.call_timestamp,
        1 - (fc.embedding <=> query_embedding) AS similarity
    FROM fact_calls fc
    WHERE fc.embedding IS NOT NULL
        AND 1 - (fc.embedding <=> query_embedding) > match_threshold
    ORDER BY fc.embedding <=> query_embedding
    LIMIT match_count;
$$;


CREATE INDEX IF NOT EXISTS idx_fact_calls_embedding 
ON fact_calls USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

