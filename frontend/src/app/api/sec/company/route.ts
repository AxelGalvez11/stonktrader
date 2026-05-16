import { NextRequest, NextResponse } from 'next/server';
import { lookupCompanyByTicker, listRecentFilings } from '@/features/biotech/lib/sec/edgar';

export async function GET(req: NextRequest) {
  try {
    const ticker = req.nextUrl.searchParams.get('ticker');
    if (!ticker) return NextResponse.json({ error: 'ticker query param required' }, { status: 400 });
    const info = await lookupCompanyByTicker(ticker);
    const recentFilings = await listRecentFilings(info.cik, { limit: 10 });
    return NextResponse.json({ ...info, recentFilings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
