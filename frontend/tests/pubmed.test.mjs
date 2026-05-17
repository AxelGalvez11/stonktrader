import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPubMedQueryFromTrialOrAsset, normalizePmid, normalizePubMedArticle, scorePubMedRelevance, extractScientificSignals } from '../src/features/biotech/lib/pubmed/pubmed.js';
import { buildSourcesFromNotes } from '../src/features/biotech/lib/thesisBuilder.js';

test('PubMed query builder from trial context', () => {
  const q = buildPubMedQueryFromTrialOrAsset({ drug: 'VK2735', indication: 'obesity', mechanism: 'GLP-1/GIP', primary_endpoint: 'weight loss' });
  assert.ok(q.includes('VK2735'));
});

test('PMID normalization', () => {
  assert.equal(normalizePmid('PMID: 12345'), '12345');
});

test('article normalization preserves missing fields', () => {
  const a = normalizePubMedArticle({ uid: '1', title: 'x' });
  assert.ok(a.missing_fields.includes('abstract'));
});

test('relevance scoring prefers context matches', () => {
  const article = { title: 'VK2735 in obesity as GLP-1/GIP receptor agonist', abstract: 'weight loss endpoint' };
  const s = scorePubMedRelevance(article, { drug: 'VK2735', indication: 'obesity', mechanism: 'GLP-1/GIP', primary_endpoint: 'weight loss' });
  assert.ok(s.relevance_score >= 70);
});

test('scientific signal extractor detects safety language', () => {
  const sig = extractScientificSignals({ title: 'Serious adverse event and hepatotoxicity risk', abstract: '' });
  assert.ok(sig.safety_signals.length > 0);
});

test('selected PubMed article becomes thesis source summary', () => {
  const src = buildSourcesFromNotes([{ id: 'pm:1', source_type: 'pubmed', source_url: 'https://pubmed.ncbi.nlm.nih.gov/1/', title: 'paper' }]);
  assert.equal(src[0].sourceType, 'pubmed');
});

test('missing fields displayed instead of hallucinated', () => {
  const a = normalizePubMedArticle({ uid: '2' });
  assert.ok(a.missing_fields.length > 0);
});
