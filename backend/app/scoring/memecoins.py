"""
Meme coin scoring engine — pure function, no I/O.

Attention/momentum/liquidity model → ScoreResult with sub-scores for
opportunity, tradability, and risk.
"""
from app.schemas.memecoins import MemeCoinRaw
from app.scoring.base import ScoreResult, normalize, compute_confidence

WEIGHTS: dict[str, float] = {
    "attention_velocity": 0.20,
    "sentiment":          0.20,
    "mom_24h":            0.15,
    "mom_1h":             0.10,
    "volume_growth":      0.10,
    "liquidity":          0.15,
    "rug_safety":         0.10,   # inverted rug_risk_score
}

_REASON_MAP: dict[str, tuple[str, float]] = {
    "VIRAL_MOMENTUM":    ("attention_velocity", 0.75),
    "STRONG_SENTIMENT":  ("sentiment",          0.70),
    "PRICE_SURGE_24H":   ("mom_24h",            0.70),
    "VOLUME_SPIKE":      ("volume_growth",      0.75),
    "GOOD_LIQUIDITY":    ("liquidity",          0.65),
    "LOW_RUG_RISK":      ("rug_safety",         0.70),
    "RECENT_PUMP_1H":    ("mom_1h",             0.75),
}


def score_memecoin(raw: MemeCoinRaw) -> ScoreResult:
    factors = {
        "attention_velocity": normalize(raw.mention_growth_24h, -0.5,  8.0),
        "sentiment":          normalize(raw.sentiment_score,    -1.0,  1.0),
        "mom_24h":            normalize(raw.return_24h,        -0.40,  1.50),
        "mom_1h":             normalize(raw.return_1h,         -0.10,  0.30),
        "volume_growth":      normalize(raw.volume_change_24h,  0.0,   6.0),
        "liquidity":          normalize(raw.liquidity_score,    0.0, 100.0),
        "rug_safety":         1.0 - normalize(raw.rug_risk_score, 0.0, 100.0),
    }

    composite = round(sum(factors[k] * WEIGHTS[k] for k in WEIGHTS) * 100, 2)

    reason_codes = [
        code for code, (fk, thresh) in _REASON_MAP.items()
        if factors.get(fk, 0) >= thresh
    ]

    warnings: list[str] = []
    if raw.rug_risk_score > 50:
        warnings.append("HIGH_RUG_RISK")
    if raw.liquidity_score < 40:
        warnings.append("LOW_LIQUIDITY")
    if raw.market_cap < 1e7:
        warnings.append("MICRO_CAP")
    if raw.mention_growth_24h > 6.0:
        warnings.append("EXTREME_ATTENTION_SPIKE")
    if raw.return_24h > 1.0:
        warnings.append("EXTREME_MOVE_24H")
    if raw.return_1h > 0.20:
        warnings.append("RAPID_PUMP_1H")
    if raw.return_24h < -0.30:
        warnings.append("SHARP_DUMP_24H")

    confidence = compute_confidence(factors)
    if raw.rug_risk_score > 60:
        confidence = round(confidence * 0.70, 3)

    opportunity_score = round(
        (factors["attention_velocity"] * 0.35 + factors["mom_24h"] * 0.35 + factors["sentiment"] * 0.30) * 100, 2
    )
    tradability_score = round(
        (factors["liquidity"] * 0.60 + factors["rug_safety"] * 0.40) * 100, 2
    )
    # Risk increases with rug_risk, low liquidity, and extreme moves
    risk_score = round(
        min(100.0, raw.rug_risk_score * 0.40
            + (1 - raw.liquidity_score / 100) * 30
            + min(abs(raw.return_24h) * 50, 30)),
        2,
    )

    return ScoreResult(
        composite=composite,
        factors=factors,
        weights=WEIGHTS,
        reason_codes=reason_codes,
        warnings=warnings,
        confidence=confidence,
        opportunity_score=opportunity_score,
        tradability_score=tradability_score,
        risk_score=risk_score,
    )
