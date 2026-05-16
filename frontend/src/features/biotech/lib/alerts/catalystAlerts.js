export function computeCatalystStatus(catalyst, ctx = {}) {
  const now = new Date();
  const expectedDate = catalyst.expected_date ? new Date(catalyst.expected_date) : null;

  if (catalyst.status && ['reviewed', 'archived'].includes(catalyst.status)) return catalyst.status;
  if (catalyst.outcome && ctx.linkedTrade) return 'event_passed_review_needed';
  if (expectedDate && expectedDate < now && !catalyst.outcome) return 'event_passed_review_needed';
  if (!ctx.hasThesis) return 'thesis_needed';
  if (!ctx.hasSynthesis) return 'synthesis_needed';
  if (ctx.linkedTradeOpen) return 'paper_trade_open';
  return 'upcoming';
}

export function generateCatalystAlerts(inputs) {
  const out = [];
  const now = Date.now();

  for (const catalyst of inputs.catalysts || []) {
    const ticker = catalyst.ticker;
    const eventTs = catalyst.expected_date ? new Date(catalyst.expected_date).getTime() : null;
    const days = eventTs ? Math.ceil((eventTs - now) / 86400000) : null;
    const linkedTrade = (inputs.paperTrades || []).find((p) => String(p.catalyst_id || '') === String(catalyst.id));
    const synthesis = (inputs.syntheses || []).find((s) => String(s.ticker || '') === String(ticker));

    if (days !== null && days <= 7 && days >= 0) out.push(msg('catalyst_within_7_days', 'high', ticker, catalyst.id, catalyst.title, 'Possible catalyst window within 7 days', 'Review thesis and paper-trading risk plan.'));
    if (days !== null && days <= 30 && days > 7) out.push(msg('catalyst_within_30_days', 'moderate', ticker, catalyst.id, catalyst.title, 'Possible catalyst window within 30 days', 'Check evidence coverage and timing assumptions.'));
    if (days !== null && days < 0 && !catalyst.outcome) out.push(msg('passed_no_outcome', 'high', ticker, catalyst.id, catalyst.title, 'Expected date passed but no outcome entered', 'Capture outcome and cite public source.'));
    if (linkedTrade && linkedTrade.status === 'open' && days !== null && days <= 7) out.push(msg('open_trade_near_catalyst', 'high', ticker, catalyst.id, catalyst.title, 'Open paper trade near catalyst date', 'Re-check invalidation and position size.'));
    if (!catalyst.thesis_id) out.push(msg('missing_thesis', 'high', ticker, catalyst.id, catalyst.title, 'No thesis attached', 'Build thesis before this possible catalyst window.'));
    if (!synthesis) out.push(msg('missing_synthesis', 'moderate', ticker, catalyst.id, catalyst.title, 'No evidence synthesis attached', 'Run thesis synthesis before paper trade.'));
    if ((synthesis && synthesis.quality_label === 'weak') || synthesis?.paper_trade_readiness === 'not_ready') out.push(msg('weak_synthesis', 'high', ticker, catalyst.id, catalyst.title, 'Synthesis is weak/not_ready', 'Resolve conflicts before paper-trading decisions.'));

    if (!inputs.secEvidenceByTicker?.[ticker]) out.push(msg('missing_sec_evidence', 'moderate', ticker, catalyst.id, catalyst.title, 'No SEC evidence attached', 'Add recent SEC evidence to the thesis.'));
    if (!inputs.clinicalEvidenceByTicker?.[ticker]) out.push(msg('missing_clinical_evidence', 'moderate', ticker, catalyst.id, catalyst.title, 'No ClinicalTrials evidence attached', 'Attach trial evidence for this catalyst.'));

    if ((inputs.marketDataByTicker?.[ticker]?.derived?.pre_catalyst_runup?.runup_30d_percent || 0) > 20) out.push(msg('high_runup', 'moderate', ticker, catalyst.id, catalyst.title, 'High pre-catalyst run-up detected', 'Assess pricing-in risk for paper-trade setup.'));
    if ((inputs.secFlagsByTicker?.[ticker] || inputs.secFlags || []).includes('high_dilution')) out.push(msg('high_dilution', 'high', ticker, catalyst.id, catalyst.title, 'High dilution risk flagged', 'Reassess financial risk assumptions.'));
    if (catalyst.outcome && linkedTrade && linkedTrade.status !== 'reviewed') out.push(msg('review_needed', 'high', ticker, catalyst.id, catalyst.title, 'Post-event review needed', 'Complete post-event review workflow.'));
  }
  return out;
}

function msg(alert_type, severity, ticker, catalyst_id, title, message, recommended_action) {
  return { alert_type, severity, ticker, catalyst_id, title, message, recommended_action, created_at: new Date().toISOString() };
}
