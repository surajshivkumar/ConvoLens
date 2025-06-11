-- Enable vector support
create extension if not exists vector;

-- DIMENSION: Agents
create table if not exists dim_agents (
  agent_id text primary key,
  name text,
  email text
);

-- DIMENSION: Customers
create table if not exists dim_customers (
  customer_id text primary key,
  name text,
  email text,
  phone text
);


create table if not exists dim_date (
  date_id date primary key,
  day int,
  month int,
  year int,
  weekday text,
  week int,
  day_number int
);

-- Fact: Calls
CREATE TABLE IF NOT EXISTS fact_calls (
  call_id uuid primary key,
  agent_id text references dim_agents(agent_id),
  customer_id text references dim_customers(customer_id),
  date_id date references dim_date(date_id),
  duration_seconds int,
  call_timestamp timestamptz,
  disposition text,
  direction text,
  transcript text,
  summary text,
  embedding vector(1536),
  audio_url text,
  issue_type text,
  sentiment text,
  sentiment_score float,
  resolved boolean,
  agent_politeness float,
  agent_professionalism float,
  process_adherence float
);


insert into dim_date (date_id, day, month, year, weekday, week, day_number)
select
  d::date as date_id,
  extract(day from d),
  extract(month from d),
  extract(year from d),
  trim(to_char(d, 'Day')) as weekday,
  extract(week from d),
  extract(isodow from d)  -- 1 = Monday, 7 = Sunday
from generate_series('2024-01-01'::date, '2026-01-01'::date, interval '1 day') d
on conflict (date_id) do nothing;