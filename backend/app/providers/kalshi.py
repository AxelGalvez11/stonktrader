"""
Kalshi data provider.

Auth:   RSA-PSS SHA-256 signed requests
Demo:   static seed data — no credentials needed
Live:   set KALSHI_ENABLED=true + KALSHI_API_KEY_ID + KALSHI_PRIVATE_KEY_PEM (or PATH)

Signing spec (Kalshi v2):
  message  = timestamp_ms + HTTP_METHOD.upper() + path_without_query
  headers  = KALSHI-ACCESS-KEY, KALSHI-ACCESS-TIMESTAMP, KALSHI-ACCESS-SIGNATURE
"""
from __future__ import annotations

import base64
import hashlib
import logging
import time
from urllib.parse import urlparse

import httpx

from app.config import settings
from app.data.demo_data import DEMO_KALSHI_MARKETS, KALSHI_ASSET_MAP
from app.schemas.kalshi import KalshiMarket

log = logging.getLogger(__name__)

_DEMO_BASE  = "https://demo-api.kalshi.co/trade-api/v2"
_LIVE_BASE  = "https://trading-api.kalshi.com/trade-api/v2"


def _load_private_key():
    """Return an RSA private key object or None if not configured."""
    try:
        from cryptography.hazmat.primitives import serialization

        pem = settings.kalshi_private_key_pem.strip()
        if not pem and settings.kalshi_private_key_path:
            with open(settings.kalshi_private_key_path) as fh:
                pem = fh.read().strip()
        if not pem:
            return None
        return serialization.load_pem_private_key(pem.encode(), password=None)
    except Exception as exc:
        log.warning("Kalshi private key load failed: %s", exc)
        return None


def _sign(method: str, path: str, private_key) -> tuple[str, str]:
    """Return (timestamp_ms_str, base64_signature)."""
    from cryptography.hazmat.primitives import hashes
    from cryptography.hazmat.primitives.asymmetric import padding as asym_padding

    timestamp = str(int(time.time() * 1000))
    message   = f"{timestamp}{method.upper()}{path}".encode()
    sig_bytes = private_key.sign(
        message,
        asym_padding.PSS(
            mgf=asym_padding.MGF1(hashes.SHA256()),
            salt_length=asym_padding.PSS.DIGEST_LENGTH,
        ),
        hashes.SHA256(),
    )
    return timestamp, base64.b64encode(sig_bytes).decode()


def _path_only(url: str) -> str:
    """Strip query string so we sign only the path component."""
    return urlparse(url).path


class KalshiProvider:
    def __init__(self):
        self._key = None   # loaded lazily

    @property
    def enabled(self) -> bool:
        return settings.kalshi_enabled

    @property
    def source(self) -> str:
        if not self.enabled or settings.demo_mode:
            return "demo"
        return settings.kalshi_env   # "demo" | "production"

    @property
    def _base_url(self) -> str:
        return _LIVE_BASE if settings.kalshi_env == "production" else _DEMO_BASE

    def _get_private_key(self):
        if self._key is None:
            self._key = _load_private_key()
        return self._key

    def _headers(self, method: str, path: str) -> dict:
        pk = self._get_private_key()
        if not pk or not settings.kalshi_api_key_id:
            raise ValueError("Kalshi API key ID or private key not configured.")
        timestamp, sig = _sign(method, path, pk)
        return {
            "KALSHI-ACCESS-KEY":       settings.kalshi_api_key_id,
            "KALSHI-ACCESS-TIMESTAMP": timestamp,
            "KALSHI-ACCESS-SIGNATURE": sig,
            "Content-Type":            "application/json",
        }

    def _get(self, path: str, params: dict | None = None) -> dict:
        signed_path = _path_only(path)
        headers = self._headers("GET", signed_path)
        url = f"{self._base_url}{path}"
        with httpx.Client(timeout=settings.kalshi_timeout_seconds) as client:
            resp = client.get(url, headers=headers, params=params)
            resp.raise_for_status()
            return resp.json()

    # ── public API ────────────────────────────────────────────────────────

    def get_all(self) -> list[KalshiMarket]:
        if settings.demo_mode or not self.enabled:
            return self._demo_markets()
        return self._fetch_live_markets()

    def get_one(self, market_id: str) -> KalshiMarket | None:
        return next((m for m in self.get_all() if m.id == market_id), None)

    def get_by_assets(self, symbols: list[str]) -> list[KalshiMarket]:
        """Return markets related to any of the given asset symbols."""
        all_markets = {m.id: m for m in self.get_all()}
        seen: set[str] = set()
        result: list[KalshiMarket] = []
        for sym in symbols:
            for mkt_id in KALSHI_ASSET_MAP.get(sym.upper(), []):
                if mkt_id not in seen and mkt_id in all_markets:
                    seen.add(mkt_id)
                    result.append(all_markets[mkt_id])
        return result

    def get_categories(self) -> list[str]:
        return sorted({m.category for m in self.get_all()})

    def health_check(self) -> dict:
        """Light connectivity test — returns {ok, latency_ms, source}."""
        if settings.demo_mode or not self.enabled:
            return {"ok": True, "latency_ms": 0, "source": "demo"}
        start = time.monotonic()
        try:
            self._get("/markets", params={"limit": 1})
            latency = round((time.monotonic() - start) * 1000, 1)
            return {"ok": True, "latency_ms": latency, "source": self.source}
        except Exception as exc:
            return {"ok": False, "latency_ms": None, "source": self.source, "error": str(exc)}

    # ── private helpers ───────────────────────────────────────────────────

    def _demo_markets(self) -> list[KalshiMarket]:
        return [KalshiMarket(**m, source="demo") for m in DEMO_KALSHI_MARKETS]

    def _fetch_live_markets(self) -> list[KalshiMarket]:
        # INTEGRATION POINT ──────────────────────────────────────────────
        # GET /markets?status=open&limit=100
        # Map Kalshi market fields to KalshiMarket schema.
        #
        # Kalshi market fields (v2):
        #   ticker, title, subtitle, category, series_ticker, status,
        #   yes_bid, yes_ask, last_price, volume, volume_24h, ...
        #
        # yes_price = (yes_bid + yes_ask) / 2 / 100  (cents → 0-1)
        # ─────────────────────────────────────────────────────────────────
        try:
            data = self._get("/markets", params={"status": "open", "limit": 100})
            raw_markets = data.get("markets", [])
            result = []
            for m in raw_markets:
                yes_bid = m.get("yes_bid", 50)
                yes_ask = m.get("yes_ask", 50)
                yes_price = round(((yes_bid + yes_ask) / 2) / 100, 3)
                result.append(KalshiMarket(
                    id=m["id"],
                    ticker=m.get("ticker", m["id"]),
                    title=m.get("title", ""),
                    subtitle=m.get("subtitle"),
                    category=m.get("category", "General"),
                    series_ticker=m.get("series_ticker"),
                    status=m.get("status", "open"),
                    yes_price=yes_price,
                    no_price=round(1 - yes_price, 3),
                    volume=float(m.get("volume", 0)),
                    volume_24h=float(m.get("volume_24h", 0)),
                    price_change_24h=0.0,
                    close_time=m.get("close_time"),
                    source=self.source,
                ))
            return result
        except Exception as exc:
            log.error("Kalshi live fetch failed: %s", exc)
            raise


kalshi_provider = KalshiProvider()
