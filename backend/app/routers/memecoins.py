from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.response import RankedResponse, make_meta
from app.database import get_db
from app.providers.memecoins import memecoin_provider
from app.schemas.memecoins import MemeCoinRanking
from app.services.rankings import get_memecoin_rankings

router = APIRouter(prefix="/memecoins", tags=["memecoins"])


@router.get("/rankings", response_model=RankedResponse[MemeCoinRanking])
def rankings(
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("composite_score"),
    min_score: float = Query(0.0, ge=0, le=100),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    data = get_memecoin_rankings(db, limit=limit, sort_by=sort_by,
                                  min_score=min_score, search=search)
    return RankedResponse(meta=make_meta(provider=memecoin_provider.name), data=data, total=len(data))


@router.get("/{symbol}", response_model=MemeCoinRanking)
def get_coin(symbol: str, db: Session = Depends(get_db)):
    results = get_memecoin_rankings(db, search=symbol.upper(), limit=1)
    if not results or results[0].symbol != symbol.upper():
        raise NotFoundError(f"Meme coin '{symbol.upper()}' not found")
    return results[0]
