import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { fetchPubMedBatch, normalizePubMedArticle, searchPubMed } from '@/features/biotech/lib/pubmed/pubmed';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticker = String(body.ticker || '').toUpperCase();
    const query = String(body.query || '');
    const context = body.context || {};
    const limit = Number(body.limit || 10);
    if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });

    const pmids = await searchPubMed(query, { limit });
    const raw = await fetchPubMedBatch(pmids);
    const articles = raw.map(r => normalizePubMedArticle(r, context));

    const saved = [];
    for (const a of articles) {
      const payload = { ticker, company_id: null, asset_id: null, pmid: a.pmid, title: a.title, authors: a.authors, journal: a.journal, publication_date: a.publication_date !== 'missing' ? a.publication_date : null, abstract: a.abstract, doi: a.doi, article_types: a.article_types, mesh_terms: a.mesh_terms, keywords: a.keywords, url: a.source_url, ai_summary: 'Public literature summary for scientific context.', relevance_score: a.relevance_score, relevance_reasons: a.relevance_reasons, scientific_signals: a.scientific_signals, retrieved_at: a.retrieved_at, raw_json: a.raw_json, updated_at: a.retrieved_at };
      const ex = await sb(`pubmed_sources?select=id&pmid=eq.${a.pmid}`);
      if (Array.isArray(ex) && ex.length > 0) await sb(`pubmed_sources?pmid=eq.${a.pmid}`, { method: 'PATCH', body: JSON.stringify(payload), headers: { Prefer: 'return=minimal' } });
      else await sb('pubmed_sources', { method: 'POST', body: JSON.stringify([payload]) });
      await sb('sources', { method: 'POST', body: JSON.stringify([{ source_type: 'pubmed', title: `PMID ${a.pmid}: ${a.title}`, url: a.source_url, retrieved_at: a.retrieved_at, raw_text: a.abstract, summary: JSON.stringify({ relevance_score: a.relevance_score, relevance_reasons: a.relevance_reasons, scientific_signals: a.scientific_signals }), metadata: { ticker, pmid: a.pmid } }]) });
      saved.push(a);
    }
    return NextResponse.json({ ticker, query, count: saved.length, articles: saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
