-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create chat_messages table to store session-based conversations
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id text not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamp with time zone default now()
);

-- Index for faster session lookups
create index if not exists chat_messages_session_id_idx on chat_messages (session_id);

-- Add embedding column to work_log_entry table
-- Note: work_log_entry table name from src/utils/constants.tsx
alter table work_log_entry 
add column if not exists embedding vector(1536); -- 1536 is the dimension for Gemini Text Embedding 004 or OpenAI text-embedding-3-small

-- Function to search entries by vector similarity
create or replace function match_entries (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  user_id_param uuid
)
returns table (
  id uuid,
  title text,
  description text,
  category text,
  project_id text,
  time_spent int,
  created_at timestamp with time zone,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    work_log_entry.id,
    work_log_entry.title,
    work_log_entry.description,
    work_log_entry.category,
    work_log_entry.project_id,
    work_log_entry.time_spent,
    work_log_entry.created_at,
    1 - (work_log_entry.embedding <=> query_embedding) as similarity
  from work_log_entry
  where work_log_entry.user_id = user_id_param
    and 1 - (work_log_entry.embedding <=> query_embedding) > match_threshold
  order by work_log_entry.embedding <=> query_embedding
  limit match_count;
end;
$$;
