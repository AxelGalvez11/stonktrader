const MISSING = 'missing';
const n = (x) => (x === null || x === undefined || x === '' || Number.isNaN(Number(x)) ? null : Number(x));

export function calculateEnterpriseValue(marketCap, cash, debt){
  const mc=n(marketCap), c=n(cash)||0, d=n(debt)||0;
  if(mc===null) return MISSING;
  return mc + d - c;
}
export function calculateIntrinsicValuePerShare(equityValue, sharesOutstanding){
  const e=n(equityValue), s=n(sharesOutstanding);
  if(e===null||s===null||s<=0) return MISSING;
  return e/s;
}
export function calculateUpsideDownside(intrinsicValuePerShare, currentPrice){
  const i=n(intrinsicValuePerShare), p=n(currentPrice);
  if(i===null||p===null||p<=0) return MISSING;
  return ((i-p)/p)*100;
}

export function classifyModelType(companyType, fundamentals={}, pipeline=[]){
  const t=String(companyType||fundamentals?.company_type||'').toLowerCase();
  const revenue=n(fundamentals?.financial_snapshot?.revenue ?? fundamentals?.revenue);
  if((t.includes('profitable')||t.includes('commercial')) && revenue!==null && revenue>0 && (!pipeline||pipeline.length===0)) return 'dcf';
  if((t.includes('pre')||t.includes('clinical')) || revenue===null || revenue<=0) return 'risk_adjusted_pipeline';
  return 'hybrid';
}

export function buildDcfModel(inputs={}){
  const miss=[]; const warnings=[];
  const req=['revenue','revenue_growth_rate','free_cash_flow_margin','discount_rate','terminal_growth_rate','projection_years','cash','debt','shares_outstanding','current_price'];
  req.forEach(k=>n(inputs[k])===null&&miss.push(k));
  const years=Math.max(1,Math.min(15,n(inputs.projection_years)||5));
  const rev0=n(inputs.revenue)||0, g=n(inputs.revenue_growth_rate)||0, fcfm=n(inputs.free_cash_flow_margin)||0, dr=n(inputs.discount_rate)||0.12, tg=n(inputs.terminal_growth_rate)||0.02;
  if(tg>=dr) warnings.push('Terminal growth should be below discount rate for stability.');
  const projected_revenue=[]; const projected_free_cash_flow=[]; const discounted_cash_flows=[];
  for(let y=1;y<=years;y++){
    const rev=rev0*Math.pow(1+g,y); const fcf=rev*fcfm; const dcf=fcf/Math.pow(1+dr,y);
    projected_revenue.push(rev); projected_free_cash_flow.push(fcf); discounted_cash_flows.push(dcf);
  }
  const lastFcf=projected_free_cash_flow[projected_free_cash_flow.length-1]||0;
  const terminal_value=(dr-tg)>0 ? (lastFcf*(1+tg))/(dr-tg) : 0;
  const pv_terminal=terminal_value/Math.pow(1+dr,years);
  const enterprise_value=discounted_cash_flows.reduce((a,b)=>a+b,0)+pv_terminal;
  const equity_value=enterprise_value + (n(inputs.cash)||0) - (n(inputs.debt)||0);
  const intrinsic=calculateIntrinsicValuePerShare(equity_value, inputs.shares_outstanding);
  return { projected_revenue, projected_free_cash_flow, discounted_cash_flows, terminal_value:pv_terminal, enterprise_value, equity_value, intrinsic_value_per_share:intrinsic, current_price:n(inputs.current_price)??MISSING, upside_downside_percent:calculateUpsideDownside(intrinsic,inputs.current_price), assumptions:inputs, missing_fields:miss, warnings };
}

