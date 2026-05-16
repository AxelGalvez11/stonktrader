import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { checkRateLimit } from '@/lib/server/rateLimit';
import { sb } from '@/lib/supabase/rest';
import { normalizeFdaDrugRecord, searchFdaDrugs } from '@/features/biotech/lib/fda/fda';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    const rl = checkRateLimit(`${userId}:${req.nextUrl.pathname}`, 10, 60_000); if(!rl.ok) return NextResponse.json({ error:'Rate limit exceeded. Try again shortly.' }, { status:429 });
    const body = await req.json();
    const ticker = String(body.ticker || '').toUpperCase();
    const query = String(body.query || '');
    const context = body.context || {};
    const limit = Number(body.limit || 10);
    if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });
    const found = await searchFdaDrugs(query, { limit });
    const saved = [];
    for (const rec of found.map((r: any) => normalizeFdaDrugRecord(r, context))) {
      const payload = { ticker, company_id: null, fda_source_id: rec.fda_source_id !== 'missing' ? rec.fda_source_id : null, source_kind: rec.source_kind, title: rec.title, drug_name: rec.drug_name, active_ingredients: rec.active_ingredients, application_number: rec.application_number, sponsor: rec.sponsor, indication: rec.indication, approval_status: rec.approval_status, approval_date: rec.approval_date !== 'missing' ? rec.approval_date : null, label_sections: rec.label_sections, safety_signals: rec.safety_signals, regulatory_signals: rec.regulatory_signals, source_url: rec.source_url, retrieved_at: rec.retrieved_at, raw_json: rec.raw_json, updated_at: rec.retrieved_at };
      if (payload.fda_source_id) {
        const ex = await sb(`fda_sources?select=id&fda_source_id=eq.${payload.fda_source_id}`);
        if (Array.isArray(ex) && ex.length) await sb(`fda_sources?fda_source_id=eq.${payload.fda_source_id}`, { method: 'PATCH', body: JSON.stringify(payload), headers: { Prefer: 'return=minimal' } });
        else await sb('fda_sources', { method: 'POST', body: JSON.stringify([payload]) });
      } else {
        await sb('fda_sources', { method: 'POST', body: JSON.stringify([payload]) });
      }
      await sb('sources', { method: 'POST', body: JSON.stringify([{ source_type: 'fda', title: rec.title, url: rec.source_url, retrieved_at: rec.retrieved_at, raw_text: JSON.stringify(rec.raw_json).slice(0, 120000), summary: JSON.stringify(rec.regulatory_signals), metadata: { ticker, fda_source_id: rec.fda_source_id } }]) });
      saved.push(rec);
    }
    return NextResponse.json({ ticker, query, count: saved.length, records: saved });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
