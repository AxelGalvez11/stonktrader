"""
Diagnostics service — lightweight walk-forward simulation on demo data.

Uses the scoring engine outputs + mock outcome data to produce a simple
backtesting summary. Results are illustrative only; real backtesting
requires point-in-time data and is explicitly noted in the disclaimer.
"""
import statistics

from app.schemas.diagnostics import DiagnosticsResult
from app.scoring.stocks import score_stock
from app.scoring.memecoins import score_memecoin
from app.data.demo_data import DEMO_STOCKS, DEMO_MEMECOINS
from app.schemas.stocks import StockRaw
from app.schemas.memecoins import MemeCoinRaw

_DISCLAIMER = (
    "This backtest uses demo data only and does not account for real-world "
    "slippage, liquidity, or look-ahead bias. Past ranking performance does "
    "not guarantee future results."
)


def get_stock_diagnostics() -> DiagnosticsResult:
    raws = [StockRaw(**s) for s in DEMO_STOCKS]
    scored = [(r, score_stock(r)) for r in raws]
    scored.sort(key=lambda x: x[1].composite, reverse=True)
    top = scored[:5]  # simulate taking top 5 positions

    returns = [r.return_20d for r, _ in top]
    benchmark = 0.028  # SPY 20d return from demo data

    hit_rate = sum(1 for v in returns if v > 0) / len(returns)
    avg_return = statistics.mean(returns)
    max_drawdown = min(returns)
    stddev = statistics.stdev(returns) if len(returns) > 1 else 0.01
    sharpe_proxy = avg_return / stddev if stddev else 0.0

    all_codes: list[str] = []
    for _, s in top:
        all_codes.extend(s.reason_codes)
    from collections import Counter
    top_codes = [c for c, _ in Counter(all_codes).most_common(5)]

    return DiagnosticsResult(
        asset_type="stock",
        period="20d (demo)",
        total_ranked=len(raws),
        hit_rate=round(hit_rate, 3),
        avg_return=round(avg_return, 4),
        benchmark_return=benchmark,
        alpha=round(avg_return - benchmark, 4),
        max_drawdown=round(max_drawdown, 4),
        sharpe_proxy=round(sharpe_proxy, 3),
        top_reason_codes=top_codes,
        warnings=["DEMO_DATA_ONLY", "NO_TRANSACTION_COSTS"],
        disclaimer=_DISCLAIMER,
    )


def get_memecoin_diagnostics() -> DiagnosticsResult:
    raws = [MemeCoinRaw(**c) for c in DEMO_MEMECOINS]
    scored = [(r, score_memecoin(r)) for r in raws]
    scored.sort(key=lambda x: x[1].composite, reverse=True)
    top = scored[:5]

    returns = [r.return_24h for r, _ in top]
    benchmark = 0.038  # DOGE 24h from demo data

    hit_rate = sum(1 for v in returns if v > 0) / len(returns)
    avg_return = statistics.mean(returns)
    max_drawdown = min(returns)
    stddev = statistics.stdev(returns) if len(returns) > 1 else 0.01
    sharpe_proxy = avg_return / stddev if stddev else 0.0

    all_codes: list[str] = []
    for _, s in top:
        all_codes.extend(s.reason_codes)
    from collections import Counter
    top_codes = [c for c, _ in Counter(all_codes).most_common(5)]

    return DiagnosticsResult(
        asset_type="memecoin",
        period="24h (demo)",
        total_ranked=len(raws),
        hit_rate=round(hit_rate, 3),
        avg_return=round(avg_return, 4),
        benchmark_return=benchmark,
        alpha=round(avg_return - benchmark, 4),
        max_drawdown=round(max_drawdown, 4),
        sharpe_proxy=round(sharpe_proxy, 3),
        top_reason_codes=top_codes,
        warnings=["DEMO_DATA_ONLY", "MEME_COIN_LIQUIDITY_RISK", "NO_TRANSACTION_COSTS"],
        disclaimer=_DISCLAIMER,
    )
