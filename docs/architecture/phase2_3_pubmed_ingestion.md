# Phase 2.3 PubMed ingestion

## Env vars
- `NCBI_TOOL="BioCatalystAI"`
- `NCBI_EMAIL="your-email@example.com"`
- `NCBI_API_KEY` (optional)

If tool/email are missing, PubMed routes fail gracefully with setup instructions.

## Routes
- `GET /api/pubmed/search?q=...`
- `GET /api/pubmed/article/[pmid]`
- `POST /api/pubmed/ingest`

## Safety
- Public PubMed data only.
- Scientific support context only, no certainty claims.
- Missing fields remain `"missing"`.
- Trial facts are not overridden by literature; conflicts flagged as "conflicting evidence".
