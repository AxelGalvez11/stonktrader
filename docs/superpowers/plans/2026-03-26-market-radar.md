# Market Radar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Market Radar — a local decision-support dashboard for ranking stocks, meme coins, and Polymarket signals by near-term opportunity.

**Architecture:** FastAPI (port 8000) + Next.js 14 (port 3000). Next.js rewrites `/api/*` → FastAPI. SQLite local / PostgreSQL Docker. Pure Python scoring; pure TypeScript UI.

**Tech Stack:** FastAPI 0.115, SQLAlchemy 2.0, Pydantic v2, SQLite/PostgreSQL, Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide React, clsx, date-fns.

---

## Phase 1 — Backend Foundation ✅

### Task 1: Scaffolding + Config + Database
- [ ] Create `.env.example`
- [ ] Create `backend/requirements.txt`
- [ ] Create `backend/app/config.py`
- [ ] Create `backend/app/database.py`

### Task 2: Core Utilities
- [ ] Create `backend/app/core/enums.py`
- [ ] Create `backend/app/core/exceptions.py`
- [ ] Create `backend/app/core/response.py`
- [ ] Create `backend/app/core/security.py`

### Task 3: SQLAlchemy Models
- [ ] Create `backend/app/models/base.py`
- [ ] Create `backend/app/models/watchlist.py`
- [ ] Create `backend/app/models/paper_trade.py`
- [ ] Create `backend/app/models/app_settings.py`
- [ ] Create `backend/app/models/integration.py`

### Task 4: Pydantic Schemas
- [ ] Create `backend/app/schemas/stocks.py`
- [ ] Create `backend/app/schemas/memecoins.py`
- [ ] Create `backend/app/schemas/polymarket.py`
- [ ] Create `backend/app/schemas/watchlist.py`
- [ ] Create `backend/app/schemas/paper_trades.py`
- [ ] Create `backend/app/schemas/diagnostics.py`
- [ ] Create `backend/app/schemas/integrations.py`

### Task 5: Scoring Interfaces
- [ ] Create `backend/app/scoring/base.py`

---

## Phase 2 — Backend Logic

### Task 6: Demo Seed Data
- [ ] Create `backend/app/data/demo_data.py` (15 stocks, 12 meme coins, 10 Polymarket signals)

### Task 7: Provider Layer
- [ ] Create `backend/app/providers/base.py`
- [ ] Create `backend/app/providers/stocks.py`
- [ ] Create `backend/app/providers/memecoins.py`
- [ ] Create `backend/app/providers/polymarket.py`

### Task 8: Scoring Engines
- [ ] Create `backend/app/scoring/stocks.py`
- [ ] Create `backend/app/scoring/memecoins.py`

### Task 9: Services
- [ ] Create `backend/app/services/rankings.py`
- [ ] Create `backend/app/services/watchlist.py`
- [ ] Create `backend/app/services/paper_trades.py`
- [ ] Create `backend/app/services/app_settings.py`
- [ ] Create `backend/app/services/integrations.py`
- [ ] Create `backend/app/services/diagnostics.py`

### Task 10: Routers + main.py
- [ ] Create all routers in `backend/app/routers/`
- [ ] Create `backend/app/main.py`

---

## Phase 3 — Frontend Foundation

### Task 11: Frontend Scaffold
- [ ] Create `frontend/package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`

### Task 12: Types + API Client + Utilities
- [ ] Create `frontend/src/types/index.ts`
- [ ] Create `frontend/src/lib/api.ts`
- [ ] Create `frontend/src/lib/utils.ts`
- [ ] Create `frontend/src/hooks/useApi.ts`

### Task 13: Layout
- [ ] Create `frontend/src/components/layout/Sidebar.tsx`
- [ ] Create `frontend/src/components/layout/TopBar.tsx`
- [ ] Create `frontend/src/app/layout.tsx`
- [ ] Create `frontend/src/app/globals.css`

---

## Phase 4 — Frontend Components + Pages

### Task 14: UI Primitives
- [ ] Badge, ScoreBar, StatCard, ConfidenceDot, SearchInput, FilterChips, ReasonTags, WarningPills, DataFreshness, Disclaimer

### Task 15: Feature Components
- [ ] StockTable, StockDetailModal, MemeCoinTable, MemeCoinDetailModal, SignalTable, SignalCard
- [ ] WatchlistTable, AddToWatchlistModal, TradeTable, NewTradeModal
- [ ] DiagnosticsPanel, BacktestSummary, IntegrationCard, IntegrationForm

### Task 16: Pages
- [ ] All 8 pages (overview, stocks, memecoins, polymarket, watchlist, paper-trades, diagnostics, settings)

---

## Phase 5 — DevOps + Docs

### Task 17: Docker + README
- [ ] `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml`, `README.md`
