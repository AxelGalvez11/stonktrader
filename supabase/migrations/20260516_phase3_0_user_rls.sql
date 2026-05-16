-- Phase 3.0 user linkage + RLS baseline
alter table if exists watchlist_items add column if not exists user_id uuid;
alter table if exists research_notes add column if not exists user_id uuid;
alter table if exists ai_theses add column if not exists user_id uuid;
alter table if exists thesis_syntheses add column if not exists user_id uuid;
alter table if exists paper_trades add column if not exists user_id uuid;
alter table if exists trade_reviews add column if not exists user_id uuid;

alter table if exists watchlist_items enable row level security;
alter table if exists research_notes enable row level security;
alter table if exists ai_theses enable row level security;
alter table if exists thesis_syntheses enable row level security;
alter table if exists paper_trades enable row level security;
alter table if exists trade_reviews enable row level security;

create policy if not exists watchlist_own on watchlist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists notes_own on research_notes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists theses_own on ai_theses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists syn_own on thesis_syntheses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists trades_own on paper_trades for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists reviews_own on trade_reviews for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
