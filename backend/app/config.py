from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Market Radar"
    debug: bool = True
    demo_mode: bool = True

    database_url: str = "sqlite:///./market_radar.db"

    # ── Stocks ───────────────────────────────────────────────────────────────
    # Priority: FMP → Alpha Vantage → Twelve Data → demo
    fmp_enabled: bool = False
    fmp_api_key: str = ""

    alpha_vantage_enabled: bool = False
    alpha_vantage_key: str = ""

    twelve_data_enabled: bool = False
    twelve_data_key: str = ""

    # ── Crypto ───────────────────────────────────────────────────────────────
    # Priority: CoinGecko → demo
    coingecko_enabled: bool = False
    coingecko_api_key: str = ""

    # ── Prediction Markets ───────────────────────────────────────────────────
    # Priority: Polymarket → Kalshi → demo
    polymarket_enabled: bool = False
    polymarket_api_key: str = ""

    kalshi_enabled: bool = False
    kalshi_env: str = "demo"              # "demo" | "production"
    kalshi_base_url: str = ""             # override; empty = auto from kalshi_env
    kalshi_api_key_id: str = ""           # key ID (not secret)
    kalshi_private_key_pem: str = ""      # PEM string (newlines as \n in .env)
    kalshi_private_key_path: str = ""     # path to PEM file (alternative to PEM string)
    kalshi_timeout_seconds: float = 10.0

    # ── News ─────────────────────────────────────────────────────────────────
    # Priority: NewsAPI → demo
    newsapi_enabled: bool = False
    newsapi_key: str = ""

    # ── Social (deferred — not yet integrated) ────────────────────────────────
    twitter_enabled: bool = False
    twitter_bearer_token: str = ""

    reddit_enabled: bool = False
    reddit_client_id: str = ""
    reddit_client_secret: str = ""

    # Scoring defaults (overridable via settings page / DB)
    scoring_horizon_days: int = 5
    min_market_cap_stocks: float = 1_000_000_000
    min_liquidity_memecoins: float = 1_000_000
    stock_universe_size: int = 100
    memecoin_universe_size: int = 50
    polymarket_weight: float = 0.10


settings = Settings()
