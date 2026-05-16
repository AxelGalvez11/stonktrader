import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker');
  const q = ticker ? `research_notes?select=*&ticker=eq.${ticker}&order=created_at.desc` : 'research_notes?select=*&order=created_at.desc';
  try { return NextResponse.json(await sb(q)); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json(await sb('research_notes', { method: 'POST', body: JSON.stringify([{ ...body, updated_at: new Date().toISOString() }]) }));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
