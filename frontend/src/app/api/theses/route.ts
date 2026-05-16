import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { sb } from '@/lib/supabase/rest';
import { validateThesisJson } from '@/features/biotech/lib/thesisSchema';

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    const ticker = req.nextUrl.searchParams.get('ticker');
    if (ticker) return NextResponse.json(await sb(`ai_theses?select=*&ticker=eq.${ticker.toUpperCase()}&user_id=eq.${userId}&order=created_at.desc`));
    return NextResponse.json(await sb(`ai_theses?select=*&user_id=eq.${userId}&order=created_at.desc`));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    const body = await req.json();
    const parsed = validateThesisJson(body.thesis_json);
    if (!parsed.ok) return NextResponse.json({ error: parsed.errors }, { status: 400 });
    const payload = { ...body, ticker: String(body.ticker || '').toUpperCase(), catalyst_id: body.catalyst_id || null, source_ids: body.source_ids || [], source_summary: body.source_summary || null, user_id: userId };
    const saved = await sb('ai_theses', { method: 'POST', body: JSON.stringify([payload]) });
    const thesis = Array.isArray(saved) ? saved[0] : saved;
    return NextResponse.json({ thesis_id: thesis?.id || null, thesis, ticker_workspace_link: `/ticker/${payload.ticker}` });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
