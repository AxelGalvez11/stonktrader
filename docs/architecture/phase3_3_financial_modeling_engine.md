# Phase 3.3 Financial Modeling Engine

Adds a biotech valuation model layer for research-only, paper-trading analysis. The engine is **not investment advice**, **not predictive**, and depends heavily on **user-editable assumptions**.

## Model types
- DCF valuation model for profitable/commercial-stage biotech.
- Risk-adjusted pipeline valuation model for clinical-stage/pre-revenue biotech.
- Hybrid valuation model combining operating value plus pipeline value.

## Safety posture
- Public data + user assumptions only.
- No broker APIs, no live trading, no buy/sell recommendations.
- Output language emphasizes uncertainty and assumption sensitivity.

## Data flow
- Inputs from fundamentals, market snapshots, and clinical pipeline context.
- User edits assumptions in ticker workspace.
- Model + scenarios saved to `financial_models` with user-level RLS.
- Financial model can be selected as thesis source (`source_type: financial_model`).
