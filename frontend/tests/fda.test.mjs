import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFdaQueryFromThesisContext, normalizeFdaLabel, extractRegulatorySignals } from '../src/features/biotech/lib/fda/fda.js';
import { buildSourcesFromNotes } from '../src/features/biotech/lib/thesisBuilder.js';

test('FDA query builder from thesis context', () => {
  const q = buildFdaQueryFromThesisContext({ drug: 'suzetrigine', indication: 'acute pain', mechanism: 'NaV1.8 inhibitor', company: 'Vertex' });
  assert.ok(q.includes('suzetrigine'));
});

test('label normalization preserves missing fields', () => {
  const r = normalizeFdaLabel({ id: 'x' });
  assert.ok(r.missing_fields.includes('drug_name'));
});

test('regulatory signal extractor detects boxed warning language', () => {
  const s = extractRegulatorySignals({ boxed_warning: ['Boxed warning: severe toxicity'] });
  assert.ok(s.boxed_warning.length > 0);
});

test('contraindication detection', () => {
  const s = extractRegulatorySignals({ contraindications: ['contraindication in pregnancy'] });
  assert.ok(s.contraindications.length > 0);
});

test('safety warning detection', () => {
  const s = extractRegulatorySignals({ warnings_and_precautions: ['warnings and precautions include infection'] });
  assert.ok(s.safety_warnings.length > 0);
});

test('selected FDA source becomes thesis source summary', () => {
  const src = buildSourcesFromNotes([{ id: 'fda:1', source_type: 'fda', source_url: 'https://open.fda.gov/', title: 'label' }]);
  assert.equal(src[0].sourceType, 'fda');
});

test('missing fields displayed instead of hallucinated', () => {
  const r = normalizeFdaLabel({});
  assert.ok(r.missing_fields.length > 0);
});
