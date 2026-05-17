import { NextRequest, NextResponse } from 'next/server';
import { fetchQuote } from '@/features/biotech/lib/market/marketData';

export async function GET(req: NextRequest) {
  try {
    const ticker = req.nextUrl.searchParams.get('ticker');
    if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });
    return NextResponse.json(await fetchQuote(ticker));
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
