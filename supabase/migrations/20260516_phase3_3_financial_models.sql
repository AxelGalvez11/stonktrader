create table if not exists financial_models (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ticker text not null,
  model_type text not null check (model_type in ('dcf','risk_adjusted_pipeline','hybrid')),
  input_assumptions jsonb not null default '{}'::jsonb,
  model_output jsonb not null default '{}'::jsonb,
  scenario_analysis jsonb not null default '{}'::jsonb,
  source_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table financial_models enable row level security;
create policy if not exists "financial_models_select_own" on financial_models for select using (auth.uid() = user_id);
create policy if not exists "financial_models_insert_own" on financial_models for insert with check (auth.uid() = user_id);
create policy if not exists "financial_models_update_own" on financial_models for update using (auth.uid() = user_id);
