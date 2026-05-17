# Phase 2.5 Market data integration

Provider chosen: **stooq** (public CSV, no key required) via provider abstraction.

Env vars:
- `MARKET_DATA_PROVIDER` (default `stooq`)
- `MARKET_DATA_API_KEY` (required for non-stooq providers)

Routes:
- `GET /api/market/quote?ticker=...`
- `GET /api/market/bars?ticker=...&range=6mo`
- `POST /api/market/refresh`

Safety:
- Market data may be delayed.
- Derived metrics are approximate.
- Paper-trading analysis only.
