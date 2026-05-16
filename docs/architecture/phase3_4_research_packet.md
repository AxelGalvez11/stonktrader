# Phase 3.4 One-Click Biotech Research Packet

This phase adds a one-click **research packet** on ticker workspace for **paper-trading analysis**. It is **not investment advice**, **not predictive**, and based on **public-source research** plus user-editable assumptions.

## Workflow
The packet orchestrates SEC, market, fundamentals, financial model, clinical trials, PubMed, FDA, catalyst inference, source snapshots, summary, optional draft thesis, and optional synthesis.

## Safety
- No broker APIs or live trading.
- No buy/sell recommendations.
- Output includes missing-data and warning sections.
- Users should **review before using in thesis**.


## Test strategy
- Added orchestrator harness tests using `orchestratorCore.js` (relative-import friendly) while app imports continue via `orchestrator.js`.
- Added route-level harness tests through `routeHandler.js` with injected auth/rate-limit/orchestrator dependencies.
- Coverage includes partial-failure behavior, validation, and safe response shape checks.

## Known limitations
- UI rendering tests for the ticker panel are not yet included in this Node test harness (no React component test stack in current suite).
