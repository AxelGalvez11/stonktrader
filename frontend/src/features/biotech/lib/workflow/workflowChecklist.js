export function buildWorkflowChecklist(input={}) {
  const c = input;
  const statuses = {
    watchlist_exists: !!c.watchlist_exists,
    sec_fetched: (c.sec_count||0) > 0,
    clinical_trials_fetched: (c.clinical_trials_count||0) > 0,
    pubmed_saved: (c.pubmed_count||0) > 0,
    fda_saved: (c.fda_count||0) > 0,
    market_data_refreshed: !!c.market_refreshed,
    catalyst_exists: (c.catalyst_count||0) > 0,
    thesis_exists: !!c.thesis_exists,
    synthesis_exists: !!c.synthesis_exists,
    paper_trade_optional: !!c.paper_trade_exists,
    review_optional: !!c.review_exists,
  };
  return statuses;
}

export function nextBestActions(status) {
  const actions = [];
  if (!status.sec_fetched) actions.push('Fetch SEC filings to check dilution risk.');
  if (!status.catalyst_exists) actions.push('Add a catalyst before building a thesis.');
  if (!status.thesis_exists) actions.push('Create a thesis from selected sources.');
  if (!status.synthesis_exists) actions.push('Run synthesis before creating a paper trade.');
  if (status.catalyst_exists && status.paper_trade_optional && !status.review_optional) actions.push('Enter catalyst outcome to unlock review.');
  if (!actions.length) actions.push('Workflow baseline complete. Review analytics for observed pattern learning.');
  return actions;
}


export function buildLinkageWarnings(input={}) {
  const w = [];
  if ((input.paper_trades||[]).some((t)=>!t.thesis_id)) w.push('Paper trade missing thesis link.');
  if ((input.syntheses||[]).some((s)=>s.ticker && !s.thesis_id)) w.push('Synthesis is ticker-level, not thesis-specific.');
  if ((input.catalysts||[]).length>0 && (input.theses||[]).some((t)=>!t.catalyst_id)) w.push('Thesis not linked to catalyst.');
  return [...new Set(w)];
}
