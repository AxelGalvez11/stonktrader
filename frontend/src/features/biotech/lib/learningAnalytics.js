function num(v){ const n=Number(v); return Number.isFinite(n)?n:null; }
function avg(arr){ const n=arr.map(num).filter(v=>v!==null); return n.length? n.reduce((a,b)=>a+b,0)/n.length : null; }

export function summarizeMistakePatterns(reviews=[]) {
  const byCategory = {};
  for (const r of reviews) byCategory[r.mistake_category||'unknown'] = (byCategory[r.mistake_category||'unknown']||0)+1;
  const topRecurring = Object.entries(byCategory).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([category,count])=>({category,count}));
  const recentExamples = [...reviews].slice(0,5).map(r=>({ id:r.id, mistake_category:r.mistake_category||'unknown', catalyst_outcome:r.catalyst_outcome||'missing', lesson_learned:r.lesson_learned||'missing' }));
  const futureRules = [...new Set(reviews.map(r=>r.future_rule).filter(Boolean))].slice(0,8);
  return { by_category: byCategory, top_recurring: topRecurring, recent_examples: recentExamples, future_rules: futureRules };
}

export function summarizeRiskBlindSpots(reviews=[], syntheses=[], alerts=[]) {
  const counts = { ignored_dilution_risk:0, ignored_safety_risk:0, endpoint_trial_misunderstanding:0, market_runup_pricing_in_risk:0, liquidity_risk:0, regulatory_risk:0, overestimated_mechanism_science:0 };
  const rows = [...reviews, ...syntheses, ...alerts];
  for (const row of rows) {
    const blob = JSON.stringify(row).toLowerCase();
    if (blob.includes('dilution')) counts.ignored_dilution_risk++;
    if (blob.includes('safety') || blob.includes('adverse') || blob.includes('fda')) counts.ignored_safety_risk++;
    if (blob.includes('endpoint') || blob.includes('trial')) counts.endpoint_trial_misunderstanding++;
    if (blob.includes('run-up') || blob.includes('runup') || blob.includes('pricing-in')) counts.market_runup_pricing_in_risk++;
    if (blob.includes('liquidity')) counts.liquidity_risk++;
    if (blob.includes('regulatory') || blob.includes('sec')) counts.regulatory_risk++;
    if (blob.includes('mechanism') || blob.includes('science')) counts.overestimated_mechanism_science++;
  }
  return counts;
}

export function summarizeThesisQuality(syntheses=[], trades=[]) {
  const scoreDistribution = { weak:0, developing:0, reasonable:0, strong:0 };
  const readinessDistribution = { not_ready:0, watchlist_only:0, paper_trade_ready:0 };
  for (const s of syntheses) { if (scoreDistribution[s.quality_label]!==undefined) scoreDistribution[s.quality_label]++; if (readinessDistribution[s.paper_trade_readiness]!==undefined) readinessDistribution[s.paper_trade_readiness]++; }
  const synByThesis = syntheses.reduce((m,s)=>{ if(s.thesis_id!=null) m[String(s.thesis_id)]=s; return m;}, {});
  const synByTicker = syntheses.reduce((m,s)=>{ const t=String(s.ticker||'').toUpperCase(); if(t&&!m[t]) m[t]=s; return m;}, {});
  const byQuality = {}; const byReadiness={};
  for (const t of trades) {
    const syn = synByThesis[String(t.thesis_id)] || synByTicker[String(t.ticker||'').toUpperCase()];
    const r = num(t.result_percent); if (r===null || !syn) continue;
    const q = syn.quality_label||'unknown'; byQuality[q]=byQuality[q]||[]; byQuality[q].push(r);
    const pr = syn.paper_trade_readiness||'unknown'; byReadiness[pr]=byReadiness[pr]||[]; byReadiness[pr].push(r);
  }
  return { score_distribution: scoreDistribution, readiness_distribution: readinessDistribution, average_result_by_quality_label: Object.fromEntries(Object.entries(byQuality).map(([k,v])=>[k,avg(v)])), average_result_by_readiness_label: Object.fromEntries(Object.entries(byReadiness).map(([k,v])=>[k,avg(v)])), summary: 'Observed in your paper-trade history; not predictive.' };
}

export function summarizeCatalystTypePerformance(catalysts=[], trades=[], reviews=[]) {
  const types = ['trial_data','completion_update','FDA/regulatory','earnings','SEC/filing','partnership','other'];
  const cById = Object.fromEntries(catalysts.map(c=>[String(c.id),c]));
  const out = {};
  for (const type of types) out[type]={ count:0, average_result_percent:null, common_mistake_category:'unknown' };
  const resultsByType = {}; const mistakeByType={};
  for (const t of trades) {
    const c = cById[String(t.catalyst_id)];
    const ct = c?.catalyst_type || 'other';
    if (!out[ct]) out[ct]= { count:0, average_result_percent:null, common_mistake_category:'unknown' };
    out[ct].count++;
    const r = num(t.result_percent); if (r!==null){ resultsByType[ct]=resultsByType[ct]||[]; resultsByType[ct].push(r); }
    const rev = reviews.find(x=>String(x.paper_trade_id)===String(t.id));
    if (rev?.mistake_category){ mistakeByType[ct]=mistakeByType[ct]||{}; mistakeByType[ct][rev.mistake_category]=(mistakeByType[ct][rev.mistake_category]||0)+1; }
  }
  for (const k of Object.keys(out)) {
    out[k].average_result_percent = avg(resultsByType[k]||[]);
    const top = Object.entries(mistakeByType[k]||{}).sort((a,b)=>b[1]-a[1])[0];
    out[k].common_mistake_category = top?top[0]:'unknown';
  }
  return out;
}

