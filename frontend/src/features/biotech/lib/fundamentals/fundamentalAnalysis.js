function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
const miss=(o,k)=>{if(o[k]==null)o[k]='missing';};

export function extractFinancialFundamentals(secFilings=[]) {
  const txt = JSON.stringify(secFilings).toLowerCase();
  const out = { revenue:'missing', revenue_growth:'missing', gross_margin:'missing', operating_income:'missing', net_income:'missing', free_cash_flow:'missing', cash_and_equivalents:'missing', short_term_investments:'missing', total_debt:'missing', quarterly_operating_cash_burn:'missing', estimated_runway_quarters:'missing', market_cap:'missing', enterprise_value:'missing', shares_outstanding:'missing', missing_fields:[] };
  if (txt.includes('revenue')) out.revenue = n(secFilings[0]?.extracted?.revenue) ?? 'missing';
  if (txt.includes('cash')) out.cash_and_equivalents = n(secFilings[0]?.extracted?.cash) ?? 'missing';
  if (txt.includes('debt')) out.total_debt = n(secFilings[0]?.extracted?.debt) ?? 'missing';
  out.missing_fields = Object.entries(out).filter(([k,v])=>k!=='missing_fields'&&v==='missing').map(([k])=>k);
  return out;
}

export function calculateBiotechRunway(financials){
  const cash=n(financials.cash_and_equivalents); const burn=n(financials.quarterly_operating_cash_burn);
  if(cash==null||burn==null||burn<=0) return 'missing';
  return cash/burn;
}

export function calculateBasicValuationMetrics(financials, marketData={}){
  const mc=n(marketData.quote?.market_cap||financials.market_cap); const ev=n(marketData.quote?.enterprise_value||financials.enterprise_value); const rev=n(financials.revenue); const ni=n(financials.net_income); const fcf=n(financials.free_cash_flow);
  const out={ price_to_sales:'missing', enterprise_value_to_sales:'missing', price_to_earnings:'missing', price_to_free_cash_flow:'missing', ev_to_pipeline_context:'missing', missing_fields:[] };
  if(mc!=null&&rev&&rev>0) out.price_to_sales=mc/rev;
  if(ev!=null&&rev&&rev>0) out.enterprise_value_to_sales=ev/rev;
  if(mc!=null&&ni&&ni>0) out.price_to_earnings=mc/ni;
  if(mc!=null&&fcf&&fcf>0) out.price_to_free_cash_flow=mc/fcf;
  out.missing_fields=Object.entries(out).filter(([k,v])=>k!=='missing_fields'&&v==='missing').map(([k])=>k);
  return out;
}

export function analyzeProductConcentration(secFilings=[], companyData={}){
  const t=JSON.stringify(secFilings).toLowerCase();
  const single = t.includes('single product') || t.includes('lead asset');
  return { single_asset_dependency: single?'high':'moderate', product_concentration_risk: single?'high':'moderate', patent_or_exclusivity_risk: t.includes('patent')?'moderate':'missing', partnership_dependency: t.includes('partner')?'moderate':'missing' };
}

export function analyzeDilutionHistory(secFilings=[]){
  const t=JSON.stringify(secFilings).toLowerCase();
  return { dilution_risk: (t.includes('offering')||t.includes('atm')||t.includes('s-3'))?'high':'moderate', atm_or_shelf_presence: t.includes('atm')||t.includes('s-3'), recent_offering_activity: t.includes('offering') };
}

export function classifyBiotechCompany(financials={}, secFilings=[], marketData={}, pipeline=[]){
  const rev=n(financials.revenue); const ni=n(financials.net_income); const trials=(pipeline||[]).length;
  if(rev&&rev>500000000&&ni&&ni>0) return 'profitable_biotech';
  if(rev&&rev>0&&(!ni||ni<=0)) return 'commercial_stage_biotech';
  if((!rev||rev===0)&&trials>0) return 'pre_revenue_clinical_biotech';
  if(trials>3) return 'platform_biotech';
  return 'unknown';
}

export function analyzeFundamentalRisks(inputs){
  const risks=[]; const f=inputs.financials;
  if(calculateBiotechRunway(f)!=='missing' && calculateBiotechRunway(f)<2) risks.push('Runway may be under 2 quarters (approximate).');
  if(inputs.dilution.dilution_risk==='high') risks.push('Dilution risk appears elevated from observed public filing language.');
  if(inputs.product.single_asset_dependency==='high') risks.push('Single-asset dependency risk appears elevated.');
  return risks;
}

export function buildFundamentalAnalysisReport(inputs){
  const financial_snapshot = extractFinancialFundamentals(inputs.secFilings||[]);
  financial_snapshot.market_cap = n(inputs.marketData?.quote?.market_cap) ?? 'missing';
  financial_snapshot.enterprise_value = n(inputs.marketData?.quote?.enterprise_value) ?? 'missing';
  financial_snapshot.estimated_runway_quarters = calculateBiotechRunway(financial_snapshot);
  const valuation_metrics = calculateBasicValuationMetrics(financial_snapshot, inputs.marketData||{});
  const product = analyzeProductConcentration(inputs.secFilings||[], inputs.companyData||{});
  const dilution = analyzeDilutionHistory(inputs.secFilings||[]);
  const company_type = classifyBiotechCompany(financial_snapshot, inputs.secFilings||[], inputs.marketData||{}, inputs.pipeline||[]);
  const biotech_specific_metrics = { cash_runway: financial_snapshot.estimated_runway_quarters, dilution_risk:dilution.dilution_risk, atm_or_shelf_presence:dilution.atm_or_shelf_presence, recent_offering_activity:dilution.recent_offering_activity, ...product, missing_fields: Object.entries({...product,...dilution}).filter(([k,v])=>v==='missing').map(([k])=>k) };
  const fundamental_quality = { profitability_score: company_type==='profitable_biotech'?80:company_type==='commercial_stage_biotech'?60:30, balance_sheet_score: financial_snapshot.estimated_runway_quarters==='missing'?40:(financial_snapshot.estimated_runway_quarters>4?75:45), dilution_risk_score: dilution.dilution_risk==='high'?30:60, revenue_quality_score: financial_snapshot.revenue==='missing'?30:65, pipeline_dependency_score: product.single_asset_dependency==='high'?30:60, overall_label:'unknown' };
  const avg=(fundamental_quality.profitability_score+fundamental_quality.balance_sheet_score+fundamental_quality.dilution_risk_score+fundamental_quality.revenue_quality_score+fundamental_quality.pipeline_dependency_score)/5;
  fundamental_quality.overall_label = avg<40?'weak':avg<55?'developing':avg<75?'reasonable':'strong';
  const key_risks = analyzeFundamentalRisks({ financials: financial_snapshot, dilution, product });
  return { ticker: inputs.ticker, company_name: inputs.companyName||'missing', company_type, financial_snapshot, valuation_metrics, biotech_specific_metrics, fundamental_quality, bull_case:'Observed public financial data may support improving operating profile if execution continues (paper-trading analysis only).', bear_case:'Observed public financial data may imply dilution/runway/concentration downside risk if financing or execution weakens.', base_case:'Observed public financial data is mixed; use conservative paper-trading analysis and mark missing fields.', key_risks, missing_data:[...financial_snapshot.missing_fields,...valuation_metrics.missing_fields,...biotech_specific_metrics.missing_fields], source_summary:[{source_type:'sec',title:'SEC filings',source_url:'missing'},{source_type:'market',title:'Market snapshot',source_url:'missing'},{source_type:'clinical_trials',title:'Pipeline context',source_url:'missing'}] };
}
