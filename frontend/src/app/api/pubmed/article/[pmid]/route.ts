import { NextRequest, NextResponse } from 'next/server';
import { fetchPubMedArticle, normalizePubMedArticle } from '@/features/biotech/lib/pubmed/pubmed';

export async function GET(_req: NextRequest, { params }: { params: { pmid: string } }) {
  try {
    const raw = await fetchPubMedArticle(params.pmid);
    return NextResponse.json(normalizePubMedArticle(raw));
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
