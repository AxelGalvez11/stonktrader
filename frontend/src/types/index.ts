// ── API metadata ────────────────────────────────────────────────────────
export interface ApiMeta {
  as_of: string;
  demo_mode: boolean;
  provider: string;
  data_freshness: string;
  warnings: string[];
}

export interface RankedResponse<T> {
  meta: ApiMeta;
  data: T[];
  total: number;
}

// ── Stocks ───────────────────────────────────────────────────────────────
export interface StockRanking {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  return_5d: number;
  return_20d: number;
  return_60d: number;
  rel_volume: number;
  volatility_30d: number;
  ma_distance_50d: number;
  market_cap: number;
  days_to_earnings: number | null;
  sentiment_score: number;
  sector_rs_score: number;
  composite_score: number;
  factors: Record<string, number>;
  weights: Record<string, number>;
  reason_codes: string[];
  warnings: string[];
  confidence: number;
  prob_positive_5d: number;
  prob_beat_spy: number;
  rank: number;
  in_watchlist: boolean;
}

// ── Meme Coins ───────────────────────────────────────────────────────────
export interface MemeCoinRanking {
  symbol: string;
  name: string;
  price: number;
  market_cap: number;
  return_1h: number;
  return_24h: number;
  volume_change_24h: number;
  mention_growth_24h: number;
  sentiment_score: number;
  liquidity_score: number;
  rug_risk_score: number;
  composite_score: number;
  opportunity_score: number;
  tradability_score: number;
  risk_score: number;
  factors: Record<string, number>;
  weights: Record<string, number>;
  reason_codes: string[];
  warnings: string[];
  confidence: number;
  rank: number;
  in_watchlist: boolean;
}

// ── Polymarket ───────────────────────────────────────────────────────────
export interface PolymarketSignal {
  id: string;
  title: string;
  question: string;
  category: string;
  tags: string[];
  probability: number;
  probability_change_24h: number;
  volume_24h: number;
  status: string;
  linked_theme: string;
  related_assets: string[];
  notes: string;
  close_time: string | null;
}

// ── Watchlist ────────────────────────────────────────────────────────────
export interface WatchlistItemCreate {
  symbol: string;
  asset_type: 'stock' | 'memecoin';
  notes?: string;
  tags?: string[];
}

export interface WatchlistItem {
  id: number;
  symbol: string;
  asset_type: string;
  notes: string;
  tags: string[];
  added_at: string;
  last_score: number | null;
  last_updated: string | null;
}

// ── Paper Trades ─────────────────────────────────────────────────────────
export interface PaperTradeCreate {
  symbol: string;
  asset_type: 'stock' | 'memecoin';
  direction: 'long' | 'short';
  entry_price: number;
  stop_loss?: number;
  take_profit?: number;
  size_usd?: number;
  thesis?: string;
}

export interface PaperTrade {
  id: number;
  symbol: string;
  asset_type: string;
  direction: 'long' | 'short';
  entry_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  size_usd: number;
  thesis: string;
  status: 'open' | 'closed' | 'cancelled';
  exit_price: number | null;
  exit_at: string | null;
  created_at: string;
  pnl: number | null;
  pnl_pct: number | null;
}

// ── Diagnostics ──────────────────────────────────────────────────────────
export interface DiagnosticsResult {
  asset_type: string;
  period: string;
  total_ranked: number;
  hit_rate: number;
  avg_return: number;
  benchmark_return: number;
  alpha: number;
  max_drawdown: number;
  sharpe_proxy: number;
  top_reason_codes: string[];
  warnings: string[];
  disclaimer: string;
}

// ── Settings ─────────────────────────────────────────────────────────────
export interface AppSettings {
  scoring_horizon_days: number;
  min_market_cap_stocks: number;
  min_liquidity_memecoins: number;
  stock_universe_size: number;
  memecoin_universe_size: number;
  polymarket_weight: number;
  demo_mode: boolean;
}

// ── Integrations ─────────────────────────────────────────────────────────
export interface Integration {
  name: string;
  display_name: string;
  description: string;
  enabled: boolean;
  api_key_masked: string | null;
  status: 'unconfigured' | 'configured' | 'error' | 'testing';
  config: Record<string, string>;
  last_tested_at: string | null;
  error_message: string | null;
}

export interface IntegrationTestResult {
  success: boolean;
  message: string;
  latency_ms: number | null;
}
