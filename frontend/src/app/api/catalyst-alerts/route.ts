import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { generateCatalystAlerts } from '@/features/biotech/lib/alerts/catalystAlerts';

export async function GET(req: NextRequest) {
  try {
    const ticker = req.nextUrl.searchParams.get('ticker');
    const catalysts = await sb(`catalysts?select=*&order=expected_date.asc${ticker?`&ticker=eq.${ticker.toUpperCase()}`:''}`);
    const paperTrades = await sb('paper_trades?select=*');
    const syntheses = await sb('thesis_syntheses?select=*&order=created_at.desc');
    const alerts = generateCatalystAlerts({ catalysts, paperTrades, syntheses });
    return NextResponse.json({ alerts });
  } catch (e:any) { return NextResponse.json({ error:e.message }, { status:500 }); }
}
