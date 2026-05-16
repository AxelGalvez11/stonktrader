# Phase 1.9 Post-Event Review Workflow

## Purpose
Turn the app into a reasoning training loop for biotech paper-trading theses.

## Added capabilities
- `/review` page for open, closed-unreviewed, awaiting-review, and reviewed trades.
- Manual review form linked to a paper trade.
- Local rule-based review analyzer (no external AI/provider required).
- Trade review cards separating scientific vs market vs risk-management accuracy.
- API CRUD for trade reviews.
- Paper trade lifecycle states: `open` -> `closed_unreviewed` -> `reviewed`.

## Safety posture
- Educational and paper-trading-only language.
- No live trading, no broker execution, no certainty claims.
- Missing evidence is represented as `"missing"`.
