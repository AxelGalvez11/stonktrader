import { NextRequest, NextResponse } from 'next/server';
import { searchFdaDrugs } from '@/features/biotech/lib/fda/fda';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q) return NextResponse.json({ error: 'q required' }, { status: 400 });
    const records = await searchFdaDrugs(q, { limit: Number(req.nextUrl.searchParams.get('limit') || '10') });
    return NextResponse.json({ records });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
