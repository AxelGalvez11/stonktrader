import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { calculateLiquidityFlags, calculatePostCatalystMove, calculatePreCatalystRunup, calculateVolatilitySummary, fetchDailyBars, fetchQuote } from '@/features/biotech/lib/market/marketData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticker = String(body.ticker || '').toUpperCase();
    const range = body.range || '6mo';
    if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });
    const quote = await fetchQuote(ticker);
    const bars = await fetchDailyBars(ticker, { range });

    await sb('market_quotes', { method: 'POST', body: JSON.stringify([{ ...quote, raw_json: quote }]) });
    for (const b of bars) {
      await sb(`market_daily_bars?ticker=eq.${b.ticker}&date=eq.${b.date}&provider=eq.${b.provider}`, { method: 'PATCH', body: JSON.stringify({ ...b, raw_json: b }), headers: { Prefer: 'return=minimal' } }).catch(async ()=>{
        await sb('market_daily_bars', { method: 'POST', body: JSON.stringify([{ ...b, raw_json: b }]) });
      });
    }

    const pre = body.catalystDate ? calculatePreCatalystRunup(bars, body.catalystDate, [30,60]) : { approximate: true, missing: 'missing' };
    const post = body.eventDate ? calculatePostCatalystMove(bars, body.eventDate, [1,3,5,10]) : { approximate: true, missing: 'missing' };
    const liquidity = calculateLiquidityFlags(quote);
    const volatility = calculateVolatilitySummary(bars);

    return NextResponse.json({ ticker, quote, bars_count: bars.length, derived: { pre_catalyst_runup: pre, post_catalyst_move: post, liquidity_flags: liquidity, volatility_summary: volatility } });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
