import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTradeReviewInput, analyzeReview } from '../src/features/biotech/lib/reviewAnalyzer.js';

test('cannot save review without lesson learned', () => {
  const errs = validateTradeReviewInput({ paper_trade_id: '1', catalyst_outcome: 'met', stock_reaction_percent: '5%', mistake_category: 'other', future_rule: 'x' });
  assert.ok(errs.includes('lesson learned required'));
});

test('cannot save review without mistake category', () => {
  const errs = validateTradeReviewInput({ paper_trade_id: '1', catalyst_outcome: 'met', stock_reaction_percent: '5%', lesson_learned: 'x', future_rule: 'y' });
  assert.ok(errs.includes('mistake category required'));
});

test('review analyzer preserves missing values', () => {
  const out = analyzeReview({ originalThesis: null, paperTrade: null, reviewNotes: {}, catalystOutcome: '', stockReaction: '' });
  assert.equal(out.scientific_accuracy, 'missing');
  assert.equal(out.market_accuracy, 'missing');
});

test('reviewed paper trade gets review status via patch intent', () => {
  const errs = validateTradeReviewInput({ paper_trade_id: '123', catalyst_outcome: 'met', stock_reaction_percent: 'not available', lesson_learned: 'x', mistake_category: 'other', future_rule: 'y' });
  assert.equal(errs.length, 0);
});

test('review card fields can separate scientific vs market accuracy', () => {
  const out = analyzeReview({ reviewNotes: { scientific_notes: 'science ok', market_reaction_notes: 'market wrong', mistake_category: 'other', future_rule: 'rule', lesson_learned: 'lesson' }, paperTrade: { status: 'reviewed' }, catalystOutcome: 'done', stockReaction: '3%' });
  assert.equal(out.scientific_accuracy, 'science ok');
  assert.equal(out.market_accuracy, 'market wrong');
});
