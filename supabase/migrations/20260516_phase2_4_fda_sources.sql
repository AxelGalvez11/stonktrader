create table if not exists fda_sources (
  id uuid primary key default uuid_generate_v4(),
  ticker text,
  company_id uuid references companies(id) on delete set null,
  fda_source_id text,
  source_kind text,
  title text,
  drug_name text,
  active_ingredients text[],
  application_number text,
  sponsor text,
  indication text,
  approval_status text,
  approval_date text,
  label_sections jsonb,
  safety_signals jsonb,
  regulatory_signals jsonb,
  source_url text,
  retrieved_at timestamptz,
  raw_json jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists fda_sources_fda_source_id_uniq on fda_sources(fda_source_id) where fda_source_id is not null;
create unique index if not exists fda_sources_source_url_uniq on fda_sources(source_url) where source_url is not null;
