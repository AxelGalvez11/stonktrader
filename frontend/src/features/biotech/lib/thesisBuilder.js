import { structureResearchNote } from './researchStructurer.js';

export function buildSourcesFromNotes(notes) {
  return (notes || []).map((n) => ({
    sourceId: n.id,
    sourceType: n.source_type || 'manual',
    url: n.source_url || 'missing',
    note: n.title || 'missing',
  }));
}

export function generateDraftFromNotes({ ticker, company, notes }) {
  const first = structureResearchNote({ raw_text: notes?.[0]?.raw_text || '', ticker: ticker || 'missing', company: company || 'missing' });
  return {
    ticker: ticker || 'missing', company: company || 'missing',
    drug: first.drug_candidate,
    indication: first.indication,
    mechanism: first.mechanism,
    trial_phase: first.trial_phase,
    catalyst: first.catalyst,
    expected_date: first.expected_date,
    science_summary: 'Fact: missing. Interpretation: missing. Missing data: see missing_fields.',
    clinical_trial_design: 'missing',
    primary_endpoint_analysis: first.primary_endpoint,
    secondary_endpoint_analysis: 'missing',
    safety_analysis: first.safety_concerns,
    standard_of_care: 'missing',
    competitor_landscape: 'missing',
    regulatory_risk: 'missing',
    financial_risk: 'missing',
    cash_runway: first.cash_runway_info,
    dilution_risk: first.dilution_info,
    market_expectation: 'missing',
    bull_case: 'missing', bear_case: 'missing', base_case: 'missing',
    possible_stock_reaction_scenarios: [{ scenario: 'missing', reasoning: 'uncertainty', risk: 'high' }],
    paper_trade_idea: 'Paper-trading thesis only. Public evidence suggests uncertainty.',
    invalidation_criteria: 'missing',
    what_to_watch_next: first.suggested_follow_up_questions,
    source_summary: buildSourcesFromNotes(notes),
    confidence_label: 'low',
    warnings: ['paper-trading thesis', 'public evidence suggests uncertainty'],
  };
}

export function thesisQualityGates(thesis) {
  const errs = [];
  if (!Array.isArray(thesis.source_summary) || thesis.source_summary.length === 0) errs.push('Source summary required');
  if (!thesis.bull_case || thesis.bull_case === 'missing') errs.push('Bull case required');
  if (!thesis.bear_case || thesis.bear_case === 'missing') errs.push('Bear case required');
  if (!thesis.base_case || thesis.base_case === 'missing') errs.push('Base case required');
  if (!thesis.invalidation_criteria || thesis.invalidation_criteria === 'missing') errs.push('Invalidation criteria required');
  if (!thesis.confidence_label) errs.push('Confidence label required');
  if (!Array.isArray(thesis.warnings) || thesis.warnings.length === 0) errs.push('Warnings required (or "none identified")');
  return errs;
}

export function findMissingFields(thesis) {
  return Object.entries(thesis).filter(([_,v]) => v === 'missing' || (Array.isArray(v) && v.includes('missing'))).map(([k]) => k);
}


export function prefillFromClinicalTrial(thesis, trial) {
  const next = { ...thesis };
  next.drug = (trial?.drug_candidates || [])[0] || next.drug || 'missing';
  next.indication = (trial?.conditions || [])[0] || next.indication || 'missing';
  next.trial_phase = trial?.phase || next.trial_phase || 'missing';
  next.primary_endpoint_analysis = (trial?.primary_endpoints || [])[0] || next.primary_endpoint_analysis || 'missing';
  next.secondary_endpoint_analysis = (trial?.secondary_endpoints || [])[0] || next.secondary_endpoint_analysis || 'missing';
  next.expected_date = trial?.primary_completion_date !== 'missing' ? trial?.primary_completion_date : (trial?.completion_date || next.expected_date || 'missing');
  next.catalyst = trial?.nct_id ? `${trial.nct_id} possible catalyst window` : (next.catalyst || 'missing');
  next.safety_analysis = next.safety_analysis || 'missing';
  next.warnings = Array.from(new Set([...(next.warnings || []), 'Trial completion date does not guarantee data release.']));
  return next;
}
