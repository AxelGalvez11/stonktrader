from pydantic import BaseModel


class KalshiMarket(BaseModel):
    id: str
    ticker: str
    title: str
    subtitle: str | None = None
    category: str
    series_ticker: str | None = None
    status: str                      # open | closed | settled
    yes_price: float                 # 0–1 implied probability
    no_price: float
    volume: float
    volume_24h: float
    price_change_24h: float          # delta in yes_price over 24 h
    close_time: str | None = None
    related_assets: list[str] = []   # stock tickers or themes
    linked_theme: str = ""
    notes: str = ""
    source: str = "demo"             # demo | live
