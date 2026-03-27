"""
Stock scoring engine — pure function, no I/O.

Weighted factor model → ScoreResult (composite 0-100, factor breakdown,
reason codes, warnings, confidence, probability estimates).
"""
from app.schemas.stocks import StockRaw
from app.scoring.base import ScoreResult, normalize, compute_confidence

WEIGHTS: dict[str, float] = {
    "mom_5d":    0.10,
    "mom_20d":   0.15,
    "mom_60d":   0.15,
    "rel_volume": 0.15,
    "volatility": 0.15,   # inverted: low vol = higher score
    "ma_distance": 0.10,
    "sentiment": 0.10,
    "sector_rs": 0.10,
}

# (factor_key, min_threshold_to_fire)
_REASON_MAP: dict[str, tuple[str, float]] = {
    "STRONG_MOMENTUM":      ("mom_20d",    0.70),
    "RECENT_BREAKOUT":      ("mom_5d",     0.75),
    "LONG_TERM_TREND":      ("mom_60d",    0.70),
    "ABNORMAL_VOLUME":      ("rel_volume", 0.75),
    "ABOVE_50D_MA":         ("ma_distance", 0.65),
    "POSITIVE_SENTIMENT":   ("sentiment",  0.65),
    "SECTOR_LEADER":        ("sector_rs",  0.70),
    "LOW_VOLATILITY":       ("volatility", 0.70),
}


def score_stock(raw: StockRaw) -> ScoreResult:
    factors = {
        "mom_5d":      normalize(raw.return_5d,       -0.10,  0.10),
        "mom_20d":     normalize(raw.return_20d,      -0.20,  0.20),
        "mom_60d":     normalize(raw.return_60d,      -0.30,  0.30),
        "rel_volume":  normalize(raw.rel_volume,       0.50,  3.00),
        "volatility":  1.0 - normalize(raw.volatility_30d, 0.10, 0.80),
        "ma_distance": normalize(raw.ma_distance_50d, -0.15,  0.15),
        "sentiment":   normalize(raw.sentiment_score, -1.00,  1.00),
        "sector_rs":   normalize(raw.sector_rs_score,  0.00, 100.0),
    }

    composite = round(sum(factors[k] * WEIGHTS[k] for k in WEIGHTS) * 100, 2)

    reason_codes = [
        code for code, (fk, thresh) in _REASON_MAP.items()
        if factors.get(fk, 0) >= thresh
    ]

    warnings: list[str] = []
    if raw.days_to_earnings is not None and raw.days_to_earnings <= 7:
        warnings.append("EARNINGS_PROXIMITY")
    if raw.volatility_30d > 0.60:
        warnings.append("HIGH_VOLATILITY")
    if raw.rel_volume > 2.5:
        warnings.append("UNUSUAL_VOLUME")
    if factors["mom_5d"] > 0.85 and factors["mom_20d"] > 0.75:
        warnings.append("POTENTIAL_OVEREXTENSION")
    if raw.return_20d < -0.15:
        warnings.append("DOWNTREND")

    confidence = compute_confidence(factors)
    if "EARNINGS_PROXIMITY" in warnings:
        confidence = round(confidence * 0.80, 3)

    norm = composite / 100.0
    prob_positive_5d = round(max(0.10, min(0.90, 0.35 + 0.55 * norm)), 3)
    prob_beat_spy    = round(max(0.10, min(0.85, 0.30 + 0.50 * norm)), 3)

    return ScoreResult(
        composite=composite,
        factors=factors,
        weights=WEIGHTS,
        reason_codes=reason_codes,
        warnings=warnings,
        confidence=confidence,
        prob_positive_5d=prob_positive_5d,
        prob_beat_spy=prob_beat_spy,
    )
