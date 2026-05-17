# Phase 2.9 — AI-Assisted Thesis Drafting

Adds an AI-assisted draft flow for editable biotech research theses (paper-trading only).

## Added abstraction
- `createAiClient()`
- `generateStructuredThesisDraft(input)`
- `validateAiThesisDraft(output)`
- `repairDraftIfNeeded(output)`

Supports `AI_PROVIDER` (`mock` default) with graceful fallback when provider config is missing.

## Added route
- `POST /api/thesis-draft`

Validates selected sources, compresses source payloads with bounded snippets, generates conservative structured draft, then validates output.

## UI integration
- `/thesis/new` includes “Draft thesis from selected evidence” button.
- Draft results can auto-apply to form and be reviewed in `DraftReviewPanel`.
- Warnings emphasize editable draft, selected-source scope, missing-field review.

## Safety posture
- AI-assisted draft
- editable research thesis
- paper-trading only
- not investment advice
- uses selected public sources
- not predictive

## Limitations
- current implementation uses mock provider by default in dev/test
- provider-specific LLM calls are abstracted but not yet specialized by vendor
