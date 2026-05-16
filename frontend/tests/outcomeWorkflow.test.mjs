import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLinkedTradePatch, buildOutcomePatch } from '../src/features/biotech/lib/alerts/outcomeWorkflow.js';

test('outcome capture marks catalyst as review-needed status', () => {
  const patch = buildOutcomePatch({ outcome: 'mixed', actual_event_date: '2026-05-01', outcome_summary: 'headline', notes: 'detail', source_url: 'https://example.com' });
  assert.equal(patch.status, 'event_passed_review_needed');
  assert.equal(patch.expected_date, '2026-05-01');
});

test('outcome capture marks linked paper trade as closed_unreviewed', () => {
  const patch = buildLinkedTradePatch({ actual_event_date: '2026-05-01', outcome_summary: 'summary' });
  assert.equal(patch.status, 'closed_unreviewed');
  assert.equal(patch.actual_exit_date, '2026-05-01');
  assert.equal(patch.notes, 'summary');
});
