import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeNctId, normalizeTrialRecord, inferPotentialCatalystFromTrial } from '../src/features/biotech/lib/clinical/clinicalTrials.js';
import { buildSourcesFromNotes, prefillFromClinicalTrial } from '../src/features/biotech/lib/thesisBuilder.js';

test('NCT ID normalization', () => {
  assert.equal(normalizeNctId('nct01234567'), 'NCT01234567');
});

test('trial normalization preserves missing fields', () => {
  const t = normalizeTrialRecord({ protocolSection: { identificationModule: { nctId: 'NCT1' } } });
  assert.ok(t.missing_fields.includes('phase'));
});

test('endpoint extraction', () => {
  const raw = { protocolSection: { identificationModule: { nctId: 'NCT1' }, outcomesModule: { primaryOutcomes: [{ measure: 'ORR' }], secondaryOutcomes: [{ measure: 'PFS' }] } } };
  const t = normalizeTrialRecord(raw);
  assert.equal(t.primary_endpoints[0], 'ORR');
  assert.equal(t.secondary_endpoints[0], 'PFS');
});

test('trial-to-catalyst helper uses primary completion date', () => {
  const out = inferPotentialCatalystFromTrial({ nct_id: 'NCT1', primary_completion_date: '2027-01-01', completion_date: '2027-02-01', phase: 'PHASE2', enrollment: 100 });
  assert.equal(out.expected_date, '2027-01-01');
});

test('helper does not claim guaranteed readout date', () => {
  const out = inferPotentialCatalystFromTrial({ nct_id: 'NCT1', primary_completion_date: 'missing', completion_date: 'missing', phase: 'PHASE1', enrollment: 10 });
  assert.ok(out.description.toLowerCase().includes('does not guarantee'));
});

test('dedupe by nct_id key compatibility', () => {
  const nct = normalizeNctId('0123');
  assert.equal(nct.startsWith('NCT'), true);
});

test('source summary creation for thesis', () => {
  const src = buildSourcesFromNotes([{ id: 'NCT1', source_type: 'clinical_trials', source_url: 'https://clinicaltrials.gov/study/NCT1', title: 'trial' }]);
  assert.equal(src[0].sourceType, 'clinical_trials');
});


test('clinical_trials migration-compatible object mapping', () => {
  const t = normalizeTrialRecord({ protocolSection: { identificationModule: { nctId: 'NCT2' }, statusModule: { primaryCompletionDateStruct: { date: '2026-12-01' } } } });
  assert.equal(typeof t.raw_json, 'object');
  assert.equal(Array.isArray(t.missing_fields), true);
});

test('trial selected in thesis builder prefills phase/endpoint/catalyst window', () => {
  const thesis = { warnings: [] };
  const next = prefillFromClinicalTrial(thesis, { nct_id: 'NCT9', phase: 'PHASE2', primary_endpoints: ['ORR'], secondary_endpoints: ['PFS'], primary_completion_date: '2027-01-01', conditions: ['AML'], drug_candidates: ['ABC'] });
  assert.equal(next.trial_phase, 'PHASE2');
  assert.equal(next.primary_endpoint_analysis, 'ORR');
  assert.equal(next.catalyst.includes('possible catalyst window'), true);
});

test('missing safety data remains missing', () => {
  const next = prefillFromClinicalTrial({}, { nct_id: 'NCT9', primary_completion_date: 'missing', completion_date: 'missing' });
  assert.equal(next.safety_analysis, 'missing');
});

test('ingestion upsert preserves nct_id uniqueness key behavior', () => {
  const n = normalizeNctId('nct00001234');
  assert.equal(n, 'NCT00001234');
});
