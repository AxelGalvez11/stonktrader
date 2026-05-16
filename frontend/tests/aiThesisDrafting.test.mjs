import test from 'node:test';
import assert from 'node:assert/strict';
import { createAiClient, compressSources, generateStructuredThesisDraft, validateAiThesisDraft } from '../src/features/biotech/lib/ai/thesisDrafting.js';

test('mock provider works without API key', async () => {
  delete process.env.AI_API_KEY; process.env.AI_PROVIDER='mock';
  const c = createAiClient();
  assert.equal(c.provider, 'mock');
});

test('openai provider missing key fails gracefully', () => {
  delete process.env.AI_API_KEY; process.env.AI_PROVIDER='openai';
  assert.throws(() => createAiClient(), /AI_API_KEY/);
});

test('anthropic provider missing key fails gracefully', () => {
  delete process.env.AI_API_KEY; process.env.AI_PROVIDER='anthropic';
  assert.throws(() => createAiClient(), /AI_API_KEY/);
});

test('no selected sources blocks draft request', async () => {
  process.env.AI_PROVIDER='mock';
  await assert.rejects(async () => generateStructuredThesisDraft({ selectedSources: [] }));
});

test('provider metadata + compressed char count returned', async () => {
  process.env.AI_PROVIDER='mock';
  const r = await generateStructuredThesisDraft({ ticker:'VKTX', companyName:'Viking', selectedSources:[{ source_type:'sec', title:'10-Q', url:'u', summary:'s' }] });
  assert.equal(r.provider, 'mock');
  assert.equal(typeof r.compressed_source_char_count, 'number');
});

test('generated draft returns parse/validation envelope', async () => {
  process.env.AI_PROVIDER='mock';
  const r = await generateStructuredThesisDraft({ ticker:'X', companyName:'Y', selectedSources:[{source_type:'sec', title:'t', url:'u', summary:'s'}] });
  assert.equal(typeof r.validation.ok, 'boolean');
  assert.equal(typeof r.repaired, 'boolean');
});

test('validation catches missing source_summary / bear / invalidation', () => {
  const v = validateAiThesisDraft({ facts:[], interpretations:[], missing_fields:[], warnings:[], bull_case:'x', base_case:'x', confidence_label:'low', source_summary:[] }, [{source_type:'sec'}]);
  assert.equal(v.ok, false);
});

test('source compression preserves title/type/url', () => {
  const c = compressSources([{ source_type:'sec', title:'Long Title', url:'https://x', summary:'abc' }]);
  assert.equal(c[0].source_type, 'sec');
  assert.equal(c[0].title, 'Long Title');
  assert.equal(c[0].url, 'https://x');
});

test('forbidden certainty wording still flagged', () => {
  const v = validateAiThesisDraft({ source_summary:[{sourceId:'x'}], facts:[], interpretations:[], missing_fields:[], warnings:[], bull_case:'x', bear_case:'x', base_case:'x', invalidation_criteria:'y', confidence_label:'low', market_expectation:'it will go up' }, [{source_type:'sec'}]);
  assert.equal(v.issues.some(i=>i.includes('forbidden certainty wording')), true);
});

test('draft not saveable if validation fails', () => {
  const v = validateAiThesisDraft({ source_summary:[], confidence_label:'bad' }, [{source_type:'sec'}]);
  assert.equal(v.ok, false);
});
