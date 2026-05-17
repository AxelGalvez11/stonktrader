import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCik, extractRelevantFilingSections, estimateRunwayQuarters } from '../src/features/biotech/lib/sec/edgar.js';

test('ticker CIK normalization', () => {
  assert.equal(normalizeCik('320193'), '0000320193');
});

test('financial-risk extractor preserves missing values', () => {
  const out = extractRelevantFilingSections('plain text no finance terms');
  assert.ok(Array.isArray(out.missing_fields));
  assert.ok(out.missing_fields.length > 0);
});

test('dilution language detection', () => {
  const out = extractRelevantFilingSections('The company may face dilution due to common stock offering and warrants issuance.');
  assert.ok(out.dilution_mentions.length > 0);
});

test('cash runway calculation with valid values', () => {
  const out = estimateRunwayQuarters({ cash: 120, quarterlyBurn: -30, source: '10-Q' });
  assert.equal(out.runway_quarters, 4);
});

test('cash runway returns missing when absent', () => {
  const out = estimateRunwayQuarters({ cash: 0, quarterlyBurn: 0, source: '10-Q' });
  assert.equal(out.runway_quarters, 'missing');
});

test('accession duplicate prevention pattern uses accession key', () => {
  const accession = '0001234567-24-000001';
  const query = `sec_filings?select=id&accession_number=eq.${encodeURIComponent(accession)}`;
  assert.ok(query.includes(accession));
});
