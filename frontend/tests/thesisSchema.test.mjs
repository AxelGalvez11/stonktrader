import test from 'node:test';
import assert from 'node:assert/strict';
import { validateThesisJson } from '../src/features/biotech/lib/thesisSchema.js';

test('fails invalid thesis', () => {
  const r = validateThesisJson({ ticker: 'A' });
  assert.equal(r.ok, false);
});

test('accepts minimum valid thesis', () => {
  const r = validateThesisJson({
    ticker:'A',company:'B',drug:'C',indication:'D',mechanism:'E',trial_phase:'1',catalyst:'X',expected_date:'2026-01-01',science_summary:'Fact: a. Interpretation: b.',clinical_trial_design:'x',primary_endpoint_analysis:'x',secondary_endpoint_analysis:'x',safety_analysis:'x',standard_of_care:'x',competitor_landscape:'x',regulatory_risk:'x',financial_risk:'x',cash_runway:'missing',dilution_risk:'missing',market_expectation:'missing',bull_case:'x',bear_case:'x',base_case:'x',paper_trade_idea:'x',invalidation_criteria:'x',what_to_watch_next:[],source_summary:[{sourceId:'1'}],confidence_label:'low',warnings:[]
  });
  assert.equal(r.ok, true);
});
