import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { sb } from '@/lib/supabase/rest';

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker');
  try {
    const userId = await requireUserId(req);
    const q = ticker ? `research_notes?select=*&ticker=eq.${ticker}&user_id=eq.${userId}&order=created_at.desc` : `research_notes?select=*&user_id=eq.${userId}&order=created_at.desc`;
    return NextResponse.json(await sb(q));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    const body = await req.json();
    return NextResponse.json(await sb('research_notes', { method: 'POST', body: JSON.stringify([{ ...body, user_id: userId, updated_at: new Date().toISOString() }]) }));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
