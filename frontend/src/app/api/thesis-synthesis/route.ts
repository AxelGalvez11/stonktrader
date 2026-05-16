import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { synthesizeEvidence } from '@/features/biotech/lib/synthesis/evidenceSynthesis';

export async function GET(req: NextRequest) {
  try {
    const thesisId = req.nextUrl.searchParams.get('thesisId');
    const ticker = req.nextUrl.searchParams.get('ticker');
    if (thesisId) return NextResponse.json(await sb(`thesis_syntheses?select=*&thesis_id=eq.${thesisId}&order=created_at.desc`));
    if (ticker) return NextResponse.json(await sb(`thesis_syntheses?select=*&ticker=eq.${ticker.toUpperCase()}&order=created_at.desc`));
    return NextResponse.json(await sb('thesis_syntheses?select=*&order=created_at.desc'));
  } catch (e:any) { return NextResponse.json({ error:e.message }, { status:500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const syn = synthesizeEvidence(body);
    const row = { thesis_id: body.thesis_id || null, ticker: body.ticker || null, ...syn, evidence_conflicts: syn.evidence_conflicts, missing_evidence: syn.missing_evidence, risk_concentrations: syn.risk_concentrations, quality_gate_warnings: syn.quality_gate_warnings, suggested_follow_up_questions: syn.suggested_follow_up_questions };
    const saved = await sb('thesis_syntheses', { method: 'POST', body: JSON.stringify([row]) });
    return NextResponse.json({ synthesis: syn, saved });
  } catch (e:any) { return NextResponse.json({ error:e.message }, { status:500 }); }
}
