import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';
import { requireUserId } from '@/lib/server/auth';
import { buildFundamentalAnalysisReport } from '@/features/biotech/lib/fundamentals/fundamentalAnalysis';

export async function POST(req: NextRequest){
  try{
    const userId = await requireUserId(req);
    const body = await req.json();
    const ticker = String(body.ticker||'').toUpperCase();
    if(!ticker) return NextResponse.json({ error:'ticker required' }, { status:400 });
    const [secResp, marketResp, trialResp] = await Promise.all([
      body.includeSec ? fetch(`${req.nextUrl.origin}/api/sec/filings?ticker=${ticker}`).then(r=>r.json()).catch(()=>({filings:[]})) : Promise.resolve({filings:[]}),
      body.includeMarketData ? fetch(`${req.nextUrl.origin}/api/market/quote?ticker=${ticker}`).then(r=>r.json()).catch(()=>({})) : Promise.resolve({}),
      body.includePipelineContext ? fetch(`${req.nextUrl.origin}/api/clinical-trials/search?ticker=${ticker}`).then(r=>r.json()).catch(()=>({trials:[]})) : Promise.resolve({trials:[]}),
    ]);
    const report = buildFundamentalAnalysisReport({ ticker, companyName: body.companyName, secFilings: secResp.filings||[], marketData: { quote: marketResp }, pipeline: trialResp.trials||[] });
    const payload = { user_id:userId, ticker, company_name:report.company_name, company_type:report.company_type, financial_snapshot:report.financial_snapshot, valuation_metrics:report.valuation_metrics, biotech_specific_metrics:report.biotech_specific_metrics, fundamental_quality:report.fundamental_quality, bull_case:report.bull_case, bear_case:report.bear_case, base_case:report.base_case, key_risks:report.key_risks, missing_data:report.missing_data, source_summary:report.source_summary };
    const saved = await sb('fundamental_reports', { method:'POST', body: JSON.stringify([payload]) });
    return NextResponse.json({ report, saved });
  }catch(e:any){ return NextResponse.json({ error:e.message }, { status:500 }); }
}
