create table if not exists fundamental_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  ticker text not null,
  company_name text,
  company_type text,
  financial_snapshot jsonb,
  valuation_metrics jsonb,
  biotech_specific_metrics jsonb,
  fundamental_quality jsonb,
  bull_case text,
  bear_case text,
  base_case text,
  key_risks jsonb,
  missing_data jsonb,
  source_summary jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table if exists fundamental_reports enable row level security;
create policy if not exists fundamental_reports_own on fundamental_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
