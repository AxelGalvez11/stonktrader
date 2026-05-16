import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { sb } from '@/lib/supabase/rest';
import { buildLinkedTradePatch, buildOutcomePatch } from '@/features/biotech/lib/alerts/outcomeWorkflow';

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    const b=await req.json();
    await sb(`catalysts?id=eq.${b.id}`, { method:'PATCH', body: JSON.stringify(buildOutcomePatch(b)), headers:{Prefer:'return=minimal'} });
    if (b.paper_trade_id) await sb(`paper_trades?id=eq.${b.paper_trade_id}`, { method:'PATCH', body: JSON.stringify(buildLinkedTradePatch(b)), headers:{Prefer:'return=minimal'} });
    return NextResponse.json({ ok:true });
  } catch(e:any){ return NextResponse.json({ error:e.message },{status:500}); }
}
