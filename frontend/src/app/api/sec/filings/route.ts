import { NextRequest, NextResponse } from 'next/server';
import { lookupCompanyByTicker, listRecentFilings } from '@/features/biotech/lib/sec/edgar';

export async function GET(req: NextRequest) {
  try {
    const ticker = req.nextUrl.searchParams.get('ticker');
    if (!ticker) return NextResponse.json({ error: 'ticker query param required' }, { status: 400 });
    const types = req.nextUrl.searchParams.get('types')?.split(',').filter(Boolean);
    const limit = Number(req.nextUrl.searchParams.get('limit') || '10');
    const info = await lookupCompanyByTicker(ticker);
    const filings = await listRecentFilings(info.cik, { filingTypes: types, limit });
    return NextResponse.json({ ticker: ticker.toUpperCase(), cik: info.cik, companyName: info.companyName, filings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
