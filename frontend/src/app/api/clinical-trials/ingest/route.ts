import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { checkRateLimit } from '@/lib/server/rateLimit';
import { sb } from '@/lib/supabase/rest';
import { inferPotentialCatalystFromTrial, searchTrialsByCompany } from '@/features/biotech/lib/clinical/clinicalTrials';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    const rl = checkRateLimit(`${userId}:${req.nextUrl.pathname}`, 10, 60_000); if(!rl.ok) return NextResponse.json({ error:'Rate limit exceeded. Try again shortly.' }, { status:429 });
    const body = await req.json();
    const ticker = String(body.ticker || '').toUpperCase();
    const companyName = String(body.companyName || ticker);
    const limit = Number(body.limit || 10);
    if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });
    const trials = (await searchTrialsByCompany(companyName, ticker)).slice(0, limit);

    const ingested = [];
    for (const t of trials) {
      const payload = {
        asset_id: null, company_id: null, ticker,
        nct_id: t.nct_id, title: t.brief_title, sponsor: t.sponsor,
        collaborators: t.collaborators, conditions: t.conditions, interventions: t.interventions, drug_candidates: t.drug_candidates,
        phase: t.phase, status: t.status, enrollment: Number.isFinite(Number(t.enrollment)) ? Number(t.enrollment) : null,
        study_type: t.study_type, allocation: t.allocation, masking: t.masking, primary_purpose: t.primary_purpose,
        start_date: t.start_date !== 'missing' ? t.start_date : null,
        primary_completion_date: t.primary_completion_date !== 'missing' ? t.primary_completion_date : null,
        completion_date: t.completion_date !== 'missing' ? t.completion_date : null,
        primary_endpoint: (t.primary_endpoints || []).join(' | ') || 'missing',
        secondary_endpoints: JSON.stringify(t.secondary_endpoints || []),
        primary_endpoints: t.primary_endpoints,
        inclusion_criteria: t.inclusion_criteria, exclusion_criteria: t.exclusion_criteria,
        locations: t.locations, source_url: t.source_url, retrieved_at: t.retrieved_at, raw_json: t.raw_json,
        missing_fields: t.missing_fields, last_updated: t.retrieved_at, updated_at: t.retrieved_at,
      };
      const exists = await sb(`clinical_trials?select=id&nct_id=eq.${t.nct_id}`);
      if (Array.isArray(exists) && exists.length > 0) {
        await sb(`clinical_trials?nct_id=eq.${t.nct_id}`, { method: 'PATCH', body: JSON.stringify(payload), headers: { Prefer: 'return=minimal' } });
      } else {
        await sb('clinical_trials', { method: 'POST', body: JSON.stringify([payload]) });
      }
      await sb('sources', { method: 'POST', body: JSON.stringify([{ source_type: 'clinical_trials', title: `${ticker} ${t.nct_id}`, url: t.source_url, retrieved_at: t.retrieved_at, raw_text: JSON.stringify(t.raw_json).slice(0, 120000), summary: JSON.stringify({ phase: t.phase, status: t.status, primary_endpoints: t.primary_endpoints, missing_fields: t.missing_fields }), metadata: { ticker, nct_id: t.nct_id } }]) });
      ingested.push({ trial: t, potentialCatalyst: inferPotentialCatalystFromTrial(t) });
    }
    return NextResponse.json({ ticker, companyName, count: ingested.length, trials: ingested });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
