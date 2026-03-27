"""
Polymarket data provider.

Demo mode  → static seed data
Live mode  → hook: implement _fetch_live() with Polymarket REST API
"""
from app.config import settings
from app.data.demo_data import DEMO_POLYMARKET_SIGNALS
from app.schemas.polymarket import PolymarketSignal


class PolymarketProvider:
    @property
    def name(self) -> str:
        return "demo" if settings.demo_mode else "live"

    def get_all(self) -> list[PolymarketSignal]:
        if settings.demo_mode:
            return [PolymarketSignal(**s) for s in DEMO_POLYMARKET_SIGNALS]
        return self._fetch_live()

    def get_one(self, market_id: str) -> PolymarketSignal | None:
        return next((s for s in self.get_all() if s.id == market_id), None)

    def get_categories(self) -> list[str]:
        return sorted({s.category for s in self.get_all()})

    def _fetch_live(self) -> list[PolymarketSignal]:
        # INTEGRATION POINT ──────────────────────────────────────────────
        # Polymarket CLOB API: https://docs.polymarket.com
        #
        # import httpx
        # r = httpx.get("https://clob.polymarket.com/markets",
        #               headers={"Authorization": f"Bearer {settings.polymarket_api_key}"})
        # markets = r.json()["data"]
        # ... map to PolymarketSignal list
        # ─────────────────────────────────────────────────────────────────
        raise NotImplementedError(
            "Live Polymarket provider not configured. Set DEMO_MODE=true in .env "
            "or implement _fetch_live() in providers/polymarket.py."
        )


polymarket_provider = PolymarketProvider()
