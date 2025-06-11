create or replace function match_calls(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  call_id uuid,
  transcript text,
  similarity float
)
language sql
as $$
  select
    call_id,
    transcript,
    1 - (embedding <=> query_embedding) as similarity
  from fact_calls
  where embedding <=> query_embedding < match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
