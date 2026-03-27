# Market Radar

Personal decision-support dashboard for ranking stocks, meme coins, and Polymarket signals by near-term opportunity.

> **Personal use only. Not financial advice.**

## Stack

- **Backend:** FastAPI + SQLAlchemy 2.0 + Pydantic v2 (SQLite local / PostgreSQL Docker)
- **Frontend:** Next.js 14 App Router + TypeScript + Tailwind CSS
- **Scoring:** Pure Python, 8-factor stock model + 7-factor meme coin model

## Quick Start (Local Dev)

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp ../.env.example ../.env   # edit as needed
python3 -m uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`. All `/api/*` requests proxy to the backend automatically (no CORS config needed).

## Docker Compose (PostgreSQL)

```bash
cp .env.example .env   # set POSTGRES_PASSWORD if desired
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Postgres: port 5432 (internal)

## Demo Mode

By default the app runs in **demo mode** — all data comes from built-in seed data, no external API keys required. Toggle it off in Settings once you add real API keys.

## API Keys (Optional)

Add keys via the **Settings → Integrations** UI, or set them directly in `.env`:

| Integration | Env Var | Notes |
|---|---|---|
| Alpaca | `ALPACA_API_KEY` / `ALPACA_API_SECRET` | Stock prices + news |
| CoinGecko | `COINGECKO_API_KEY` | Meme coin data (free tier works) |
| Polymarket | `POLYMARKET_API_KEY` | Prediction market data |
| Unusual Whales | `UNUSUAL_WHALES_API_KEY` | Options flow / sentiment |

## Scoring Models

### Stocks (8 factors)
| Factor | Weight | Description |
|---|---|---|
| 5D Momentum | 20% | 5-day price return |
| 20D Momentum | 15% | 20-day price return |
| 60D Momentum | 10% | 60-day price return |
| Relative Volume | 15% | Volume vs 20-day avg |
| Low Volatility | 10% | Inverse of 20-day vol |
| MA Distance (50D) | 10% | Price vs 50-day MA |
| Sentiment | 10% | News/social sentiment |
| Sector RS | 10% | Sector relative strength |

### Meme Coins (7 factors)
| Factor | Weight | Description |
|---|---|---|
| Attention Velocity | 25% | Social mention growth |
| Sentiment | 20% | Community sentiment |
| 24H Momentum | 20% | 24h price return |
| 1H Momentum | 10% | 1h price return |
| Volume Growth | 10% | Volume vs prior period |
| Liquidity | 10% | Market depth score |
| Rug Safety | 5% | Inverse rug-pull risk |

## Project Structure

```
StockTraderApp/
├── backend/
│   ├── app/
│   │   ├── core/          # enums, exceptions, response, security
│   │   ├── data/          # demo seed data
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── providers/     # data provider adapters (demo + live hooks)
│   │   ├── routers/       # FastAPI route handlers
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── scoring/       # pure scoring functions
│   │   ├── services/      # business logic
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages (App Router)
│   │   ├── components/    # UI components
│   │   ├── hooks/         # useApi hook
│   │   ├── lib/           # api client, utils
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── .gitignore
```

## Adding Live Data

Each provider file (`backend/app/providers/`) has clearly marked `# INTEGRATION POINT` comments showing exactly where to add real API calls. The demo/live split is controlled by `settings.demo_mode`.
# stonktrader
# stonktrader
