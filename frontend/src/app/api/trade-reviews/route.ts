import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { sb } from '@/lib/supabase/rest';
import { analyzeReview, validateTradeReviewInput } from '@/features/biotech/lib/reviewAnalyzer';

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId(req); return NextResponse.json(await sb(`trade_reviews?select=*&user_id=eq.${userId}&order=created_at.desc`)); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    const body = await req.json();
    const errs = validateTradeReviewInput(body);
    if (errs.length) return NextResponse.json({ error: errs }, { status: 400 });
    const analysis = analyzeReview({ originalThesis: body.original_thesis, paperTrade: body.paper_trade, reviewNotes: body, catalystOutcome: body.catalyst_outcome, stockReaction: body.stock_reaction_percent });
    const payload = [{ ...body, user_id: userId, ai_review: JSON.stringify(analysis) }];
    const saved = await sb('trade_reviews', { method: 'POST', body: JSON.stringify(payload) });
    if (body.paper_trade_id) {
      await sb(`paper_trades?id=eq.${body.paper_trade_id}`, { method: 'PATCH', body: JSON.stringify({ status: 'reviewed' }), headers: { Prefer: 'return=minimal' } });
    }
    return NextResponse.json(saved);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
