import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { checkRateLimit } from '@/lib/server/rateLimit';
import { sb } from '@/lib/supabase/rest';
import { runCompanyResearchPacket } from '@/features/biotech/lib/researchPacket/orchestrator';

export async function POST(req: NextRequest){
  try{
    const userId = await requireUserId(req);
    const rl = checkRateLimit(`${userId}:${req.nextUrl.pathname}`, 5, 60_000);
    if(!rl.ok) return NextResponse.json({ error:'Rate limit exceeded. Try again shortly.' }, { status:429 });
    const body = await req.json();
    const packet = await runCompanyResearchPacket({ ...body, userId, base:req.nextUrl.origin });
    if ((packet.sources_created||[]).length) {
      await sb('sources', { method:'POST', body: JSON.stringify((packet.sources_created||[]).map((s:any)=>({ source_type:s.source_type,title:s.title,url:s.source_url,retrieved_at:new Date().toISOString(),raw_text:String(s.raw_text||'').slice(0,120000),summary:'research packet snapshot',metadata:{ ticker:packet.ticker, user_id:userId } }))) });
    }
    return NextResponse.json(packet);
  }catch(e:any){ return NextResponse.json({ error:e.message||'Research packet failed' }, { status:500 }); }
}
