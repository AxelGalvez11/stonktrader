import test from 'node:test';
import assert from 'node:assert/strict';
import { computeCatalystStatus, generateCatalystAlerts } from '../src/features/biotech/lib/alerts/catalystAlerts.js';

function daysFromNow(days) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

test('alert generated for catalyst within 7 days', () => {
  const alerts = generateCatalystAlerts({ catalysts: [{ id: 1, ticker: 'ABCD', title: 'Readout', expected_date: daysFromNow(3), thesis_id: 1 }], syntheses: [{ ticker: 'ABCD', quality_label: 'strong', paper_trade_readiness: 'ready' }], secEvidenceByTicker: { ABCD: true }, clinicalEvidenceByTicker: { ABCD: true } });
  assert.ok(alerts.some((a) => a.alert_type === 'catalyst_within_7_days'));
});

test('alert generated for passed catalyst with no outcome', () => {
  const alerts = generateCatalystAlerts({ catalysts: [{ id: 1, ticker: 'ABCD', title: 'Readout', expected_date: daysFromNow(-1), thesis_id: 1 }], syntheses: [{ ticker: 'ABCD', quality_label: 'strong', paper_trade_readiness: 'ready' }], secEvidenceByTicker: { ABCD: true }, clinicalEvidenceByTicker: { ABCD: true } });
  assert.ok(alerts.some((a) => a.alert_type === 'passed_no_outcome'));
});

test('alert generated for missing thesis', () => {
  const alerts = generateCatalystAlerts({ catalysts: [{ id: 1, ticker: 'ABCD', title: 'Readout', expected_date: daysFromNow(10) }], syntheses: [{ ticker: 'ABCD', quality_label: 'strong', paper_trade_readiness: 'ready' }], secEvidenceByTicker: { ABCD: true }, clinicalEvidenceByTicker: { ABCD: true } });
  assert.ok(alerts.some((a) => a.alert_type === 'missing_thesis'));
});

test('alert generated for weak synthesis', () => {
  const alerts = generateCatalystAlerts({ catalysts: [{ id: 1, ticker: 'ABCD', title: 'Readout', expected_date: daysFromNow(10), thesis_id: 123 }], syntheses: [{ ticker: 'ABCD', quality_label: 'weak', paper_trade_readiness: 'not_ready' }], secEvidenceByTicker: { ABCD: true }, clinicalEvidenceByTicker: { ABCD: true } });
  assert.ok(alerts.some((a) => a.alert_type === 'weak_synthesis'));
});

test('alert generated for high run-up', () => {
  const alerts = generateCatalystAlerts({ catalysts: [{ id: 1, ticker: 'ABCD', title: 'Readout', expected_date: daysFromNow(10), thesis_id: 123 }], syntheses: [{ ticker: 'ABCD', quality_label: 'strong', paper_trade_readiness: 'ready' }], secEvidenceByTicker: { ABCD: true }, clinicalEvidenceByTicker: { ABCD: true }, marketDataByTicker: { ABCD: { derived: { pre_catalyst_runup: { runup_30d_percent: 25 } } } } });
  assert.ok(alerts.some((a) => a.alert_type === 'high_runup'));
});

test('alert generated for post-event review needed', () => {
  const alerts = generateCatalystAlerts({ catalysts: [{ id: 1, ticker: 'ABCD', title: 'Readout', expected_date: daysFromNow(-3), outcome: 'met endpoint', thesis_id: 10 }], paperTrades: [{ id: 'p1', catalyst_id: 1, status: 'closed_unreviewed' }], syntheses: [{ ticker: 'ABCD', quality_label: 'strong', paper_trade_readiness: 'ready' }], secEvidenceByTicker: { ABCD: true }, clinicalEvidenceByTicker: { ABCD: true } });
  assert.ok(alerts.some((a) => a.alert_type === 'review_needed'));
});

test('catalyst status helper transitions correctly', () => {
  assert.equal(computeCatalystStatus({ expected_date: daysFromNow(10) }, { hasThesis: false }), 'thesis_needed');
  assert.equal(computeCatalystStatus({ expected_date: daysFromNow(10) }, { hasThesis: true, hasSynthesis: false }), 'synthesis_needed');
  assert.equal(computeCatalystStatus({ expected_date: daysFromNow(10) }, { hasThesis: true, hasSynthesis: true, linkedTradeOpen: true }), 'paper_trade_open');
  assert.equal(computeCatalystStatus({ expected_date: daysFromNow(-1) }, { hasThesis: true, hasSynthesis: true }), 'event_passed_review_needed');
});

test('alert includes missing SEC and ClinicalTrials evidence', () => {
  const alerts = generateCatalystAlerts({ catalysts: [{ id: 1, ticker: 'ABCD', title: 'Readout', expected_date: daysFromNow(10), thesis_id: 1 }], syntheses: [{ ticker: 'ABCD', quality_label: 'strong', paper_trade_readiness: 'ready' }] });
  assert.ok(alerts.some((a) => a.alert_type === 'missing_sec_evidence'));
  assert.ok(alerts.some((a) => a.alert_type === 'missing_clinical_evidence'));
});
