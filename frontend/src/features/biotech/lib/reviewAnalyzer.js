export const MISTAKE_CATEGORIES = [
  'misunderstood endpoint','overestimated mechanism','underestimated safety risk','ignored dilution risk','ignored valuation/pricing-in risk','ignored competition','misunderstood FDA/regulatory risk','emotional entry','poor risk/reward','thesis was right but timing was wrong','other'
];

export function validateTradeReviewInput(input) {
  const errs = [];
  if (!input.paper_trade_id) errs.push('paper_trade_id required');
  if (!input.catalyst_outcome) errs.push('catalyst outcome required');
  if (!input.stock_reaction_percent) errs.push('stock reaction required (or "not available")');
  if (!input.lesson_learned) errs.push('lesson learned required');
  if (!input.mistake_category) errs.push('mistake category required');
  if (!input.future_rule) errs.push('future rule required');
  return errs;
}

export function analyzeReview({ originalThesis, paperTrade, reviewNotes, catalystOutcome, stockReaction }) {
  return {
    scientific_accuracy: reviewNotes?.scientific_notes || 'missing',
    market_accuracy: reviewNotes?.market_reaction_notes || 'missing',
    risk_management_accuracy: paperTrade?.status ? 'paper-trading risk process documented' : 'missing',
    main_mistake: reviewNotes?.mistake_category || 'missing',
    what_went_well: (reviewNotes?.lesson_learned && reviewNotes.lesson_learned !== 'missing') ? 'Documented learning captured.' : 'missing',
    what_went_wrong: catalystOutcome || 'missing',
    future_rule: reviewNotes?.future_rule || 'missing',
    summary: stockReaction ? `Public evidence suggests outcome review completed with uncertainty: ${stockReaction}.` : 'missing',
  };
}
