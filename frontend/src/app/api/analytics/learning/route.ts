import { NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { buildLearningAnalytics } from '@/features/biotech/lib/learningAnalytics';

export async function GET() {
  try {
    const [paper_trades, trade_reviews, thesis_syntheses, catalysts, alertResp] = await Promise.all([
      sb('paper_trades?select=*'),
      sb('trade_reviews?select=*&order=created_at.desc'),
      sb('thesis_syntheses?select=*'),
      sb('catalysts?select=*'),
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/catalyst-alerts`).then((r)=>r.ok?r.json():{ alerts:[], warnings:[] }).catch(()=>({ alerts:[], warnings:[] })),
    ]);
    const analytics = buildLearningAnalytics({ paper_trades, trade_reviews, thesis_syntheses, catalysts, alerts: alertResp.alerts || [] });
    analytics.missing_data = [...(analytics.missing_data || []), ...((alertResp.warnings || []).filter((w:any)=>w.type==='missing_data'))];
    return NextResponse.json(analytics);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
