# Research Packet Real Ticker QA (Phase 3.4.2)

Date: 2026-05-16 (UTC)

## Scope
Tickers tested: `VRTX`, `REGN`, `GILD`, `VKTX`, `CRSP`.

Execution method:
1. Started app locally with `ALLOW_DEV_AUTH=true DEV_USER_ID=00000000-0000-0000-0000-000000000000 npm run dev`.
2. Called `POST /api/research-packet` for each ticker with:
   - `createSourceSnapshots=false`
   - `createDraftThesis=true`
   - `runSynthesis=true`
3. Collected packet outputs and summarized quality issues.

## Per-ticker QA summary

### VRTX
- Company type detected: `unknown`
- Packet status: `partial`
- Useful records found: fundamentals object generated
- Irrelevant records: none returned (query fallback used)
- Missing data: SEC, market, clinical trials, PubMed, FDA, valuation assumptions
- Provider failures: market refresh returned `fetch failed`; SEC/clinical/pubmed/fda all empty
- Source snapshots: skipped (0 by run option)
- Thesis draft notes: failed (`Select at least one source before drafting`)
- Synthesis notes: partial (`Missing thesis input`)
- Recommended fixes:
  - Ensure market/SEC provider config is available in dev QA environment
  - Preload source snapshots before draft-thesis branch when createDraftThesis=true

### REGN
- Company type detected: `unknown`
- Packet status: `partial`
- Useful records found: fundamentals object generated
- Irrelevant records: none
- Missing data: same pattern as VRTX
- Provider failures: same pattern as VRTX
- Source snapshots: skipped
- Thesis draft notes: failed due to no selected source
- Synthesis notes: partial due to missing thesis
- Recommended fixes: same as VRTX

### GILD
- Company type detected: `unknown`
- Packet status: `partial`
- Useful records found: fundamentals object generated
- Irrelevant records: none
- Missing data: same pattern as VRTX
- Provider failures: same pattern as VRTX
- Source snapshots: skipped
- Thesis draft notes: failed due to no selected source
- Synthesis notes: partial due to missing thesis
- Recommended fixes: same as VRTX

### VKTX
- Company type detected: `unknown`
- Packet status: `partial`
- Useful records found: fundamentals object generated
- Irrelevant records: none
- Missing data: same pattern as VRTX
- Provider failures: same pattern as VRTX
- Source snapshots: skipped
- Thesis draft notes: failed due to no selected source
- Synthesis notes: partial due to missing thesis
- Recommended fixes: same as VRTX

### CRSP
- Company type detected: `unknown`
- Packet status: `partial`
- Useful records found: fundamentals object generated
- Irrelevant records: none
- Missing data: same pattern as VRTX
- Provider failures: same pattern as VRTX
- Source snapshots: skipped
- Thesis draft notes: failed due to no selected source
- Synthesis notes: partial due to missing thesis
- Recommended fixes: same as VRTX

## Cross-ticker findings

### Top 5 relevance issues
1. PubMed query frequently collapses to ticker-only fallback when clinical context is empty.
2. FDA query also falls back to ticker/context-free terms when pipeline context is missing.
3. Financial model defaults to risk-adjusted pipeline with empty assets when data is unavailable.
4. Fundamentals are generated but mostly `missing`, reducing practical signal.
5. Catalyst inference yields no candidates without clinical records.

### Top 5 UX friction points
1. Draft thesis can fail even when packet run "succeeds partially" because no sources were created/selected.
2. Step list is detailed but does not explicitly suggest environment/config remediation first.
3. Company type showing `unknown` for all tested real tickers is confusing for users.
4. Missing-data list is long and repetitive without prioritization.
5. Partial status appears for all tickers, reducing confidence in first-run usability.

### Top 5 data gaps
1. SEC filings not returned in this environment.
2. Market quote/snapshot fetch failed for each ticker.
3. ClinicalTrials returned zero records for all tickers under current runtime config.
4. PubMed returned zero records due to upstream context/data availability.
5. FDA returned zero records with investigational-drug warning path.

### Query quality assessment
- PubMed/FDA queries should be refined further once trial context exists; current fallback works syntactically but is not sufficiently specific when trial ingestion is empty.
- When clinical context is present, queries should prioritize intervention/indication strings first and avoid ticker-only fallback unless no other context exists.

### Financial model assumption assessment
- Current behavior is conservative (good safety posture) but too empty for valuation usefulness in no-data scenarios.
- Placeholder string `"user assumption required"` is appropriate for safety, but downstream summary should differentiate between *missing provider data* and *user-entered assumptions pending*.

## Recommended prioritized fixes
1. Add explicit preflight diagnostics for provider/env readiness in packet output (before step run).
2. If draft thesis is requested and no snapshots exist, auto-switch to a clear `skipped` + actionable reason instead of `failed`.
3. Add missing-data prioritization buckets (critical vs optional).
4. Improve fallback query composition with known company/product aliases when available from watchlist metadata.
5. Add QA mode option to persist snapshots without requiring full external ingestion success for thesis workflow continuity.
