import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { sb } from '@/lib/supabase/rest';

export async function GET(req: NextRequest){
  try{
    const userId = await requireUserId(req);
    const ticker = String(req.nextUrl.searchParams.get('ticker')||'').toUpperCase();
    if(!ticker) return NextResponse.json({ error:'ticker required' }, { status:400 });
    const rows = await sb(`financial_models?select=*&ticker=eq.${ticker}&user_id=eq.${userId}&order=created_at.desc`);
    return NextResponse.json(rows);
  }catch(e:any){ return NextResponse.json({ error:e.message }, { status:500 }); }
}
