import { NextRequest, NextResponse } from 'next/server';
import { fetchFdaDrugLabel } from '@/features/biotech/lib/fda/fda';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q) return NextResponse.json({ error: 'q required' }, { status: 400 });
    const label = await fetchFdaDrugLabel(q);
    return NextResponse.json({ label });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
