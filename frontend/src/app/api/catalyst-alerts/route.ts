import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { generateCatalystAlerts } from '@/features/biotech/lib/alerts/catalystAlerts';

function toTickerMap(items: any[], key = 'ticker') {
  return (items || []).reduce((acc: Record<string, boolean>, item: any) => {
    const t = String(item?.[key] || '').toUpperCase();
    if (t) acc[t] = true;
    return acc;
  }, {});
}

export async function GET(req: NextRequest) {
  try {
    const ticker = req.nextUrl.searchParams.get('ticker')?.toUpperCase() || null;
    const catalystsQuery = ticker
      ? `catalysts?select=*&ticker=eq.${ticker}&order=expected_date.asc`
      : 'catalysts?select=*&order=expected_date.asc';

    const [catalysts, paperTrades, syntheses, secFilings, clinicalTrials, marketRows] = await Promise.all([
      sb(catalystsQuery),
      sb('paper_trades?select=*'),
      sb('thesis_syntheses?select=*&order=created_at.desc'),
      sb(ticker ? `sec_filings?select=*&ticker=eq.${ticker}` : 'sec_filings?select=*'),
      sb(ticker ? `clinical_trials?select=*&ticker=eq.${ticker}` : 'clinical_trials?select=*'),
      sb(ticker ? `market_data_daily?select=*&ticker=eq.${ticker}&order=date.desc&limit=120` : 'market_data_daily?select=*&order=date.desc&limit=1000'),
    ]);

    const marketDataByTicker = (marketRows || []).reduce((acc: Record<string, any>, row: any) => {
      const t = String(row?.ticker || '').toUpperCase();
      if (!t || acc[t]) return acc;
      acc[t] = { derived: { pre_catalyst_runup: { runup_30d_percent: Number(row?.runup_30d_percent || row?.pre_catalyst_runup_percent || 0) } } };
      return acc;
    }, {});

    const secFlagsByTicker = (secFilings || []).reduce((acc: Record<string, string[]>, filing: any) => {
      const t = String(filing?.ticker || '').toUpperCase();
      if (!t) return acc;
      const blob = JSON.stringify(filing).toLowerCase();
      if (blob.includes('dilution')) acc[t] = [...(acc[t] || []), 'high_dilution'];
      return acc;
    }, {});

    const alerts = generateCatalystAlerts({
      catalysts,
      paperTrades,
      syntheses,
      secEvidenceByTicker: toTickerMap(secFilings),
      clinicalEvidenceByTicker: toTickerMap(clinicalTrials),
      marketDataByTicker,
      secFlagsByTicker,
    });

    return NextResponse.json({ alerts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
