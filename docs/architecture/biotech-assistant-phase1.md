# Biotech Research Assistant – Phase 1 Architecture Plan

## Scope and guardrails
- Personal research and paper trading only.
- No live order execution.
- Public sources only (PubMed, ClinicalTrials.gov, FDA, SEC EDGAR, IR pages, public transcripts).
- Every thesis must log sources and separate facts, assumptions, and AI interpretation.
- Mandatory risk warnings and anti-oracle language.

## System architecture
- Frontend: Next.js App Router + TypeScript + Tailwind + shadcn/ui style components.
- Data/Auth: Supabase Auth + Postgres + Storage.
- AI Orchestration: provider abstraction (`openai`, `anthropic` adapters).
- Fetching: server-side source adapters with rate limiting and retries.

## Core modules
1. `watchlist` – track symbols, tags, and status.
2. `companies` – profile, cash runway and dilution summary.
3. `pipeline` – assets, indications, phases.
4. `catalysts` – event calendar and outcomes.
5. `sources` – normalized source records and raw text snapshots.
6. `theses` – AI-generated structured analyses + source IDs.
7. `journal` – paper trades only with risk controls.
8. `reviews` – post-event and mistake pattern analysis.

## AI safety design
- Prompt policy injects forbidden claim list and required disclaimer.
- Output schema validation for thesis, red-team, and post-event review JSON.
- Risk engine blocks journal entries if thesis/risk-plan fields missing.
- UI shows “research only / no financial advice” disclaimer globally.

## Delivery phases
- Phase 1 (this branch): schema, types, mock data, dashboard/watchlist flow, thesis generation flow with placeholders.
- Phase 2: authenticated Supabase wiring and source ingestion jobs.
- Phase 3: evaluation workflows and analytics.
