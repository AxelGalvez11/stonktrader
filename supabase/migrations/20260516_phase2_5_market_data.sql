create table if not exists market_quotes (
  id uuid primary key default uuid_generate_v4(),
  ticker text not null,
  price numeric,
  previous_close numeric,
  change numeric,
  change_percent numeric,
  volume numeric,
  average_volume numeric,
  market_cap numeric,
  currency text,
  exchange text,
  delayed boolean,
  provider text,
  retrieved_at timestamptz,
  raw_json jsonb,
  created_at timestamptz default now()
);

create table if not exists market_daily_bars (
  id uuid primary key default uuid_generate_v4(),
  ticker text not null,
  date date not null,
  open numeric,
  high numeric,
  low numeric,
  close numeric,
  adjusted_close numeric,
  volume numeric,
  provider text,
  raw_json jsonb,
  created_at timestamptz default now(),
  unique(ticker, date, provider)
);
