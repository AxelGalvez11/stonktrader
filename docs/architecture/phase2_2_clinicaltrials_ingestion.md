# Phase 2.2 ClinicalTrials.gov Ingestion

## Scope
Integrates public ClinicalTrials.gov registry data for biotech trial context and possible catalyst windows.

## Routes
- `GET /api/clinical-trials/search?ticker=VKTX`
- `GET /api/clinical-trials/search?company=Viking%20Therapeutics`
- `GET /api/clinical-trials/nct/NCT12345678`
- `POST /api/clinical-trials/ingest`

## Safety
- Uses public registry data only.
- Labels inferred dates as **possible catalyst window**.
- Trial completion does not guarantee data release.
- Missing values are persisted as `"missing"`.
- No buy/sell recommendations.
