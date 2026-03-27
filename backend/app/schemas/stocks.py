from pydantic import BaseModel


class StockRaw(BaseModel):
    """Raw data from a provider, before scoring."""
    symbol: str
    name: str
    sector: str
    price: float
    return_5d: float
    return_20d: float
    return_60d: float
    rel_volume: float
    volatility_30d: float
    ma_distance_50d: float
    sentiment_score: float
    sector_rs_score: float
    days_to_earnings: int | None = None
    market_cap: float


class StockRanking(BaseModel):
    """Fully scored stock returned to API consumers."""
    symbol: str
    name: str
    sector: str
    price: float
    return_5d: float
    return_20d: float
    return_60d: float
    rel_volume: float
    volatility_30d: float
    ma_distance_50d: float
    market_cap: float
    days_to_earnings: int | None
    sentiment_score: float
    sector_rs_score: float
    # Scoring outputs
    composite_score: float
    factors: dict[str, float]
    weights: dict[str, float]
    reason_codes: list[str]
    warnings: list[str]
    confidence: float
    prob_positive_5d: float
    prob_beat_spy: float
    # UI helpers
    rank: int = 0
    in_watchlist: bool = False
