import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLearningAnalytics, summarizeMistakePatterns, summarizeRiskBlindSpots, summarizeThesisQuality, summarizeCatalystTypePerformance, summarizeAlertReviewAssociations, generateLearningRecommendations } from '../src/features/biotech/lib/learningAnalytics.js';

test('mistake category counts and top recurring extraction', () => {
  const m = summarizeMistakePatterns([{ mistake_category:'dilution' },{ mistake_category:'dilution' },{ mistake_category:'pricing' }]);
  assert.equal(m.by_category.dilution, 2);
  assert.equal(m.top_recurring[0].category, 'dilution');
});

test('risk blind spot counts', () => {
  const r = summarizeRiskBlindSpots([{ notes:'dilution and safety and endpoint and run-up and liquidity and regulatory and science' }], [], []);
  assert.equal(r.ignored_dilution_risk > 0, true);
  assert.equal(r.overestimated_mechanism_science > 0, true);
});

test('average thesis score and readiness grouping', () => {
  const q = summarizeThesisQuality([{ thesis_id:1, ticker:'ABC', quality_score:80, quality_label:'strong', paper_trade_readiness:'paper_trade_ready' }], [{ thesis_id:1, ticker:'ABC', result_percent:10 }]);
  assert.equal(q.average_result_by_readiness_label.paper_trade_ready, 10);
});

test('catalyst type performance grouping', () => {
  const c = summarizeCatalystTypePerformance([{ id:1, catalyst_type:'trial_data' }], [{ id:9, catalyst_id:1, result_percent:5 }], [{ paper_trade_id:9, mistake_category:'endpoint' }]);
  assert.equal(c.trial_data.average_result_percent, 5);
});

test('alert to review association mapping', () => {
  const a = summarizeAlertReviewAssociations([{ alert_type:'high_dilution', catalyst_id:1 }], [{ paper_trade_id:2, mistake_category:'dilution', notes:'dilution issue' }], [{ id:2, catalyst_id:1 }], []);
  assert.equal(a.associations.dilution_to_dilution_mistake, 1);
});

test('recommendations for repeated dilution misses', () => {
  const rec = generateLearningRecommendations({ risk_blind_spots:{ ignored_dilution_risk:3 }, alert_review_associations:{ associations:{ dilution_to_dilution_mistake:1 } } });
  assert.ok(rec.some((x)=>x.toLowerCase().includes('sec evidence')));
});

test('graceful empty state and missing data warnings', () => {
  const out = buildLearningAnalytics({ paper_trades:[], trade_reviews:[], thesis_syntheses:[], catalysts:[], alerts:[] });
  assert.ok(out.missing_data.some((x)=>x.code==='no_trade_reviews'));
  assert.ok(out.recommendations[0].toLowerCase().includes('learning recommendation'));
});
