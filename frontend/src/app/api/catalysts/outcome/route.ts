import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';

export async function POST(req: NextRequest) {
  try {
    const b=await req.json();
    await sb(`catalysts?id=eq.${b.id}`, { method:'PATCH', body: JSON.stringify({ outcome:b.outcome, expected_date:b.actual_event_date||b.expected_date, status:'event_passed_review_needed', updated_at:new Date().toISOString(), description:[b.outcome_summary,b.notes].filter(Boolean).join(' | '), source_url:b.source_url||null }), headers:{Prefer:'return=minimal'} });
    if (b.paper_trade_id) await sb(`paper_trades?id=eq.${b.paper_trade_id}`, { method:'PATCH', body: JSON.stringify({ status:'closed_unreviewed', actual_exit_date:b.actual_event_date||null, notes:b.outcome_summary||null }), headers:{Prefer:'return=minimal'} });
    return NextResponse.json({ ok:true });
  } catch(e:any){ return NextResponse.json({ error:e.message },{status:500}); }
}
