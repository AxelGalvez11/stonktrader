import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { validateThesisJson } from '@/features/biotech/lib/thesisSchema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = validateThesisJson(body.thesis_json);
    if (!parsed.ok) return NextResponse.json({ error: parsed.errors }, { status: 400 });
    return NextResponse.json(await sb('ai_theses', { method: 'POST', body: JSON.stringify([{...body, source_ids: body.source_ids || []}]) }));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
