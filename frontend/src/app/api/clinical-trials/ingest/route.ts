import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { inferPotentialCatalystFromTrial, searchTrialsByCompany } from '@/features/biotech/lib/clinical/clinicalTrials';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticker = String(body.ticker || '').toUpperCase();
    const companyName = String(body.companyName || ticker);
    const limit = Number(body.limit || 10);
    if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });
    const trials = (await searchTrialsByCompany(companyName, ticker)).slice(0, limit);

    const ingested = [];
    for (const t of trials) {
      const exists = await sb(`clinical_trials?select=id&nct_id=eq.${t.nct_id}`);
      if (Array.isArray(exists) && exists.length > 0) continue;
      await sb('clinical_trials', { method: 'POST', body: JSON.stringify([{ asset_id: null, nct_id: t.nct_id, title: t.brief_title, phase: t.phase, status: t.status, enrollment: Number.isFinite(Number(t.enrollment)) ? Number(t.enrollment) : null, start_date: t.start_date !== 'missing' ? t.start_date : null, completion_date: t.completion_date !== 'missing' ? t.completion_date : null, primary_endpoint: (t.primary_endpoints || []).join(' | ') || 'missing', secondary_endpoints: (t.secondary_endpoints || []).join(' | ') || 'missing', inclusion_criteria: t.inclusion_criteria, exclusion_criteria: t.exclusion_criteria, source_url: t.source_url, last_updated: t.retrieved_at }]) });
      await sb('sources', { method: 'POST', body: JSON.stringify([{ source_type: 'clinical_trials', title: `${ticker} ${t.nct_id}`, url: t.source_url, retrieved_at: t.retrieved_at, raw_text: JSON.stringify(t.raw_json).slice(0, 120000), summary: JSON.stringify({ phase: t.phase, status: t.status, primary_endpoints: t.primary_endpoints, missing_fields: t.missing_fields }), metadata: { ticker, nct_id: t.nct_id } }]) });
      ingested.push({ trial: t, potentialCatalyst: inferPotentialCatalystFromTrial(t) });
    }
    return NextResponse.json({ ticker, companyName, count: ingested.length, trials: ingested });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
