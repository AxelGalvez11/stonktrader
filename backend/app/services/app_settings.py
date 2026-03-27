import json
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.config import settings as app_config
from app.models.app_settings import AppSettingModel

_DEFAULTS: dict[str, object] = {
    "scoring_horizon_days":     app_config.scoring_horizon_days,
    "min_market_cap_stocks":    app_config.min_market_cap_stocks,
    "min_liquidity_memecoins":  app_config.min_liquidity_memecoins,
    "stock_universe_size":      app_config.stock_universe_size,
    "memecoin_universe_size":   app_config.memecoin_universe_size,
    "polymarket_weight":        app_config.polymarket_weight,
    "demo_mode":                app_config.demo_mode,
}


def init_settings(db: Session) -> None:
    """Seed default values on first run (idempotent)."""
    for key, val in _DEFAULTS.items():
        if not db.query(AppSettingModel).filter(AppSettingModel.key == key).first():
            db.add(AppSettingModel(key=key, value=json.dumps(val)))
    db.commit()


def get_settings(db: Session) -> dict:
    rows = db.query(AppSettingModel).all()
    result = dict(_DEFAULTS)
    for row in rows:
        try:
            result[row.key] = json.loads(row.value)
        except json.JSONDecodeError:
            result[row.key] = row.value
    return result


def update_settings(db: Session, updates: dict) -> dict:
    allowed = set(_DEFAULTS.keys())
    for key, val in updates.items():
        if key not in allowed:
            continue
        row = db.query(AppSettingModel).filter(AppSettingModel.key == key).first()
        if row:
            row.value = json.dumps(val)
            row.updated_at = datetime.now(timezone.utc)
        else:
            db.add(AppSettingModel(key=key, value=json.dumps(val)))
    db.commit()
    return get_settings(db)