export function summarizeAlertReviewAssociations(alerts=[], reviews=[], trades=[], catalysts=[]) {
  const byTrade = Object.fromEntries(trades.map(t=>[String(t.id),t]));
  const alertByCatalyst = alerts.reduce((m,a)=>{ const k=String(a.catalyst_id||''); m[k]=m[k]||[]; m[k].push(a.alert_type); return m;}, {});
  const assoc = { high_runup_to_pricing_in:0, dilution_to_dilution_mistake:0, missing_clinical_to_endpoint_mistake:0, missing_fda_pubmed_to_safety_science_mistake:0, weak_synthesis_to_incomplete_thesis:0 };
  for (const r of reviews) {
    const t = byTrade[String(r.paper_trade_id)]; if(!t) continue;
    const ats = alertByCatalyst[String(t.catalyst_id)]||[];
    const blob = JSON.stringify(r).toLowerCase();
    if (ats.includes('high_runup') && (blob.includes('pricing')||blob.includes('run-up')||blob.includes('risk'))) assoc.high_runup_to_pricing_in++;
    if (ats.includes('high_dilution') && blob.includes('dilution')) assoc.dilution_to_dilution_mistake++;
    if (ats.includes('missing_clinical_evidence') && (blob.includes('endpoint')||blob.includes('trial'))) assoc.missing_clinical_to_endpoint_mistake++;
    if ((ats.includes('missing_fda_evidence')||ats.includes('missing_pubmed_evidence')) && (blob.includes('safety')||blob.includes('science'))) assoc.missing_fda_pubmed_to_safety_science_mistake++;
    if (ats.includes('weak_synthesis') && (blob.includes('incomplete')||blob.includes('risk/reward')||blob.includes('thesis'))) assoc.weak_synthesis_to_incomplete_thesis++;
  }
  return { associations: assoc, summary: 'These are observed associations in your paper-trading records, not predictive signals.' };
}

export function generateLearningRecommendations(analytics){
  const rec = [];
  if ((analytics.risk_blind_spots?.ignored_dilution_risk||0) >= 2) rec.push('Learning recommendation: Require SEC evidence before small-cap biotech paper trades.');
  if ((analytics.risk_blind_spots?.market_runup_pricing_in_risk||0) >= 2) rec.push('Learning recommendation: Add pricing-in/run-up analysis before paper trading high-run-up catalysts.');
  if ((analytics.alert_review_associations?.associations?.dilution_to_dilution_mistake||0) >= 1) rec.push('Learning recommendation: Do not mark financial risk low when SEC dilution evidence exists.');
  rec.push('Learning recommendation: Require endpoint analysis before trial-data catalyst theses.');
  rec.push('Learning recommendation: Review safety/FDA evidence when PubMed or FDA alerts indicate missing context.');
  return [...new Set(rec)].slice(0,6);
}

export function buildLearningAnalytics(inputs={}) {
  const trades = inputs.paper_trades||[]; const reviews=inputs.trade_reviews||[]; const syntheses=inputs.thesis_syntheses||[]; const catalysts=inputs.catalysts||[]; const alerts=inputs.alerts||[];
  const missing = [];
  if (!trades.length) missing.push({ type:'missing_data', code:'no_paper_trades' });
  if (!reviews.length) missing.push({ type:'missing_data', code:'no_trade_reviews' });
  if (!syntheses.length) missing.push({ type:'missing_data', code:'no_thesis_syntheses' });
  const mistake_patterns = summarizeMistakePatterns(reviews);
  const risk_blind_spots = summarizeRiskBlindSpots(reviews, syntheses, alerts);
  const thesis_quality = summarizeThesisQuality(syntheses, trades);
  const catalyst_type_analysis = summarizeCatalystTypePerformance(catalysts, trades, reviews);
  const alert_review_associations = summarizeAlertReviewAssociations(alerts, reviews, trades, catalysts);
  const overview = {
    total_paper_trades: trades.length,
    reviewed_trades: reviews.length,
    open_trades: trades.filter(t=>t.status==='open').length,
    closed_unreviewed_trades: trades.filter(t=>t.status==='closed_unreviewed').length,
    average_thesis_quality_score: avg(syntheses.map(s=>s.quality_score)),
    average_paper_trade_result_percent: avg(trades.map(t=>t.result_percent)),
    paper_trade_win_rate: (()=>{ const vals=trades.map(t=>num(t.result_percent)).filter(v=>v!==null); return vals.length? (vals.filter(v=>v>0).length/vals.length):null; })(),
    average_result_by_readiness_label: thesis_quality.average_result_by_readiness_label,
  };
  const analytics = { overview, mistake_patterns, risk_blind_spots, thesis_quality, catalyst_type_analysis, alert_review_associations, recommendations: [], missing_data: missing };
  analytics.recommendations = generateLearningRecommendations(analytics);
  if (!reviews.length) analytics.recommendations.unshift('Learning recommendation: Collect more post-event reviews to strengthen observed patterns in paper-trade history (not predictive).');
  return analytics;
}
