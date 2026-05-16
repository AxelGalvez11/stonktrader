import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDcfModel, buildRiskAdjustedPipelineModel, calculateEnterpriseValue, calculateUpsideDownside, generateScenarioAnalysis } from '../src/features/biotech/lib/financialModeling.js';
import { synthesizeEvidence } from '../src/features/biotech/lib/synthesis/evidenceSynthesis.js';

test('enterprise value and upside calculations', ()=>{
  assert.equal(calculateEnterpriseValue(1000,200,100),900);
  assert.equal(Math.round(calculateUpsideDownside(12,10)),20);
});

test('dcf intrinsic value and missing fields', ()=>{
  const r=buildDcfModel({ revenue:100, revenue_growth_rate:0.1, free_cash_flow_margin:0.2, discount_rate:0.12, terminal_growth_rate:0.02, projection_years:5, cash:50, debt:10, shares_outstanding:20, current_price:8 });
  assert.ok(r.intrinsic_value_per_share>0);
  const m=buildDcfModel({ revenue:100 });
  assert.ok(m.missing_fields.includes('current_price'));
});

test('risk-adjusted pipeline value and scenarios', ()=>{
  const r=buildRiskAdjustedPipelineModel({ shares_outstanding:100, current_price:5, cash:50, debt:0, assets:[{drug_name:'A',phase:'phase 2',estimated_peak_sales:1000,probability_of_success:0.3,estimated_margin:0.3,years_to_peak_sales:4,exclusivity_years:8,discount_rate:0.12}], dilution_assumptions:{dilution_percent:0.2} });
  assert.ok(r.total_risk_adjusted_pipeline_value>0);
  const s=generateScenarioAnalysis({ model_type:'risk_adjusted_pipeline', shares_outstanding:100, current_price:5, assets:[{estimated_peak_sales:1000,probability_of_success:0.3}] });
  assert.equal(s.scenario_table.length,3);
});

test('synthesis flags valuation vs dilution conflict and no buy/sell language', ()=>{
  const syn=synthesizeEvidence({ thesis:{financial_risk:'low',bull_case:'strong upside'}, selectedSources:[{source_type:'fundamentals', fundamentals:{biotech_specific_metrics:{dilution_risk:'high'},fundamental_quality:{overall_label:'weak'}}},{source_type:'financial_model', financialModel:{model_type:'risk_adjusted_pipeline', model_output:{upside_downside_percent:30,warnings:['highly sensitive']}}}], pubmedSources:[] });
  assert.ok(syn.evidence_conflicts.some(x=>x.toLowerCase().includes('dilution')||x.toLowerCase().includes('valuation')));
  assert.ok(!JSON.stringify(syn).toLowerCase().includes('buy') && !JSON.stringify(syn).toLowerCase().includes('sell'));
});
