import test from 'node:test';
import assert from 'node:assert/strict';
import { compressSources, generateStructuredThesisDraft, validateAiThesisDraft } from '../src/features/biotech/lib/ai/thesisDrafting.js';

test('no selected sources blocks draft request', async () => {
  await assert.rejects(async () => generateStructuredThesisDraft({ selectedSources: [] }));
});

test('mock AI draft returns required thesis fields', async () => {
  const draft = await generateStructuredThesisDraft({ ticker:'VKTX', companyName:'Viking', selectedSources:[{ source_type:'sec', title:'10-Q', url:'u', summary:'s' }], draftPreferences:{ includeFollowUpQuestions:true } });
  assert.equal(typeof draft.bear_case, 'string');
  assert.equal(Array.isArray(draft.source_summary), true);
});

test('validation catches missing source_summary', () => {
  const v = validateAiThesisDraft({ bear_case:'x', invalidation_criteria:'y', source_summary:[] });
  assert.equal(v.ok, false);
});

test('validation catches missing bear_case', () => {
  const v = validateAiThesisDraft({ source_summary:[{a:1}], invalidation_criteria:'y' });
  assert.equal(v.issues.some(i=>i.includes('bear_case')), true);
});

test('validation catches missing invalidation_criteria', () => {
  const v = validateAiThesisDraft({ source_summary:[{a:1}], bear_case:'x' });
  assert.equal(v.issues.some(i=>i.includes('invalidation_criteria')), true);
});

test('source compression preserves title/type/url', () => {
  const c = compressSources([{ source_type:'sec', title:'Long Title', url:'https://x', summary:'abc' }]);
  assert.equal(c[0].source_type, 'sec');
  assert.equal(c[0].title, 'Long Title');
  assert.equal(c[0].url, 'https://x');
});

test('forbidden certainty wording is flagged', () => {
  const v = validateAiThesisDraft({ source_summary:[{a:1}], bear_case:'x', invalidation_criteria:'y', bull_case:'guaranteed outcome' });
  assert.equal(v.issues.some(i=>i.includes('forbidden certainty wording')), true);
});

test('draft can be applied to guided form state', async () => {
  const d = await generateStructuredThesisDraft({ ticker:'VKTX', companyName:'V', selectedSources:[{ source_type:'sec', title:'a', url:'u', summary:'s' }] });
  const form = { ticker:'OLD', bull_case:'missing' };
  const applied = { ...form, ...d };
  assert.equal(applied.ticker, 'VKTX');
});

test('missing fields displayed not silently filled', async () => {
  const d = await generateStructuredThesisDraft({ ticker:'VKTX', companyName:'V', selectedSources:[{ source_type:'sec', title:'a', url:'u', summary:'s' }] });
  assert.equal(d.missing_fields.includes('drug'), true);
});
