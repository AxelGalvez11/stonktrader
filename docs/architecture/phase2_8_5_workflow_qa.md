# Phase 2.8.5 — Real-Use QA and Workflow Friction Audit

## Seed/dev support
- Added `scripts/seed_biotech_watchlist.mjs` for QA tickers:
  - VRTX, REGN, GILD, AMGN, VKTX, BEAM, CRSP, ALT, NUVL, IDYA

## Workflow friction fixes
- Added ticker workspace checklist and next-best-action helper.
- Added clearer empty-state guidance for ClinicalTrials, PubMed, FDA, catalysts.
- Added quick handoff links from ticker workspace to thesis builder, paper trades, review, and analytics.

## Checklist behavior
Tracks:
- watchlist
- SEC fetched
- ClinicalTrials fetched
- PubMed saved
- FDA saved
- market refreshed
- catalyst exists
- thesis exists
- synthesis exists
- paper trade optional
- review optional

## Next-best-action examples
- Fetch SEC filings to check dilution risk.
- Add a catalyst before building a thesis.
- Run synthesis before creating a paper trade.
- Enter catalyst outcome to unlock review.

## Safety
- Paper-trading only workflow QA
- Observed workflow reliability improvements
- Not predictive, no buy/sell recommendations
