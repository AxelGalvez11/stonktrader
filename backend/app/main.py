from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db, SessionLocal
from app.routers import (
    stocks,
    memecoins,
    polymarket,
    watchlist,
    paper_trades,
    diagnostics,
    settings_router,
    integrations,
)
from app.services.app_settings import init_settings
from app.services.integrations import init_integrations


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    db = SessionLocal()
    try:
        init_settings(db)
        init_integrations(db)
    finally:
        db.close()
    yield
    # Shutdown (nothing to clean up for SQLite/SQLAlchemy sync)


app = FastAPI(
    title="Market Radar API",
    version="0.1.0",
    description="Decision-support dashboard for ranking stocks, meme coins, and Polymarket signals.",
    lifespan=lifespan,
)

# Allow Next.js dev server and same-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router)
app.include_router(memecoins.router)
app.include_router(polymarket.router)
app.include_router(watchlist.router)
app.include_router(paper_trades.router)
app.include_router(diagnostics.router)
app.include_router(settings_router.router)
app.include_router(integrations.router)


@app.get("/health", tags=["health"])
def health():
    return {
        "status": "ok",
        "demo_mode": settings.demo_mode,
        "app_name": settings.app_name,
    }
