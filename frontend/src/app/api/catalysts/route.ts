import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker');
  const q = ticker ? `catalysts?select=*&ticker=eq.${ticker}&order=expected_date.asc` : 'catalysts?select=*&order=expected_date.asc';
  try { return NextResponse.json(await sb(q)); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try { return NextResponse.json(await sb('catalysts', { method: 'POST', body: JSON.stringify([await req.json()]) })); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
