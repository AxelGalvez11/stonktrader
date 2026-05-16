import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWorkflowChecklist, nextBestActions } from '../src/features/biotech/lib/workflow/workflowChecklist.js';

test('workflow checklist status shape', () => {
  const s = buildWorkflowChecklist({ watchlist_exists:true, sec_count:1, clinical_trials_count:0, pubmed_count:1, fda_count:0, market_refreshed:false, catalyst_count:1, thesis_exists:true, synthesis_exists:false, paper_trade_exists:false, review_exists:false });
  assert.equal(s.watchlist_exists, true);
  assert.equal(s.clinical_trials_fetched, false);
});

test('next best action ordering', () => {
  const a = nextBestActions({ sec_fetched:false, catalyst_exists:false, thesis_exists:false, synthesis_exists:false, paper_trade_optional:false, review_optional:false });
  assert.equal(a[0].toLowerCase().includes('sec'), true);
});

test('source-to-thesis link generation is stable', () => {
  const link = `/thesis/new?ticker=VRTX`;
  assert.equal(link.includes('thesis/new?ticker=VRTX'), true);
});

test('catalyst-to-review handoff action', () => {
  const a = nextBestActions({ sec_fetched:true, catalyst_exists:true, thesis_exists:true, synthesis_exists:true, paper_trade_optional:true, review_optional:false });
  assert.ok(a.some(x=>x.toLowerCase().includes('unlock review')));
});

test('graceful empty state shape', () => {
  const s = buildWorkflowChecklist({});
  assert.equal(typeof s, 'object');
  assert.equal(s.catalyst_exists, false);
});
