# Phase 2.1 SEC EDGAR Ingestion

## Scope
Adds public SEC EDGAR ingestion for biotech financial-risk context (cash, burn, dilution, offerings, going-concern language).

## Configuration
Set environment variable:

`SEC_USER_AGENT="AppName contact@example.com"`

If missing, SEC routes fail gracefully with setup instructions.

## Routes
- `GET /api/sec/company?ticker=VKTX`
- `GET /api/sec/filings?ticker=VKTX`
- `POST /api/sec/ingest`

## Notes
- Uses public EDGAR data only.
- Stores accession numbers, source URLs, retrieval timestamps.
- Distinguishes extracted text snippets (facts) from interpretation.
- No buy/sell recommendations.
