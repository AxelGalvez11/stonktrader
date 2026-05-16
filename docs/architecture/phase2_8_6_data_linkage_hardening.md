# Phase 2.8.6 — Data Linkage Hardening

## Schema/API linkage audit
Audited linkage expectations across `ai_theses`, `thesis_syntheses`, `catalysts`, `paper_trades`, `trade_reviews`, and `research_notes`.

## Hardening changes
- Added `GET /api/theses?ticker=...` for direct thesis lookup by ticker.
- Thesis save flow now normalizes ticker, persists `catalyst_id`, `source_ids`, `source_summary`, and returns `thesis_id` + stable ticker workspace link.
- Ticker workspace now loads actual `ai_theses` and uses thesis existence (not note existence) for checklist status.
- Added linkage warnings:
  - Paper trade missing thesis link.
  - Synthesis is ticker-level, not thesis-specific.
  - Thesis not linked to catalyst.

## Safety
This is workflow integrity hardening for paper-trading research only.
No broker APIs, no live trading, no predictive claims.
