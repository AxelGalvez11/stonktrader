# Market Radar — Design Spec
**Date:** 2026-03-26
**Status:** Approved
**Scope:** Full MVP — all 7 sections in one implementation pass

---

## Overview

Market Radar is a personal-use decision-support dashboard for ranking stocks, meme coins, and event-driven market signals by near-term opportunity. It runs entirely locally on a MacBook Air M1 (8GB RAM), is API-driven in demo mode with clear extension points for real APIs, and presents probabilistic rankings with full explainability — not trade recommendations.

---

## Architectural Approach

**Monorepo, two processes, Next.js rewrite proxy.**

```
market-radar/
├── backend/     ← FastAPI + Python 3.12 (port 8000)
└── frontend/    ← Next.js 14 App Router + TypeScript (port 3000)
```

All browser requests to `/api/*` are rewritten by Next.js to `http://localhost:8000/*`. No CORS configuration needed. No separate proxy process. Scoring and business logic live entirely in Python. Frontend is pure UI + typed data fetching.

---

## Full File Tree

```
market-radar/
├── backend/
│   ├── app/
│   │   ├── main.py                      ← app factory, router registration, lifespan
│   │   ├── config.py                    ← pydantic-settings, .env, demo_mode flag
│   │   ├── database.py                  ← SQLAlchemy engine/session, auto-detect SQLite vs PG
│   │   │
│   │   ├── core/                        ← shared backend utilities (no business logic)
│   │   │   ├── __init__.py
│   │   │   ├── enums.py                 ← AssetType, RiskLevel, SignalStrength, TradeStatus, etc.
│   │   │   ├── exceptions.py            ← NotFoundError, ProviderError, ScoringError
│   │   │   ├── response.py              ← ApiMeta, RankedResponse, standard response wrapper
│   │   │   └── security.py             ← mask_secret(), is_secret_configured()
│   │   │
│   │   ├── models/                      ← SQLAlchemy ORM (persisted state only)
│   │   │   ├── __init__.py
│   │   │   ├── base.py                  ← declarative Base
│   │   │   ├── watchlist.py
│   │   │   ├── paper_trade.py
│   │   │   ├── app_settings.py
│   │   │   └── integration.py           ← Integration table (name, enabled, key_masked, config_json)
│   │   │
│   │   ├── schemas/                     ← Pydantic v2 request/response shapes
│   │   │   ├── __init__.py
│   │   │   ├── stocks.py
│   │   │   ├── memecoins.py
│   │   │   ├── polymarket.py
│   │   │   ├── watchlist.py
│   │   │   ├── paper_trades.py
│   │   │   ├── diagnostics.py
│   │   │   └── integrations.py          ← IntegrationRead, IntegrationUpdate, IntegrationStatus
│   │   │
│   │   ├── data/
│   │   │   └── demo_data.py             ← 15 stocks, 12 meme coins, 10 Polymarket signals (seed)
│   │   │
│   │   ├── providers/                   ← data adapters (demo today, real APIs later)
│   │   │   ├── __init__.py
│   │   │   ├── base.py                  ← ProviderBase protocol / ABC
│   │   │   ├── stocks.py                ← StockProvider: demo + yfinance/AlphaVantage hook
│   │   │   ├── memecoins.py             ← MemeCoinProvider: demo + CoinGecko hook
│   │   │   └── polymarket.py            ← PolymarketProvider: demo + REST API hook
│   │   │
│   │   ├── scoring/                     ← pure functions, no I/O, fully testable
│   │   │   ├── __init__.py
│   │   │   ├── base.py                  ← ScoreResult dataclass: composite, factors, reason_codes, warnings, confidence
│   │   │   ├── stocks.py                ← score_stock(raw) → ScoreResult
│   │   │   └── memecoins.py             ← score_memecoin(raw) → ScoreResult
│   │   │
│   │   ├── services/                    ← orchestration (provider → score → format)
│   │   │   ├── __init__.py
│   │   │   ├── rankings.py              ← get_stock_rankings(), get_memecoin_rankings()
│   │   │   ├── watchlist.py
│   │   │   ├── paper_trades.py
│   │   │   ├── app_settings.py
│   │   │   └── integrations.py          ← list_integrations(), update_integration(), test_integration()
│   │   │
│   │   └── routers/                     ← thin FastAPI route handlers
│   │       ├── __init__.py
│   │       ├── stocks.py
│   │       ├── memecoins.py
│   │       ├── polymarket.py
│   │       ├── watchlist.py
│   │       ├── paper_trades.py
│   │       ├── diagnostics.py
│   │       ├── settings_router.py
│   │       └── integrations.py
│   │
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx               ← dark shell, sidebar, disclaimer banner
│   │   │   ├── page.tsx                 ← overview: top movers, summary stats
│   │   │   ├── stocks/page.tsx
│   │   │   ├── memecoins/page.tsx
│   │   │   ├── polymarket/page.tsx
│   │   │   ├── watchlist/page.tsx
│   │   │   ├── paper-trades/page.tsx
│   │   │   ├── diagnostics/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── TopBar.tsx
│   │   │   ├── ui/                      ← reusable design-system primitives
│   │   │   │   ├── Badge.tsx            ← score/risk/status badges
│   │   │   │   ├── ScoreBar.tsx         ← 0-100 progress bar with color zones
│   │   │   │   ├── StatCard.tsx         ← metric card with delta indicator
│   │   │   │   ├── SortableTable.tsx    ← generic sortable/filterable table
│   │   │   │   ├── SearchInput.tsx
│   │   │   │   ├── FilterChips.tsx
│   │   │   │   ├── ReasonTags.tsx       ← reason_codes as inline pill tags
│   │   │   │   ├── WarningPills.tsx     ← warning badges with tooltips
│   │   │   │   ├── ConfidenceDot.tsx    ← high/medium/low confidence indicator
│   │   │   │   ├── DataFreshness.tsx    ← as_of + demo_mode indicator
│   │   │   │   └── Disclaimer.tsx       ← persistent disclaimer banner
│   │   │   ├── stocks/
│   │   │   │   ├── StockTable.tsx
│   │   │   │   └── StockDetailModal.tsx ← factor breakdown, reason codes, Polymarket overlay
│   │   │   ├── memecoins/
│   │   │   │   ├── MemeCoinTable.tsx
│   │   │   │   └── MemeCoinDetailModal.tsx
│   │   │   ├── polymarket/
│   │   │   │   ├── SignalTable.tsx
│   │   │   │   └── SignalCard.tsx
│   │   │   ├── watchlist/
│   │   │   │   ├── WatchlistTable.tsx
│   │   │   │   └── AddToWatchlistModal.tsx
│   │   │   ├── paper-trades/
│   │   │   │   ├── TradeTable.tsx
│   │   │   │   └── NewTradeModal.tsx
│   │   │   ├── diagnostics/
│   │   │   │   ├── DiagnosticsPanel.tsx
│   │   │   │   └── BacktestSummary.tsx
│   │   │   └── settings/
│   │   │       ├── IntegrationCard.tsx  ← per-integration toggle + key input + status
│   │   │       └── IntegrationForm.tsx  ← modal/inline form for editing integration config
│   │   │
│   │   ├── hooks/
│   │   │   └── useApi.ts                ← generic fetch hook: { data, loading, error, refetch }
│   │   ├── lib/
│   │   │   ├── api.ts                   ← typed API client (all endpoints, AbortController)
│   │   │   └── utils.ts                 ← cn(), formatters, score→color, percent formatters
│   │   └── types/
│   │       └── index.ts                 ← all shared TypeScript interfaces
│   │
│   ├── next.config.ts                   ← /api/* rewrite → http://localhost:8000/*
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml                   ← postgres + backend + frontend
├── .env.example
└── README.md
```

