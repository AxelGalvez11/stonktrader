from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.response import RankedResponse, make_meta
from app.database import get_db
from app.providers.stocks import stock_provider
from app.schemas.stocks import StockRanking
from app.services.rankings import get_stock_rankings

router = APIRouter(prefix="/stocks", tags=["stocks"])


@router.get("/rankings", response_model=RankedResponse[StockRanking])
def rankings(
    limit: int = Query(50, ge=1, le=200),
    sort_by: str = Query("composite_score"),
    sector: str | None = Query(None),
    min_score: float = Query(0.0, ge=0, le=100),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    data = get_stock_rankings(db, limit=limit, sort_by=sort_by, sector=sector,
                              min_score=min_score, search=search)
    return RankedResponse(meta=make_meta(provider=stock_provider.name), data=data, total=len(data))


@router.get("/sectors", response_model=list[str])
def sectors():
    from app.data.demo_data import DEMO_STOCKS
    return sorted({s["sector"] for s in DEMO_STOCKS})


@router.get("/{symbol}", response_model=StockRanking)
def get_stock(symbol: str, db: Session = Depends(get_db)):
    results = get_stock_rankings(db, search=symbol.upper(), limit=1)
    if not results or results[0].symbol != symbol.upper():
        raise NotFoundError(f"Stock '{symbol.upper()}' not found")
    return results[0]
