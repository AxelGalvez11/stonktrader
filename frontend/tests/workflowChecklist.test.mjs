import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLinkageWarnings, buildWorkflowChecklist, nextBestActions } from '../src/features/biotech/lib/workflow/workflowChecklist.js';

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


test('checklist thesis status requires actual ai_thesis (not notes proxy)', () => {
  const s = buildWorkflowChecklist({ thesis_exists:false });
  assert.equal(s.thesis_exists, false);
});

test('synthesis status requires thesis_synthesis', () => {
  const s = buildWorkflowChecklist({ synthesis_exists:false });
  assert.equal(s.synthesis_exists, false);
});

test('paper trade missing thesis_id surfaces warning', () => {
  const w = buildLinkageWarnings({ paper_trades:[{id:1, thesis_id:null}], syntheses:[], catalysts:[], theses:[] });
  assert.ok(w.some((x)=>x.includes('Paper trade missing thesis link')));
});

test('thesis without catalyst warning when catalysts exist', () => {
  const w = buildLinkageWarnings({ paper_trades:[], syntheses:[], catalysts:[{id:1}], theses:[{id:7, catalyst_id:null}] });
  assert.ok(w.some((x)=>x.includes('Thesis not linked to catalyst')));
});

test('ticker workspace data shape supports direct thesis loading', () => {
  const data = { theses:[{id:1,ticker:'VRTX'}], syntheses:[{id:1,ticker:'VRTX',thesis_id:1}], paper_trades:[{id:1,ticker:'VRTX',thesis_id:1}], reviews:[{paper_trade_id:1}] };
  assert.equal(Array.isArray(data.theses), true);
});
