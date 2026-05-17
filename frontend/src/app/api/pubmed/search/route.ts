import { NextRequest, NextResponse } from 'next/server';
import { searchPubMed } from '@/features/biotech/lib/pubmed/pubmed';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q) return NextResponse.json({ error: 'q required' }, { status: 400 });
    const pmids = await searchPubMed(q, { limit: Number(req.nextUrl.searchParams.get('limit') || '10') });
    return NextResponse.json({ pmids });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
