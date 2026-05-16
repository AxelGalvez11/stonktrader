-- Phase 1 biotech paper-trading schema
create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists watchlist_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  ticker text not null,
  company_name text,
  sector text,
  subsector text,
  tags text[] not null default '{}',
  status text not null default 'researching',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  ticker text unique not null,
  company_name text not null,
  description text,
  market_cap numeric,
  cash numeric,
  debt numeric,
  quarterly_burn numeric,
  estimated_cash_runway_quarters numeric,
  dilution_risk_score numeric,
  last_updated timestamptz default now()
);

create table if not exists pipeline_assets (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  drug_name text not null,
  mechanism text,
  target text,
  indication text,
  modality text,
  trial_phase text,
  status text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clinical_trials (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid not null references pipeline_assets(id) on delete cascade,
  nct_id text,
  title text,
  phase text,
  status text,
  enrollment int,
  start_date date,
  completion_date date,
  primary_endpoint text,
  secondary_endpoints text,
  inclusion_criteria text,
  exclusion_criteria text,
  source_url text,
  last_updated timestamptz default now()
);

create table if not exists sources (
  id uuid primary key default uuid_generate_v4(),
  source_type text not null,
  title text,
  url text not null,
  published_date date,
  retrieved_at timestamptz not null default now(),
  raw_text text,
  summary text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists pubmed_sources (
  id uuid primary key default uuid_generate_v4(),
  asset_id uuid references pipeline_assets(id) on delete cascade,
  pmid text,
  title text,
  authors text,
  journal text,
  publication_date date,
  abstract text,
  url text,
  ai_summary text,
  relevance_score numeric,
  created_at timestamptz not null default now()
);

create table if not exists sec_filings (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  ticker text,
  filing_type text,
  filing_date date,
  accession_number text,
  url text,
  text_excerpt text,
  ai_summary text,
  risks_summary text,
  financial_summary text,
  created_at timestamptz not null default now()
);

create table if not exists catalysts (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  asset_id uuid references pipeline_assets(id) on delete set null,
  ticker text,
  catalyst_type text,
  title text,
  expected_date date,
  date_confidence text,
  description text,
  risk_level text,
  source_url text,
  status text default 'upcoming',
  outcome text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_theses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  ticker text not null,
  company_id uuid references companies(id),
  catalyst_id uuid references catalysts(id),
  title text,
  thesis_json jsonb not null,
  bull_case text,
  bear_case text,
  base_case text,
  risk_summary text,
  ai_confidence_label text,
  source_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists paper_trades (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  ticker text not null,
  thesis_id uuid references ai_theses(id),
  trade_direction text,
  entry_price numeric,
  exit_price numeric,
  target_price numeric,
  stop_price numeric,
  paper_position_size numeric,
  entry_date date,
  planned_exit_date date,
  actual_exit_date date,
  result_percent numeric,
  result_dollars numeric,
  status text default 'planned',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists trade_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  paper_trade_id uuid references paper_trades(id) on delete cascade,
  scientific_thesis_correct boolean,
  market_reaction_correct boolean,
  main_error text,
  lessons text,
  ai_review text,
  created_at timestamptz not null default now()
);
