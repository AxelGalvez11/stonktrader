import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { extractRelevantFilingSections, fetchFilingText, listRecentFilings, lookupCompanyByTicker } from '@/features/biotech/lib/sec/edgar';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ticker = String(body.ticker || '').toUpperCase();
    if (!ticker) return NextResponse.json({ error: 'ticker required' }, { status: 400 });
    const filingTypes = body.filingTypes || ['10-Q','10-K','8-K','S-3','S-1','424B5','424B3'];
    const limit = Number(body.limit || 5);
    const info = await lookupCompanyByTicker(ticker);
    const filings = await listRecentFilings(info.cik, { filingTypes, limit });

    const inserted = [];
    for (const f of filings) {
      const existing = await sb(`sec_filings?select=id&accession_number=eq.${encodeURIComponent(f.accessionNumber)}`);
      if (Array.isArray(existing) && existing.length > 0) continue;
      const file = await fetchFilingText(info.cik, f.accessionNumber, f.primaryDocument);
      const extracted: any = extractRelevantFilingSections(file.text);
      const textExcerpt = JSON.stringify(extracted);

      const savedFiling = await sb('sec_filings', { method: 'POST', body: JSON.stringify([{ company_id: null, ticker, filing_type: f.filingType, filing_date: f.filingDate, accession_number: f.accessionNumber, url: file.url, text_excerpt: textExcerpt, ai_summary: 'Extracted SEC risk snippets (facts only).', risks_summary: extracted.risk_factor_mentions.join(' | ') || 'missing', financial_summary: extracted.cash_mentions.join(' | ') || 'missing' }]) });
      await sb('sources', { method: 'POST', body: JSON.stringify([{ source_type: 'sec', title: `${ticker} ${f.filingType} ${f.filingDate}`, url: file.url, retrieved_at: new Date().toISOString(), raw_text: file.text.slice(0, 120000), summary: textExcerpt, metadata: { ticker, cik: info.cik, accession_number: f.accessionNumber, filing_type: f.filingType } }]) });
      inserted.push({ accessionNumber: f.accessionNumber, filingType: f.filingType, filingDate: f.filingDate, url: file.url, extracted, savedFiling });
    }
    return NextResponse.json({ ticker, cik: info.cik, ingested: inserted.length, filings: inserted });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
