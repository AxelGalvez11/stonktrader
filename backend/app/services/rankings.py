from sqlalchemy.orm import Session

from app.models.watchlist import WatchlistItem
from app.providers.stocks import stock_provider
from app.providers.memecoins import memecoin_provider
from app.schemas.stocks import StockRanking
from app.schemas.memecoins import MemeCoinRanking
from app.scoring.stocks import score_stock
from app.scoring.memecoins import score_memecoin

_VALID_STOCK_SORTS = {"composite_score", "return_5d", "return_20d", "return_60d", "rel_volume", "confidence"}
_VALID_COIN_SORTS  = {"composite_score", "return_24h", "return_1h", "opportunity_score", "risk_score", "confidence"}


def get_stock_rankings(
    db: Session,
    *,
    limit: int = 50,
    sort_by: str = "composite_score",
    sector: str | None = None,
    min_score: float = 0.0,
    search: str | None = None,
) -> list[StockRanking]:
    watchlist = {
        row.symbol
        for row in db.query(WatchlistItem).filter(WatchlistItem.asset_type == "stock").all()
    }

    ranked: list[StockRanking] = []
    for raw in stock_provider.get_all():
        result = score_stock(raw)
        ranked.append(StockRanking(
            **raw.model_dump(),
            composite_score=result.composite,
            factors=result.factors,
            weights=result.weights,
            reason_codes=result.reason_codes,
            warnings=result.warnings,
            confidence=result.confidence,
            prob_positive_5d=result.prob_positive_5d,
            prob_beat_spy=result.prob_beat_spy,
            in_watchlist=raw.symbol in watchlist,
        ))

    if sector:
        ranked = [r for r in ranked if r.sector.lower() == sector.lower()]
    if search:
        q = search.upper()
        ranked = [r for r in ranked if q in r.symbol or search.lower() in r.name.lower()]
    ranked = [r for r in ranked if r.composite_score >= min_score]

    sort_key = sort_by if sort_by in _VALID_STOCK_SORTS else "composite_score"
    ranked.sort(key=lambda r: getattr(r, sort_key), reverse=True)

    for i, r in enumerate(ranked[:limit], 1):
        r.rank = i

    return ranked[:limit]


def get_memecoin_rankings(
    db: Session,
    *,
    limit: int = 50,
    sort_by: str = "composite_score",
    min_score: float = 0.0,
    search: str | None = None,
) -> list[MemeCoinRanking]:
    watchlist = {
        row.symbol
        for row in db.query(WatchlistItem).filter(WatchlistItem.asset_type == "memecoin").all()
    }

    ranked: list[MemeCoinRanking] = []
    for raw in memecoin_provider.get_all():
        result = score_memecoin(raw)
        ranked.append(MemeCoinRanking(
            **raw.model_dump(),
            composite_score=result.composite,
            opportunity_score=result.opportunity_score,
            tradability_score=result.tradability_score,
            risk_score=result.risk_score,
            factors=result.factors,
            weights=result.weights,
            reason_codes=result.reason_codes,
            warnings=result.warnings,
            confidence=result.confidence,
            in_watchlist=raw.symbol in watchlist,
        ))

    if search:
        q = search.upper()
        ranked = [r for r in ranked if q in r.symbol or search.lower() in r.name.lower()]
    ranked = [r for r in ranked if r.composite_score >= min_score]

    sort_key = sort_by if sort_by in _VALID_COIN_SORTS else "composite_score"
    ranked.sort(key=lambda r: getattr(r, sort_key), reverse=True)

    for i, r in enumerate(ranked[:limit], 1):
        r.rank = i

    return ranked[:limit]
