import type {
  RankedResponse, StockRanking, MemeCoinRanking, PolymarketSignal,
  WatchlistItem, WatchlistItemCreate, PaperTrade, PaperTradeCreate,
  DiagnosticsResult, AppSettings, Integration, IntegrationTestResult,
  KalshiMarket,
} from '@/types';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Stocks ───────────────────────────────────────────────────────────────
export const stocksApi = {
  rankings: (params?: { limit?: number; sort_by?: string; sector?: string; min_score?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.limit)     q.set('limit',     String(params.limit));
    if (params?.sort_by)   q.set('sort_by',   params.sort_by);
    if (params?.sector)    q.set('sector',    params.sector);
    if (params?.min_score) q.set('min_score', String(params.min_score));
    if (params?.search)    q.set('search',    params.search);
    return request<RankedResponse<StockRanking>>(`/stocks/rankings?${q}`);
  },
  getOne: (symbol: string) => request<StockRanking>(`/stocks/${symbol}`),
  sectors: ()              => request<string[]>('/stocks/sectors'),
};

// ── Meme Coins ───────────────────────────────────────────────────────────
export const memecoinsApi = {
  rankings: (params?: { limit?: number; sort_by?: string; min_score?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.limit)     q.set('limit',     String(params.limit));
    if (params?.sort_by)   q.set('sort_by',   params.sort_by);
    if (params?.min_score) q.set('min_score', String(params.min_score));
    if (params?.search)    q.set('search',    params.search);
    return request<RankedResponse<MemeCoinRanking>>(`/memecoins/rankings?${q}`);
  },
  getOne: (symbol: string) => request<MemeCoinRanking>(`/memecoins/${symbol}`),
};

// ── Polymarket ───────────────────────────────────────────────────────────
export const polymarketApi = {
  signals: (params?: { limit?: number; category?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.limit)    q.set('limit',    String(params.limit));
    if (params?.category) q.set('category', params.category);
    if (params?.search)   q.set('search',   params.search);
    return request<RankedResponse<PolymarketSignal>>(`/polymarket/signals?${q}`);
  },
  getOne:      (id: string) => request<PolymarketSignal>(`/polymarket/${id}`),
  categories:  ()           => request<string[]>('/polymarket/categories'),
};

// ── Watchlist ────────────────────────────────────────────────────────────
export const watchlistApi = {
  list:   ()                          => request<WatchlistItem[]>('/watchlist'),
  add:    (body: WatchlistItemCreate) => request<WatchlistItem>('/watchlist', { method: 'POST', body: JSON.stringify(body) }),
  remove: (id: number)                => request<void>(`/watchlist/${id}`,  { method: 'DELETE' }),
};

// ── Paper Trades ─────────────────────────────────────────────────────────
export const paperTradesApi = {
  list:   (status?: string) => request<PaperTrade[]>(`/paper-trades${status ? `?status=${status}` : ''}`),
  create: (body: PaperTradeCreate) => request<PaperTrade>('/paper-trades', { method: 'POST', body: JSON.stringify(body) }),
  close:  (id: number, exit_price: number) =>
    request<PaperTrade>(`/paper-trades/${id}/close`, { method: 'PUT', body: JSON.stringify({ exit_price }) }),
  delete: (id: number) => request<void>(`/paper-trades/${id}`, { method: 'DELETE' }),
};

// ── Diagnostics ──────────────────────────────────────────────────────────
export const diagnosticsApi = {
  stocks:    () => request<DiagnosticsResult>('/diagnostics/stocks'),
  memecoins: () => request<DiagnosticsResult>('/diagnostics/memecoins'),
};

// ── Settings ─────────────────────────────────────────────────────────────
export const settingsApi = {
  get:    ()                        => request<AppSettings>('/settings'),
  update: (body: Partial<AppSettings>) => request<AppSettings>('/settings', { method: 'PUT', body: JSON.stringify(body) }),
};

// ── Integrations ─────────────────────────────────────────────────────────
export const integrationsApi = {
  list:   ()                                                          => request<Integration[]>('/integrations'),
  update: (name: string, body: { enabled?: boolean; api_key?: string; config?: Record<string,string> }) =>
    request<Integration>(`/integrations/${name}`, { method: 'PUT', body: JSON.stringify(body) }),
  test:   (name: string)                                             => request<IntegrationTestResult>(`/integrations/${name}/test`, { method: 'POST' }),
};

// ── Kalshi ────────────────────────────────────────────────────────────────
export const kalshiApi = {
  signals: (params?: { category?: string; search?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.search)   q.set('search',   params.search);
    if (params?.limit)    q.set('limit',    String(params.limit));
    return request<RankedResponse<KalshiMarket>>(`/kalshi/signals?${q}`);
  },
  markets: (params?: { category?: string; search?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.search)   q.set('search',   params.search);
    if (params?.limit)    q.set('limit',    String(params.limit));
    return request<RankedResponse<KalshiMarket>>(`/kalshi/markets?${q}`);
  },
  getOne:      (id: string)           => request<KalshiMarket>(`/kalshi/markets/${id}`),
  categories:  ()                     => request<string[]>('/kalshi/categories'),
  overlays:    (symbols: string[])    => request<KalshiMarket[]>(`/kalshi/overlays?symbols=${symbols.join(',')}`),
  health:      ()                     => request<{ ok: boolean; latency_ms: number | null; source: string }>('/kalshi/health'),
};
