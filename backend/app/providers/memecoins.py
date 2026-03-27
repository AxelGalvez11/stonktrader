"""
Meme coin data provider.

Demo mode  → static seed data
Live mode  → hook: implement _fetch_live() with CoinGecko or CCXT
"""
from app.config import settings
from app.data.demo_data import DEMO_MEMECOINS
from app.schemas.memecoins import MemeCoinRaw


class MemeCoinProvider:
    @property
    def name(self) -> str:
        return "demo" if settings.demo_mode else "live"

    def get_all(self) -> list[MemeCoinRaw]:
        if settings.demo_mode:
            return [MemeCoinRaw(**c) for c in DEMO_MEMECOINS]
        return self._fetch_live()

    def get_one(self, symbol: str) -> MemeCoinRaw | None:
        return next((c for c in self.get_all() if c.symbol == symbol.upper()), None)

    def _fetch_live(self) -> list[MemeCoinRaw]:
        # INTEGRATION POINT ──────────────────────────────────────────────
        # pip install pycoingecko
        #
        # from pycoingecko import CoinGeckoAPI
        # cg = CoinGeckoAPI()
        # markets = cg.get_coins_markets(vs_currency="usd", category="meme-token",
        #                                 per_page=50, price_change_percentage="1h,24h")
        # ... map to MemeCoinRaw list
        # ─────────────────────────────────────────────────────────────────
        raise NotImplementedError(
            "Live memecoin provider not configured. Set DEMO_MODE=true in .env "
            "or implement _fetch_live() in providers/memecoins.py."
        )


memecoin_provider = MemeCoinProvider()
