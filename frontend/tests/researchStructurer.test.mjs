import test from 'node:test';
import assert from 'node:assert/strict';
import { structureResearchNote } from '../src/features/biotech/lib/researchStructurer.js';

test('marks missing fields when absent', () => {
  const out = structureResearchNote({ raw_text: 'random note', ticker: 'BEAM', company: 'Beam' });
  assert.equal(out.trial_phase, 'missing');
  assert.ok(out.missing_fields.includes('trial_phase'));
});

test('extracts simple labeled fields', () => {
  const out = structureResearchNote({ raw_text: 'Drug: ABC-101\nIndication: AML\nPrimary endpoint: ORR\nSafety: neutropenia', ticker: 'X', company: 'Y' });
  assert.equal(out.drug_candidate, 'ABC-101');
  assert.equal(out.indication, 'AML');
});
