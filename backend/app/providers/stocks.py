"""
Stock data provider.

Demo mode  → returns static seed data from demo_data.py
Live mode  → hook: implement _fetch_live() with yfinance or Alpha Vantage
"""
from app.config import settings
from app.data.demo_data import DEMO_STOCKS
from app.schemas.stocks import StockRaw


class StockProvider:
    @property
    def name(self) -> str:
        return "demo" if settings.demo_mode else "live"

    def get_all(self) -> list[StockRaw]:
        if settings.demo_mode:
            return [StockRaw(**s) for s in DEMO_STOCKS]
        return self._fetch_live()

    def get_one(self, symbol: str) -> StockRaw | None:
        return next((s for s in self.get_all() if s.symbol == symbol.upper()), None)

    def _fetch_live(self) -> list[StockRaw]:
        # INTEGRATION POINT ──────────────────────────────────────────────
        # Uncomment and install: pip install yfinance
        #
        # import yfinance as yf
        # symbols = ["NVDA", "AMD", "PLTR", ...]
        # raw = yf.download(symbols, period="3mo", auto_adjust=True)
        # ... map to StockRaw list
        #
        # Or use Alpha Vantage:
        #   endpoint = "https://www.alphavantage.co/query"
        #   params = {"function": "TIME_SERIES_DAILY", "symbol": sym,
        #             "apikey": settings.alpha_vantage_key}
        # ─────────────────────────────────────────────────────────────────
        raise NotImplementedError(
            "Live stock provider not configured. Set DEMO_MODE=true in .env "
            "or implement _fetch_live() in providers/stocks.py."
        )


stock_provider = StockProvider()
