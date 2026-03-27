"""
Kalshi service layer — thin wrapper over the provider.
Adds filtering, sorting, and asset-overlay helpers.
"""
from app.core.exceptions import NotFoundError, ProviderError
from app.core.response import make_meta, RankedResponse
from app.providers.kalshi import kalshi_provider
from app.schemas.kalshi import KalshiMarket


def get_markets(
    *,
    category: str | None = None,
    search: str | None = None,
    limit: int = 50,
) -> RankedResponse[KalshiMarket]:
    try:
        markets = kalshi_provider.get_all()
    except Exception as exc:
        raise ProviderError(f"Kalshi provider error: {exc}") from exc

    if category:
        markets = [m for m in markets if m.category.lower() == category.lower()]
    if search:
        q = search.lower()
        markets = [m for m in markets if q in m.title.lower() or q in m.ticker.lower()]

    markets.sort(key=lambda m: m.volume_24h, reverse=True)
    markets = markets[:limit]

    return RankedResponse(
        data=markets,
        total=len(markets),
        meta=make_meta(
            provider=kalshi_provider.source,
            data_freshness="live" if kalshi_provider.source != "demo" else "demo",
            warnings=[] if kalshi_provider.enabled else ["KALSHI_DISABLED"],
        ),
    )


def get_market(market_id: str) -> KalshiMarket:
    market = kalshi_provider.get_one(market_id)
    if not market:
        raise NotFoundError(f"Kalshi market '{market_id}' not found")
    return market


def get_asset_overlays(symbols: list[str]) -> list[KalshiMarket]:
    """Return Kalshi markets relevant to the given asset symbols."""
    return kalshi_provider.get_by_assets(symbols)


def get_categories() -> list[str]:
    return kalshi_provider.get_categories()


def health_check() -> dict:
    return kalshi_provider.health_check()
