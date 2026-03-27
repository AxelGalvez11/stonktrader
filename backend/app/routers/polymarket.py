from fastapi import APIRouter, Query

from app.core.exceptions import NotFoundError
from app.core.response import RankedResponse, make_meta
from app.providers.polymarket import polymarket_provider
from app.schemas.polymarket import PolymarketSignal

router = APIRouter(prefix="/polymarket", tags=["polymarket"])


@router.get("/signals", response_model=RankedResponse[PolymarketSignal])
def signals(
    limit: int = Query(50, ge=1, le=200),
    category: str | None = Query(None),
    search: str | None = Query(None),
):
    data = polymarket_provider.get_all()
    if category:
        data = [s for s in data if s.category == category]
    if search:
        q = search.lower()
        data = [s for s in data if q in s.title.lower() or q in s.question.lower()]
    data = data[:limit]
    return RankedResponse(meta=make_meta(provider=polymarket_provider.name), data=data, total=len(data))


@router.get("/categories", response_model=list[str])
def categories():
    return polymarket_provider.get_categories()


@router.get("/{market_id}", response_model=PolymarketSignal)
def get_signal(market_id: str):
    signal = polymarket_provider.get_one(market_id)
    if not signal:
        raise NotFoundError(f"Polymarket signal '{market_id}' not found")
    return signal
