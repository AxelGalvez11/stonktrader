import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { sb } from '@/lib/supabase/rest';
import { buildDcfModel, buildHybridBiotechModel, buildRiskAdjustedPipelineModel, classifyModelType, generateScenarioAnalysis, stressTestAssumptions } from '@/features/biotech/lib/financialModeling';

export async function POST(req: NextRequest){
  try{
    const userId = await requireUserId(req);
    const body = await req.json();
    const ticker = String(body?.ticker||'').toUpperCase();
    if(!ticker) return NextResponse.json({ error:'ticker required' }, { status:400 });
    const fundamentals = ((await sb(`fundamental_reports?select=*&ticker=eq.${ticker}&user_id=eq.${userId}&order=created_at.desc&limit=1`))||[])[0]||{};
    const trials = await sb(`clinical_trials?select=*&ticker=eq.${ticker}&user_id=eq.${userId}&order=created_at.desc&limit=20`);
    const market = ((await sb(`market_snapshots?select=*&ticker=eq.${ticker}&user_id=eq.${userId}&order=captured_at.desc&limit=1`))||[])[0]||{};
    const model_type = body?.model_type || classifyModelType(fundamentals.company_type, fundamentals, trials);
    const assumptions = { ...body?.assumptions, ticker, current_price: body?.assumptions?.current_price ?? market?.price, shares_outstanding: body?.assumptions?.shares_outstanding ?? market?.shares_outstanding, market_cap: body?.assumptions?.market_cap ?? market?.market_cap, cash: body?.assumptions?.cash ?? fundamentals?.financial_snapshot?.cash_and_equivalents, debt: body?.assumptions?.debt ?? fundamentals?.financial_snapshot?.total_debt, revenue: body?.assumptions?.revenue ?? fundamentals?.financial_snapshot?.revenue, assets: body?.assumptions?.assets || (trials||[]).slice(0,5).map((t:any)=>({ drug_name:t.interventions?.[0]||ticker, indication:t.conditions?.[0]||'missing', phase:t.phase||'missing', estimated_peak_sales:0, probability_of_success:null, estimated_margin:0.25, years_to_peak_sales:5, exclusivity_years:8, discount_rate:0.14 })) };
    const model_output = model_type==='dcf'?buildDcfModel(assumptions):model_type==='risk_adjusted_pipeline'?buildRiskAdjustedPipelineModel(assumptions):buildHybridBiotechModel(assumptions);
    const scenario_analysis = generateScenarioAnalysis({ ...assumptions, model_type });
    const warnings = [...(model_output.warnings||[]), ...stressTestAssumptions(model_output), 'Valuation model is user-editable assumptions only.', 'Paper-trading analysis only; not investment advice.'];
    const payload = { user_id:userId, ticker, model_type, input_assumptions:assumptions, model_output:{ ...model_output, warnings }, scenario_analysis, source_summary:{ selected_sources:body?.selected_sources||[], fundamentals_report_id:fundamentals?.id||'missing', clinical_trials_count:(trials||[]).length, market_snapshot_id:market?.id||'missing', safety_language:['not predictive','model output depends heavily on assumptions'] } };
    const saved = await sb('financial_models', { method:'POST', body: JSON.stringify([payload]) });
    return NextResponse.json({ model: saved?.[0]||payload, model_output: payload.model_output, scenario_analysis, suggested_model_type:model_type });
  }catch(e:any){ return NextResponse.json({ error:e.message||'build failed' }, { status:500 }); }
}