---

## Database Strategy

| Context | Database | How |
|---------|----------|-----|
| Local non-Docker dev | SQLite | `DATABASE_URL=sqlite:///./market_radar.db` (default) |
| Docker Compose | PostgreSQL 16 | `DATABASE_URL=postgresql://...` (set in compose env) |

SQLAlchemy detects the dialect from `DATABASE_URL`. `check_same_thread=False` is applied only for SQLite. Schema creation via `Base.metadata.create_all()` on startup — no Alembic migrations for MVP.

---

## Persisted Tables (SQLAlchemy ORM)

| Table | Purpose |
|-------|---------|
| `watchlist_items` | Saved assets with notes, tags, last score |
| `paper_trades` | Simulated trades: entry, stop, target, thesis, P&L |
| `app_settings` | Key/value store for configurable parameters |
| `integrations` | Integration registry: name, enabled, masked key, config JSON |

Stocks, meme coins, and Polymarket signals are **not persisted** — they are computed fresh from providers on each request (in demo mode, from `demo_data.py`).

---

## Scoring Architecture

All scoring functions are **pure** — they accept a dict of raw asset data and return a `ScoreResult`:

```python
@dataclass
class ScoreResult:
    composite: float          # 0-100
    factors: dict[str, float] # per-factor normalized scores (0-1)
    weights: dict[str, float] # factor weights used
    reason_codes: list[str]   # e.g. ["STRONG_MOMENTUM", "HIGH_VOLUME"]
    warnings: list[str]       # e.g. ["EARNINGS_PROXIMITY", "HIGH_VOLATILITY"]
    confidence: float         # 0-1, based on signal agreement + data completeness
    prob_positive_5d: float   # for stocks only
    prob_beat_spy: float      # for stocks only
```

### Stock Scoring Factors & Weights

