import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { validatePaperTradeRisk } from '@/features/biotech/lib/riskEngine';

export async function GET() {
  try { return NextResponse.json(await sb('paper_trades?select=*&order=created_at.desc')); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const risk = validatePaperTradeRisk({ thesisId: body.thesis_id, invalidationPoint: body.stop_reason, positionSize: body.paper_position_size, exitPlan: body.exit_plan });
    if (!risk.ok) return NextResponse.json({ error: risk.reason }, { status: 400 });
    const status = body.status || 'open';
    return NextResponse.json(await sb('paper_trades', { method: 'POST', body: JSON.stringify([{ ...body, status }]) }));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
