import json
import time
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.security import mask_secret, is_configured
from app.models.integration import IntegrationModel
from app.schemas.integrations import IntegrationRead, IntegrationUpdate, IntegrationTestResult

_CATALOG: list[dict] = [
    {"name": "alpha_vantage", "display_name": "Alpha Vantage",
     "description": "Real-time & historical stock data (OHLCV, fundamentals)."},
    {"name": "coingecko",    "display_name": "CoinGecko",
     "description": "Crypto market data — price, volume, market cap, trending coins."},
    {"name": "polymarket",   "display_name": "Polymarket",
     "description": "Prediction market probabilities for macro and sector events."},
    {"name": "twitter",      "display_name": "Twitter / X",
     "description": "Social sentiment and mention velocity via Twitter API v2."},
    {"name": "reddit",       "display_name": "Reddit",
     "description": "Subreddit mention aggregation for stocks and crypto."},
]


def _to_read(row: IntegrationModel) -> IntegrationRead:
    try:
        config = json.loads(row.config_json or "{}")
    except json.JSONDecodeError:
        config = {}
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
    )


def init_integrations(db: Session) -> None:
    """Seed integration registry on first run (idempotent)."""
    for entry in _CATALOG:
        if not db.query(IntegrationModel).filter(IntegrationModel.name == entry["name"]).first():
            db.add(IntegrationModel(**entry))
    db.commit()


def list_integrations(db: Session) -> list[IntegrationRead]:
    rows = db.query(IntegrationModel).order_by(IntegrationModel.name).all()
    return [_to_read(r) for r in rows]


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
    # Demo: all integrations "pass" in demo mode — real test would ping the API
    success = row.status in ("configured",)
    latency = round((time.monotonic() - start) * 1000, 2)

    row.last_tested_at = datetime.now(timezone.utc)
    if success:
        row.error_message = None
    else:
        row.error_message = "Integration not configured — add an API key first."
    db.commit()

    return IntegrationTestResult(
        success=success,
        message="Connection successful." if success else "Not configured.",
        latency_ms=latency,
    )
