# Phase 2.9.5 — Real AI Provider Wiring + Prompt Hardening

## Env vars
- `AI_PROVIDER=mock|openai|anthropic`
- `AI_API_KEY` (required for openai/anthropic)
- `AI_MODEL` (optional override)

## Provider behavior
- default is `mock` when unset
- `openai` uses chat completions JSON mode + conservative temperature
- `anthropic` uses messages API + conservative temperature
- missing key for real providers returns graceful setup error

## Validation/repair flow
1. compress selected sources (bounded snippets)
2. request strict JSON draft
3. parse JSON
4. if parse fails, attempt one repair
5. validate structured draft fields and safety wording
6. reject invalid drafts (not saveable)

## Response metadata
- provider
- model
- created_at
- source_count
- compressed_source_char_count
- repaired
- validation issues

## Safety constraints
- AI-assisted draft
- editable research thesis
- paper-trading only
- not investment advice
- uses selected public sources
- not predictive
- no buy/sell language

## Known limitations
- tests mock provider behavior; no live external API calls in test suite
- certainty wording filter is rule-based, not full semantic adjudication
