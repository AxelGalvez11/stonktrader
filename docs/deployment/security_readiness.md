# Security & Deployment Readiness

## Required env
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Optional integration env
- AI_PROVIDER, AI_API_KEY, AI_MODEL
- SEC_USER_AGENT
- NCBI_TOOL, NCBI_EMAIL, NCBI_API_KEY
- MARKET_DATA_PROVIDER, MARKET_DATA_API_KEY

## Auth/RLS expectations
- User-owned tables must include `user_id` and RLS policies `auth.uid() = user_id`.
- Dev mode can use `x-user-id` header or `DEV_USER_ID`.

## Rate limiting
- In-memory limiter used for expensive routes in dev.
- Production should migrate to Redis/Upstash/Vercel KV.

## Secret handling
- Never expose AI/provider keys to client.
- Health route only reports configured/missing booleans.

## Safety posture
Paper-trading only. No broker APIs. No live trading recommendations.