const PHASE_POS={preclinical:0.08,'phase 1':0.12,'phase 2':0.25,'phase 3':0.5,approved:0.9,commercial:0.95};
export function buildRiskAdjustedPipelineModel(inputs={}){
  const miss=[]; const warnings=[];
  const assets=Array.isArray(inputs.assets)?inputs.assets:[];
  if(!assets.length) miss.push('assets');
  const risk_adjusted_asset_values=assets.map((a)=>{
    const peak=n(a.estimated_peak_sales); const p=n(a.probability_of_success) ?? PHASE_POS[String(a.phase||'').toLowerCase()] ?? 0.15;
    const m=n(a.estimated_margin)||0.25; const y=n(a.years_to_peak_sales)||5; const ex=n(a.exclusivity_years)||8; const dr=n(a.discount_rate)||0.14;
    if(peak===null) warnings.push(`Missing peak sales for ${a.drug_name||'asset'}`);
    const ann=(peak||0)*m*p; let pv=0; for(let i=1;i<=ex;i++){ pv += ann/Math.pow(1+dr,y+i-1); }
    return { drug_name:a.drug_name||MISSING, indication:a.indication||MISSING, phase:a.phase||MISSING, probability_of_success:p, risk_adjusted_value:pv };
  });
  const total=risk_adjusted_asset_values.reduce((s,a)=>s+(a.risk_adjusted_value||0),0);
  const dilution=n(inputs.dilution_assumptions?.dilution_percent)||0;
  const cashAdjusted = total + (n(inputs.cash)||0) - (n(inputs.debt)||0);
  const estimated_equity_value = cashAdjusted * (1-dilution);
  const intrinsic=calculateIntrinsicValuePerShare(estimated_equity_value, inputs.shares_outstanding);
  return { enterprise_value:n(inputs.enterprise_value) ?? calculateEnterpriseValue(inputs.market_cap,inputs.cash,inputs.debt), risk_adjusted_asset_values, total_risk_adjusted_pipeline_value:total, cash_adjusted_value:cashAdjusted, estimated_equity_value, intrinsic_value_per_share:intrinsic, current_price:n(inputs.current_price)??MISSING, upside_downside_percent:calculateUpsideDownside(intrinsic,inputs.current_price), assumptions:inputs, missing_fields:miss, warnings };
}

export function buildHybridBiotechModel(inputs={}){
  const dcf=buildDcfModel(inputs);
  const pipe=buildRiskAdjustedPipelineModel(inputs);
  const equity=(n(dcf.equity_value)||0)+(n(pipe.estimated_equity_value)||0);
  const intrinsic=calculateIntrinsicValuePerShare(equity, inputs.shares_outstanding);
  return { ...dcf, pipeline_component:pipe, equity_value:equity, intrinsic_value_per_share:intrinsic, upside_downside_percent:calculateUpsideDownside(intrinsic,inputs.current_price), warnings:[...dcf.warnings,...pipe.warnings,'Hybrid valuation model combines observed operations plus pipeline assumptions.'] };
}

export function generateScenarioAnalysis(inputs={}){
  const mt=inputs.model_type||'dcf';
  const mk=(adj)=> ({...inputs, ...adj, assets:(inputs.assets||[]).map((a)=>({...a,...(adj.assetAdj||{})}))});
  const base = mt==='dcf'?buildDcfModel(mk({})):mt==='risk_adjusted_pipeline'?buildRiskAdjustedPipelineModel(mk({})):buildHybridBiotechModel(mk({}));
  const bull = mt==='dcf'?buildDcfModel(mk({revenue_growth_rate:(n(inputs.revenue_growth_rate)||0)*1.2, free_cash_flow_margin:(n(inputs.free_cash_flow_margin)||0)*1.15})):buildRiskAdjustedPipelineModel(mk({assetAdj:{estimated_peak_sales:(n((inputs.assets||[])[0]?.estimated_peak_sales)||0)*1.2, probability_of_success:Math.min(0.95,(n((inputs.assets||[])[0]?.probability_of_success)||0.2)+0.1)}, dilution_assumptions:{dilution_percent:Math.max(0,(n(inputs.dilution_assumptions?.dilution_percent)||0)-0.05)}}));
  const bear = mt==='dcf'?buildDcfModel(mk({revenue_growth_rate:(n(inputs.revenue_growth_rate)||0)*0.5, free_cash_flow_margin:(n(inputs.free_cash_flow_margin)||0)*0.75})):buildRiskAdjustedPipelineModel(mk({assetAdj:{estimated_peak_sales:(n((inputs.assets||[])[0]?.estimated_peak_sales)||0)*0.7, probability_of_success:Math.max(0,(n((inputs.assets||[])[0]?.probability_of_success)||0.2)-0.15)}, dilution_assumptions:{dilution_percent:(n(inputs.dilution_assumptions?.dilution_percent)||0)+0.1}}));
  return { bull_case:bull, base_case:base, bear_case:bear, scenario_table:[{scenario:'bull',intrinsic_value_per_share:bull.intrinsic_value_per_share,upside_downside_percent:bull.upside_downside_percent},{scenario:'base',intrinsic_value_per_share:base.intrinsic_value_per_share,upside_downside_percent:base.upside_downside_percent},{scenario:'bear',intrinsic_value_per_share:bear.intrinsic_value_per_share,upside_downside_percent:bear.upside_downside_percent}], sensitivity_notes:['Valuation model is user-editable and not predictive.','Model output depends heavily on assumptions.','Paper-trading analysis only; not investment advice.'] };
}

export function stressTestAssumptions(model){
  const out=[];
  if(Math.abs(n(model?.upside_downside_percent)||0)>100) out.push('Output is highly sensitive versus current price.');
  if((model?.missing_fields||[]).length) out.push('Missing fields reduce reliability.');
  return out;
}
