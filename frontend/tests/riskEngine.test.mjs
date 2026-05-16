import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePaperTradeRisk } from '../src/features/biotech/lib/riskEngine.js';

test('blocks missing required fields', () => {
  const r = validatePaperTradeRisk({ thesisId: '', invalidationPoint: '', positionSize: 0, exitPlan: '' });
  assert.equal(r.ok, false);
});

test('passes with full risk plan', () => {
  const r = validatePaperTradeRisk({ thesisId: 'abc', invalidationPoint: 'break thesis', positionSize: 100, exitPlan: 'exit after catalyst' });
  assert.equal(r.ok, true);
});
