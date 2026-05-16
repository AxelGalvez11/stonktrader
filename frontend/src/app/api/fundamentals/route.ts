import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { requireUserId } from '@/lib/server/auth';

export async function GET(req: NextRequest){
  try{
    const userId = await requireUserId(req);
    const ticker = req.nextUrl.searchParams.get('ticker');
    if(!ticker) return NextResponse.json({ error:'ticker required' }, { status:400 });
    return NextResponse.json(await sb(`fundamental_reports?select=*&ticker=eq.${ticker.toUpperCase()}&user_id=eq.${userId}&order=created_at.desc`));
  }catch(e:any){ return NextResponse.json({ error:e.message }, { status:500 }); }
}
