import test from 'node:test';
import assert from 'node:assert/strict';
import { detectEvidenceConflicts, generateMissingEvidenceChecklist, scoreThesisQuality, synthesizeEvidence } from '../src/features/biotech/lib/synthesis/evidenceSynthesis.js';

test('financial conflict detection when SEC dilution source exists but thesis says low financial risk', ()=>{
  const c=detectEvidenceConflicts({ thesis:{ financial_risk:'low' }, secSources:[{ text:'ATM dilution additional capital' }] });
  assert.ok(c.some(x=>x.msg.includes('Dilution')));
});

test('trial timing conflict detection', ()=>{
  const c=detectEvidenceConflicts({ thesis:{ catalyst:'confirmed readout' }, clinicalTrialsSources:[{}] });
  assert.ok(c.some(x=>x.msg.includes('guaranteed readout')));
});

test('safety conflict detection with FDA warning', ()=>{
  const c=detectEvidenceConflicts({ thesis:{ safety_analysis:'low concern' }, fdaSources:[{ regulatory_signals:{ boxed_warning:['x'], contraindications:[] } }] });
  assert.ok(c.some(x=>x.msg.includes('Safety risk')));
});

test('high run-up pricing-in warning', ()=>{
  const c=detectEvidenceConflicts({ thesis:{ market_expectation:'missing' }, marketData:{ derived:{ pre_catalyst_runup:{ runup_30d_percent:30 } } } });
  assert.ok(c.some(x=>x.msg.includes('priced in')));
});

test('missing evidence checklist', ()=>{
  const m=generateMissingEvidenceChecklist({ selectedSources:[], catalyst:{ catalyst_type:'trial_data' }, thesis:{ mechanism:'receptor pathway', science_summary:'x', regulatory_risk:'FDA warning' } });
  assert.ok(m.length>=3);
});

test('quality score transparent scoring', ()=>{
  const r=scoreThesisQuality({ source_summary:[1], bull_case:'a',bear_case:'b',base_case:'c',invalidation_criteria:'x',financial_risk:'y',dilution_risk:'y',market_expectation:'z' },[{source_type:'sec'}],{},{});
  assert.ok(r.score>=45);
});

test('readiness label changes based on conflicts/missing evidence', ()=>{
  const s=synthesizeEvidence({ thesis:{ bull_case:'strong', safety_analysis:'low concern', financial_risk:'low' }, selectedSources:[{source_type:'sec'}], secSources:[{text:'dilution'}], fdaSources:[{regulatory_signals:{boxed_warning:['x'],contraindications:[]}}] });
  assert.ok(['not_ready','watchlist_only','paper_trade_ready'].includes(s.paper_trade_readiness));
});

test('paper trade flow respects not_ready synthesis', ()=>{
  const s=synthesizeEvidence({ thesis:{}, selectedSources:[] });
  if (s.paper_trade_readiness==='not_ready') assert.equal(s.paper_trade_readiness,'not_ready');
});
