# Biotech Research Assistant – Phase 1.5 Implementation Notes

## What changed
- Replaced mock-only flows with Supabase-backed watchlist/catalyst/thesis/paper-trade workflows.
- Added runtime validators for thesis JSON and risk-gated paper trades.
- Added ticker detail page with editable catalyst list.
- Kept all external fetchers mocked as placeholders.

## Runtime model
- App reads Supabase URL/key from `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- If env is missing or Supabase request fails, pages show error and mock fallback where safe.
- All paper trade submissions pass risk-engine checks before insert.

## Safety
- Research-only and paper-trading-only warnings remain visible in dashboard and thesis flows.
- Thesis validator requires explicit `fact_assumption_interpretation` separation and source list.
- Missing data is preserved as `"missing"` rather than fabricated.
