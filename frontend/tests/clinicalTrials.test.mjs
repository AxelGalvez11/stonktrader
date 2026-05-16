import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeNctId, normalizeTrialRecord, inferPotentialCatalystFromTrial } from '../src/features/biotech/lib/clinical/clinicalTrials.js';
import { buildSourcesFromNotes } from '../src/features/biotech/lib/thesisBuilder.js';

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
