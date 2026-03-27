from pydantic import BaseModel


class MemeCoinRaw(BaseModel):
    """Raw data from a provider, before scoring."""
    symbol: str
    name: str
    price: float
    market_cap: float
    return_1h: float
    return_24h: float
    volume_change_24h: float
    mention_growth_24h: float
    sentiment_score: float
    liquidity_score: float
    rug_risk_score: float


class MemeCoinRanking(BaseModel):
    """Fully scored meme coin returned to API consumers."""
    symbol: str
    name: str
    price: float
    market_cap: float
    return_1h: float
    return_24h: float
    volume_change_24h: float
    mention_growth_24h: float
    sentiment_score: float
    liquidity_score: float
    rug_risk_score: float
    # Scoring outputs
    composite_score: float
    opportunity_score: float
    tradability_score: float
    risk_score: float
    factors: dict[str, float]
    weights: dict[str, float]
    reason_codes: list[str]
    warnings: list[str]
    confidence: float
    # UI helpers
    rank: int = 0
    in_watchlist: bool = False
