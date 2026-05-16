create table if not exists research_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  ticker text not null,
  company_id uuid references companies(id) on delete set null,
  catalyst_id uuid references catalysts(id) on delete set null,
  title text not null,
  raw_text text not null,
  source_url text,
  source_type text not null default 'manual' check (source_type in ('manual','company_ir','sec','pubmed','clinical_trials','fda','news','other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
