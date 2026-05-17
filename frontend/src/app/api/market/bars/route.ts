import { NextRequest, NextResponse } from 'next/server';
import { fetchDailyBars } from '@/features/biotech/lib/market/marketData';

export async function GET(req: NextRequest) {
  try {
    const ticker = req.nextUrl.searchParams.get('ticker');
    const range = req.nextUrl.searchParams.get('range') || '6mo';
    if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });
    return NextResponse.json({ ticker, bars: await fetchDailyBars(ticker, { range }) });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
