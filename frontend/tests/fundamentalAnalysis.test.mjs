import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeDilutionHistory, buildFundamentalAnalysisReport, calculateBasicValuationMetrics, calculateBiotechRunway, classifyBiotechCompany } from '../src/features/biotech/lib/fundamentals/fundamentalAnalysis.js';
import { synthesizeEvidence } from '../src/features/biotech/lib/synthesis/evidenceSynthesis.js';

test('company classification profitable vs pre-revenue', () => {
  assert.equal(classifyBiotechCompany({ revenue: 1000000000, net_income: 100000000 }, [], {}, []), 'profitable_biotech');
  assert.equal(classifyBiotechCompany({ revenue: 0, net_income: -1000 }, [], {}, [{},{}]), 'pre_revenue_clinical_biotech');
});

test('runway calculation', () => {
  assert.equal(calculateBiotechRunway({ cash_and_equivalents: 400, quarterly_operating_cash_burn: 100 }), 4);
});

test('valuation missing-field handling', () => {
  const v = calculateBasicValuationMetrics({ revenue:'missing' }, {});
  assert.equal(v.price_to_sales, 'missing');
});

test('dilution risk detection', () => {
  const d = analyzeDilutionHistory([{ text:'ATM and S-3 offering' }]);
  assert.equal(d.dilution_risk, 'high');
});

test('fundamental report marks missing fields', () => {
  const r = buildFundamentalAnalysisReport({ ticker:'VKTX', secFilings:[], marketData:{}, pipeline:[] });
  assert.ok(Array.isArray(r.missing_data));
});

test('synthesis flags weak fundamentals vs strong bull case', () => {
  const s = synthesizeEvidence({ thesis:{ bull_case:'strong upside', financial_risk:'low' }, selectedSources:[{ source_type:'fundamentals', fundamentals:{ fundamental_quality:{ overall_label:'weak' }, financial_snapshot:{ estimated_runway_quarters:1 }, biotech_specific_metrics:{ dilution_risk:'high' } } }] });
  assert.ok(s.evidence_conflicts.some(x=>x.toLowerCase().includes('fundamental')));
});

test('no buy/sell language in fundamental report', () => {
  const r = buildFundamentalAnalysisReport({ ticker:'VKTX', secFilings:[], marketData:{}, pipeline:[] });
  const blob = JSON.stringify(r).toLowerCase();
  assert.equal(blob.includes('buy recommendation'), false);
});
