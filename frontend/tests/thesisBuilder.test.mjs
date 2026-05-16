import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSourcesFromNotes, thesisQualityGates, findMissingFields } from '../src/features/biotech/lib/thesisBuilder.js';

test('selected notes become source summaries', () => {
  const src = buildSourcesFromNotes([{ id: 'n1', source_type: 'manual', source_url: 'https://x', title: 'note' }]);
  assert.equal(src.length, 1);
  assert.equal(src[0].sourceId, 'n1');
});

test('thesis cannot save without sources or invalidation criteria', () => {
  const errs = thesisQualityGates({ bull_case: 'a', bear_case: 'b', base_case: 'c', invalidation_criteria: 'missing', confidence_label: 'low', warnings: ['none identified'], source_summary: [] });
  assert.ok(errs.includes('Source summary required'));
  assert.ok(errs.includes('Invalidation criteria required'));
});

test('missing fields are displayed not omitted', () => {
  const missing = findMissingFields({ company: 'missing', bull_case: 'ok', warnings: ['missing'] });
  assert.ok(missing.includes('company'));
  assert.ok(missing.includes('warnings'));
});
