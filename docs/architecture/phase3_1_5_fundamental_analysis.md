# Phase 3.1.5 — Fundamental Analysis Layer

Adds biotech-focused fundamental research for paper-trading analysis using observed public financial data.

## Company types
- profitable_biotech
- commercial_stage_biotech
- pre_revenue_clinical_biotech
- platform_biotech
- unknown

## APIs
- `GET /api/fundamentals?ticker=...`
- `POST /api/fundamentals/analyze`

## Safety language
- fundamental research
- paper-trading analysis
- not investment advice
- observed public financial data
- approximate where data is incomplete

## Notes
- Missing fields are explicitly marked as `missing`.
- No buy/sell recommendations are generated.
