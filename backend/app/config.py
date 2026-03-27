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

    # Optional API keys — not required in demo mode
    alpha_vantage_key: str = ""
    coingecko_api_key: str = ""
    polymarket_api_key: str = ""
    twitter_bearer_token: str = ""
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
