import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { sb } from '@/lib/supabase/rest';

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    return NextResponse.json(await sb(`watchlist_items?select=*&user_id=eq.${userId}&order=created_at.desc`));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    const body = await req.json();
    const payload = [{ ...body, user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
    return NextResponse.json(await sb('watchlist_items', { method: 'POST', body: JSON.stringify(payload) }));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
