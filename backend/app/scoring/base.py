from dataclasses import dataclass, field


@dataclass
class ScoreResult:
    """
    Output of any scoring function.

    All scoring functions are pure: they accept raw asset data and return a
    ScoreResult. No I/O, no side effects.
    """
    composite: float                   # 0–100 overall rank score
    factors: dict[str, float]          # per-factor normalised scores (0–1)
    weights: dict[str, float]          # weights used (sums to 1.0)
    reason_codes: list[str]            # e.g. ["STRONG_MOMENTUM", "HIGH_VOLUME"]
    warnings: list[str]                # e.g. ["EARNINGS_PROXIMITY", "HIGH_VOLATILITY"]
    confidence: float                  # 0–1, based on signal agreement + data completeness

    # Stock-specific (default 0.5 = neutral for non-stocks)
    prob_positive_5d: float = 0.50
    prob_beat_spy: float = 0.50

    # Meme-coin-specific (0.0 for stocks)
    opportunity_score: float = 0.0
    tradability_score: float = 0.0
    risk_score: float = 0.0


# ── Pure utility functions ────────────────────────────────────────────────

def normalize(value: float, min_val: float, max_val: float) -> float:
    """Clamp-and-normalize value to [0, 1]."""
    if max_val <= min_val:
        return 0.5
    return max(0.0, min(1.0, (value - min_val) / (max_val - min_val)))


def compute_confidence(
    factors: dict[str, float],
    data_completeness: float = 1.0,
) -> float:
    """
    Confidence = weighted combination of:
      - signal agreement (fraction of factors > 0.5)
      - data completeness (1.0 for demo/full data, lower for partial feeds)
    Clamped to [0.15, 0.95].
    """
    if not factors:
        return 0.30
    positive = sum(1 for v in factors.values() if v > 0.5)
    agreement = positive / len(factors)
    raw = 0.35 + 0.45 * agreement + 0.20 * data_completeness
    return round(min(0.95, max(0.15, raw)), 3)
