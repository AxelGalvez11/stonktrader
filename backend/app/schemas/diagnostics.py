from pydantic import BaseModel


class DiagnosticsResult(BaseModel):
    asset_type: str
    period: str
    total_ranked: int
    hit_rate: float          # fraction of top-ranked that had positive returns
    avg_return: float        # average return of top-ranked cohort
    benchmark_return: float  # SPY / BTC return over same period
    alpha: float             # avg_return - benchmark_return
    max_drawdown: float      # worst peak-to-trough in cohort
    sharpe_proxy: float      # avg_return / return_stddev (simplified)
    top_reason_codes: list[str]
    warnings: list[str]
    disclaimer: str
