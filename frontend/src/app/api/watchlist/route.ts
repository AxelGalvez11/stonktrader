import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';

export async function GET() {
  try { return NextResponse.json(await sb('watchlist_items?select=*&order=created_at.desc')); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = [{ ...body, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }];
    return NextResponse.json(await sb('watchlist_items', { method: 'POST', body: JSON.stringify(payload) }));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
