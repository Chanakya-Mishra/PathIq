-- PathIQ Supabase Schema (PostgreSQL + Row Level Security)
create extension if not exists pgcrypto;

-- 1. Curated 100% free learning resources
create table if not exists public.resources (
  id text primary key,
  domain text not null check (domain in ('tech', 'data', 'design', 'govt', 'communication')),
  format text not null check (format in ('text', 'interactive', 'video')),
  languages text[] not null default '{}',
  data_usage text not null check (data_usage in ('low', 'moderate')),
  is_free boolean not null default true check (is_free = true),
  url text not null,
  title jsonb not null,
  why jsonb not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_resources_domain_data on public.resources (domain, data_usage) where is_active = true;
create index if not exists idx_resources_languages on public.resources using gin (languages);

-- 2. Cached Gemini doubt solver answers (cuts repeat API costs & latency)
create table if not exists public.doubt_cache (
  id uuid primary key default gen_random_uuid(),
  query_hash text not null,
  normalized_query text not null,
  lang text not null check (lang in ('en', 'hi', 'ta', 'bn')),
  stage text not null check (stage in ('school', 'college', 'graduate', 'switcher')),
  lite_mode boolean not null default false,
  model_used text not null,
  answer_json jsonb not null,
  hit_count integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (query_hash, lang, stage, lite_mode)
);

create index if not exists idx_doubt_cache_lookup on public.doubt_cache (query_hash, lang, stage, lite_mode);

-- 3. Anonymous shareable saved learning plans (no login required)
create table if not exists public.shared_plans (
  code text primary key check (char_length(code) between 6 and 12),
  lang text not null default 'en' check (lang in ('en', 'hi', 'ta', 'bn')),
  saved_resource_ids text[] not null default '{}',
  completed_steps jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days')
);

create index if not exists idx_shared_plans_expires on public.shared_plans (expires_at);

-- 4. Solver helpfulness feedback
create table if not exists public.doubt_feedback (
  id uuid primary key default gen_random_uuid(),
  query_hash text not null,
  helpful boolean not null,
  lang text not null check (lang in ('en', 'hi', 'ta', 'bn')),
  created_at timestamptz not null default now()
);

-- 5. Community broken/paid-link reports
create table if not exists public.resource_reports (
  id uuid primary key default gen_random_uuid(),
  resource_id text not null references public.resources(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 300),
  lang text not null check (lang in ('en', 'hi', 'ta', 'bn')),
  created_at timestamptz not null default now()
);

-- Row Level Security: public read on verified active free resources;
-- all writes happen exclusively through the Node.js backend service role.
alter table public.resources enable row level security;
alter table public.doubt_cache enable row level security;
alter table public.shared_plans enable row level security;
alter table public.doubt_feedback enable row level security;
alter table public.resource_reports enable row level security;

drop policy if exists "Public read active free resources" on public.resources;
create policy "Public read active free resources"
  on public.resources
  for select
  to anon, authenticated
  using (is_active = true and is_free = true);
