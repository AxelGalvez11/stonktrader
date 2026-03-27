from fastapi import APIRouter, Query

from app.schemas.kalshi import KalshiMarket
from app.core.response import RankedResponse
from app.services import kalshi as svc

router = APIRouter(prefix="/kalshi", tags=["kalshi"])


@router.get("/health")
def kalshi_health():
    return svc.health_check()


@router.get("/markets", response_model=RankedResponse[KalshiMarket])
def list_markets(
    category: str | None = Query(None),
    search:   str | None = Query(None),
    limit:    int        = Query(50, ge=1, le=200),
):
    return svc.get_markets(category=category, search=search, limit=limit)


@router.get("/markets/{market_id}", response_model=KalshiMarket)
def get_market(market_id: str):
    return svc.get_market(market_id)


@router.get("/categories", response_model=list[str])
def list_categories():
    return svc.get_categories()


@router.get("/signals", response_model=RankedResponse[KalshiMarket])
def signals(
    category: str | None = Query(None),
    search:   str | None = Query(None),
    limit:    int        = Query(50, ge=1, le=200),
):
    """Alias for /markets — surfaces markets as signals for the UI."""
    return svc.get_markets(category=category, search=search, limit=limit)


@router.get("/overlays", response_model=list[KalshiMarket])
def asset_overlays(symbols: str = Query(..., description="Comma-separated asset symbols")):
    """Return Kalshi markets relevant to the given assets, e.g. ?symbols=NVDA,SOFI"""
    sym_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    return svc.get_asset_overlays(sym_list)
