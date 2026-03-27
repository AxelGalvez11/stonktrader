import json
import time
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.security import mask_secret, is_configured
from app.models.integration import IntegrationModel
from app.schemas.integrations import IntegrationRead, IntegrationUpdate, IntegrationTestResult

# ── Provider catalog ──────────────────────────────────────────────────────────
# Priority for provider selection:
#   Stocks:     FMP → Alpha Vantage → Twelve Data → demo
#   Crypto:     CoinGecko → demo
#   Prediction: Polymarket → Kalshi → demo
#   News:       NewsAPI → demo

_CATALOG: list[dict] = [
    {
        "name": "fmp",
        "display_name": "Financial Modeling Prep",
        "description": "Premium stock fundamentals, earnings calendar, SEC filings, and real-time quotes.",
        "features": ["Stocks (primary)", "Earnings dates", "Fundamentals"],
        "demo_available": True,
        "deferred": False,
        "api_key_label": "API Key",
        "config_fields": [],
    },
    {
        "name": "alpha_vantage",
        "display_name": "Alpha Vantage",
        "description": "Stock time-series and OHLCV data. Used as fallback when FMP is not configured.",
        "features": ["Stocks (fallback)", "OHLCV history"],
        "demo_available": True,
        "deferred": False,
        "api_key_label": "API Key",
        "config_fields": [],
    },
    {
        "name": "twelve_data",
        "display_name": "Twelve Data",
        "description": "Real-time stock quotes and technical indicators. Second fallback for stock data.",
        "features": ["Stocks (2nd fallback)", "Real-time quotes"],
        "demo_available": True,
        "deferred": False,
        "api_key_label": "API Key",
        "config_fields": [],
    },
    {
        "name": "coingecko",
        "display_name": "CoinGecko",
        "description": "Crypto market data — price, volume, market cap, trending coins.",
        "features": ["Crypto (primary)", "Meme coins", "DeFi"],
        "demo_available": True,
        "deferred": False,
        "api_key_label": "API Key",
        "config_fields": [],
    },
    {
        "name": "polymarket",
        "display_name": "Polymarket",
        "description": "Prediction market probabilities for macro and sector events.",
        "features": ["Prediction markets (primary)", "Macro signals"],
        "demo_available": True,
        "deferred": False,
        "api_key_label": "API Key",
        "config_fields": [],
    },
    {
        "name": "kalshi",
        "display_name": "Kalshi",
        "description": "Prediction market signals — event odds for Fed, macro, earnings, crypto. Uses RSA-PSS auth.",
        "features": ["Prediction markets (fallback)", "Fed/macro events"],
        "demo_available": True,
        "deferred": False,
        "api_key_label": "Private Key (PEM)",
        "config_fields": [
            {"key": "key_id", "label": "Key ID", "hint": "From Kalshi dashboard → API Keys", "secret": False},
        ],
    },
    {
        "name": "newsapi",
        "display_name": "NewsAPI",
        "description": "Financial news headlines and article search for sentiment analysis.",
        "features": ["News sentiment", "Headline analysis"],
        "demo_available": True,
        "deferred": False,
        "api_key_label": "API Key",
        "config_fields": [],
    },
    {
        "name": "twitter",
        "display_name": "Twitter / X",
        "description": "Social sentiment and mention velocity via Twitter API v2. Integration coming soon.",
        "features": ["Social sentiment (planned)"],
        "demo_available": False,
        "deferred": True,
        "api_key_label": "Bearer Token",
        "config_fields": [],
    },
    {
        "name": "reddit",
        "display_name": "Reddit",
        "description": "Subreddit mention aggregation for stocks and crypto. Integration coming soon.",
        "features": ["Social sentiment (planned)"],
        "demo_available": False,
        "deferred": True,
        "api_key_label": "Client Secret",
        "config_fields": [
            {"key": "client_id", "label": "Client ID", "hint": "From Reddit app settings", "secret": False},
        ],
    },
]

# Fields seeded to the DB model (only columns that exist on IntegrationModel)
_MODEL_FIELDS = {"name", "display_name", "description"}

# Lookup by name for merging catalog metadata into reads
_CATALOG_MAP: dict[str, dict] = {entry["name"]: entry for entry in _CATALOG}


def _to_read(row: IntegrationModel) -> IntegrationRead:
    try:
        config = json.loads(row.config_json or "{}")
    except json.JSONDecodeError:
        config = {}
    cat = _CATALOG_MAP.get(row.name, {})
    return IntegrationRead(
        name=row.name,
        display_name=row.display_name,
        description=row.description,
        enabled=row.enabled,
        api_key_masked=row.api_key_masked,
        status=row.status,
        config=config,
        last_tested_at=row.last_tested_at,
        error_message=row.error_message,
        features=cat.get("features", []),
        demo_available=cat.get("demo_available", True),
        deferred=cat.get("deferred", False),
        api_key_label=cat.get("api_key_label", "API Key"),
        config_fields=cat.get("config_fields", []),
    )


def init_integrations(db: Session) -> None:
    """Seed integration registry on first run (idempotent)."""
    for entry in _CATALOG:
        if not db.query(IntegrationModel).filter(IntegrationModel.name == entry["name"]).first():
            model_data = {k: v for k, v in entry.items() if k in _MODEL_FIELDS}
            db.add(IntegrationModel(**model_data))
    db.commit()


def list_integrations(db: Session) -> list[IntegrationRead]:
    # Return in catalog order, not alphabetical
    catalog_order = [e["name"] for e in _CATALOG]
    rows = db.query(IntegrationModel).all()
    row_map = {r.name: r for r in rows}
    return [_to_read(row_map[name]) for name in catalog_order if name in row_map]


def update_integration(db: Session, name: str, payload: IntegrationUpdate) -> IntegrationRead:
    row = db.query(IntegrationModel).filter(IntegrationModel.name == name).first()
    if not row:
        raise NotFoundError(f"Integration '{name}' not found")

    if payload.enabled is not None:
        row.enabled = payload.enabled
    if payload.api_key is not None:
        row.api_key_masked = mask_secret(payload.api_key)
        row.status = "configured" if is_configured(payload.api_key) else "unconfigured"
    if payload.config:
        row.config_json = json.dumps(payload.config)

    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return _to_read(row)


def test_integration(db: Session, name: str) -> IntegrationTestResult:
    row = db.query(IntegrationModel).filter(IntegrationModel.name == name).first()
    if not row:
        raise NotFoundError(f"Integration '{name}' not found")

    start = time.monotonic()
    success = False
    error_msg = None

    if name == "kalshi":
        from app.services.kalshi import health_check as kalshi_health
        result = kalshi_health()
        success = result.get("ok", False)
        latency = result.get("latency_ms") or round((time.monotonic() - start) * 1000, 2)
        if not success:
            error_msg = result.get("error", "Kalshi health check failed.")
    else:
        # Generic: pass if configured
        success = row.status in ("configured",)
        latency = round((time.monotonic() - start) * 1000, 2)
        if not success:
            error_msg = "Integration not configured — add an API key first."

    row.last_tested_at = datetime.now(timezone.utc)
    row.error_message = None if success else error_msg
    db.commit()

    return IntegrationTestResult(
        success=success,
        message="Connection successful." if success else (error_msg or "Not configured."),
        latency_ms=latency,
    )
