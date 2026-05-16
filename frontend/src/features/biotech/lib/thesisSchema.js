const required = ['ticker','company','drug','indication','mechanism','trial_phase','catalyst','expected_date','science_summary','clinical_trial_design','primary_endpoint_analysis','secondary_endpoint_analysis','safety_analysis','standard_of_care','competitor_landscape','regulatory_risk','financial_risk','cash_runway','dilution_risk','market_expectation','bull_case','bear_case','base_case','paper_trade_idea','invalidation_criteria','what_to_watch_next','source_summary','confidence_label','warnings'];

export function validateThesisJson(input) {
  if (typeof input !== 'object' || input === null) return { ok: false, errors: ['Thesis must be an object'] };
  const obj = input;
  const errors = [];
  for (const k of required) if (!(k in obj)) errors.push(`Missing field: ${k}`);
  if (!String(obj.science_summary || '').toLowerCase().includes('fact')) errors.push('science_summary must include Fact');
  if (!String(obj.science_summary || '').toLowerCase().includes('interpretation')) errors.push('science_summary must include Interpretation');
  if (!Array.isArray(obj.source_summary) || obj.source_summary.length === 0) errors.push('source_summary must be a non-empty array');
  if (!['low','moderate','high'].includes(String(obj.confidence_label || ''))) errors.push('confidence_label invalid');
  return errors.length ? { ok: false, errors } : { ok: true, data: obj };
}
