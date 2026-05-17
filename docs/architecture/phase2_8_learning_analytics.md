# Phase 2.8 — Learning Analytics Dashboard

This phase adds a learning analytics layer based on observed paper-trade history only.
It is for reflection and process improvement, not predictive modeling.

## Added route
- `GET /api/analytics/learning`

## Added page
- `/analytics`

## Implemented metrics
- overview: trade counts, review states, average thesis quality score, average result %, win rate, result by readiness label
- mistake patterns: category counts, top recurring categories, recent examples, future rules
- risk blind spots: dilution, safety, endpoint/trial, run-up/pricing-in, liquidity, regulatory, mechanism/science
- thesis quality analysis: score/readiness distributions and result associations observed in your paper-trade history
- catalyst type analysis: average result and common mistakes by catalyst type
- alert-to-review associations: observed mapping between prior alerts and later review mistake themes

## Learning recommendations
Rule-based learning recommendations are generated from repeated patterns (e.g., dilution misses, run-up risk misses).
Recommendations are phrased as learning actions and are not predictive.

## Safety language
- paper-trade history
- observed pattern
- learning recommendation
- not predictive

No broker APIs, no live trading, no buy/sell recommendations.

## Current limitations
- associations are heuristic and dependent on linkage quality across trades, catalysts, reviews, and syntheses
- sparse review history reduces confidence of observed patterns
- alert matching uses rule-based text/category mapping, not causal inference