| Factor | Weight | Source field |
|--------|--------|-------------|
| 5d momentum | 10% | `return_5d` |
| 20d momentum | 15% | `return_20d` |
| 60d momentum | 15% | `return_60d` |
| Relative volume | 15% | `rel_volume` |
| Volatility (inverted) | 15% | `volatility_30d` |
| MA distance (50d) | 10% | `ma_distance_50d` |
| Sentiment | 10% | `sentiment_score` |
| Sector RS proxy | 10% | `sector_rs_score` |

Earnings proximity (<7 days) → adds `EARNINGS_PROXIMITY` warning, reduces confidence by 20%.
Polymarket event overlay (if enabled) → ±5% confidence modifier.

### Meme Coin Scoring Factors & Weights

| Factor | Weight | Source field |
|--------|--------|-------------|
| Attention velocity | 20% | `mention_growth_24h` |
| Sentiment | 20% | `sentiment_score` |
| 24h momentum | 15% | `return_24h` |
| 1h momentum | 10% | `return_1h` |
| Volume growth | 10% | `volume_change_24h` |
| Liquidity score | 15% | `liquidity_score` |
| Rug safety (inverted rug risk) | 10% | `rug_risk_score` |

---

## API Response Metadata

Every ranked list response includes an `ApiMeta` block:

```json
{
  "meta": {
    "as_of": "2026-03-26T14:00:00Z",
    "demo_mode": true,
    "provider": "demo",
    "data_freshness": "static",
    "warnings": []
  },
  "data": [...]
}
```

---

## API Endpoints

```
GET  /health
GET  /stocks/rankings          ?limit, sort_by, sector, min_score, search
GET  /stocks/{symbol}
GET  /memecoins/rankings       ?limit, sort_by, min_score, search
GET  /memecoins/{symbol}
GET  /polymarket/signals       ?limit, category, search
GET  /polymarket/{market_id}
GET  /watchlist
POST /watchlist
DELETE /watchlist/{id}
GET  /paper-trades
POST /paper-trades
PUT  /paper-trades/{id}
DELETE /paper-trades/{id}
GET  /diagnostics/stocks
GET  /diagnostics/memecoins
GET  /settings
PUT  /settings
GET  /integrations
PUT  /integrations/{name}
POST /integrations/{name}/test
```

---

## Frontend Design

- **Color scheme:** `zinc-950` background, `zinc-900` cards, `zinc-800` borders, `zinc-100/400` text
- **Accent:** `emerald-400` for positive/high scores, `red-400` for negative/risk, `amber-400` for warnings
- **Fonts:** system-ui / Inter (no custom font dependency)
- **Score badges:** 80+ emerald, 60-79 yellow, 40-59 orange, <40 red
- **Risk badges:** low green, medium yellow, high orange, very-high red
- **Disclaimer banner:** persistent, non-dismissable strip at bottom of every page

---

## Demo Seed Data

| Asset class | Count | Symbols |
|-------------|-------|---------|
| Stocks | 15 | NVDA, AAPL, MSFT, META, GOOGL, AMZN, TSLA, AMD, PLTR, COIN, SOFI, HOOD, RKLB, SPY, QQQ |
| Meme coins | 12 | DOGE, SHIB, PEPE, WIF, BONK, FLOKI, MEME, TURBO, BOME, POPCAT, BRETT, MOG |
| Polymarket signals | 10 | Fed rate cut, BTC ETF, US election, AI regulation, crypto regulation, recession odds, oil direction, tech earnings, geopolitical risk, S&P year-end |

---

## Integration Registry (MVP)

Managed in the `integrations` table. Each integration has:
- `name` (e.g., `alpha_vantage`, `coingecko`, `polymarket`, `twitter`, `reddit`)
- `enabled` bool
- `api_key_masked` (stored masked, never returned in full)
- `config_json` (extra params)
- `status` (unconfigured / configured / error)

The `IntegrationCard` component renders each one with a toggle, key input, and live test button.

---

## Docker Compose Services

| Service | Image | Port |
|---------|-------|------|
| `postgres` | postgres:16-alpine | 5432 |
| `backend` | built from `backend/Dockerfile` | 8000 |
| `frontend` | built from `frontend/Dockerfile` | 3000 |

Backend depends on postgres. Frontend depends on backend. Postgres data in named volume `pgdata`.

---

## Non-Docker Local Run

```bash
# Backend (SQLite auto-selected)
cd backend && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm install
npm run dev   # port 3000
```

No Postgres, no Docker, no extra services.

---

## Safety / Disclaimer

Persistent disclaimer in UI:
> "Market Radar is for personal research only and is not financial advice. All outputs are probabilistic estimates based on demo data. Meme coins carry extreme risk of total loss. Prediction market signals are contextual — not trading signals. Backtests do not guarantee future results."

---

## Out of Scope (MVP)

- Live brokerage integration
- Real-time websocket streaming
- Background workers / Celery
- Vector DB / embedding search
- ML model training
- Redis (not justified for MVP)
- User authentication
