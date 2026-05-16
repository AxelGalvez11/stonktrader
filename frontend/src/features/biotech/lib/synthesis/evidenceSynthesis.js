function includesAny(text, terms){ const t=String(text||'').toLowerCase(); return terms.some(x=>t.includes(x)); }

export function detectEvidenceConflicts(inputs){
  const c=[];
  const thesis=inputs.thesis||{};
  const pubmed=inputs.pubmedSources||[];
  const fda=inputs.fdaSources||[];
  const sec=inputs.secSources||[];
  const trials=inputs.clinicalTrialsSources||[];
  const market=inputs.marketData||{};
  const trade=inputs.paperTradeDraft||{};

  if (pubmed.length && includesAny(thesis.bull_case,['strong','very','high conviction']) && pubmed.some(p=>(p.scientific_signals?.missing_fields||[]).length>4)) c.push({severity:'moderate',msg:'Bull case may overstate scientific support.'});
  if (trials.length && includesAny(thesis.catalyst,['confirmed','guaranteed','certain']) ) c.push({severity:'major',msg:'Trial completion date is not a guaranteed readout date.'});
  if (includesAny(thesis.primary_endpoint_analysis,['missing','unclear','surrogate'])) c.push({severity:'moderate',msg:'Endpoint clinical relevance needs review.'});
  if (fda.some(f=>(f.regulatory_signals?.boxed_warning||[]).length||(f.regulatory_signals?.contraindications||[]).length) && includesAny(thesis.safety_analysis,['missing','low concern'])) c.push({severity:'major',msg:'Safety risk may be understated.'});
  if (sec.some(s=>includesAny(JSON.stringify(s),['dilution','offering','atm','s-3','additional capital'])) && includesAny(thesis.financial_risk,['low','missing'])) c.push({severity:'major',msg:'Dilution or financing risk may be understated.'});
  const runup = market?.derived?.pre_catalyst_runup?.runup_30d_percent;
  if (typeof runup==='number' && runup>20 && !includesAny(thesis.market_expectation,['priced','pricing','run-up'])) c.push({severity:'moderate',msg:'Catalyst may already be partially priced in.'});
  if ((market?.derived?.liquidity_flags||[]).length && Number(trade.paper_position_size||0) > 10000) c.push({severity:'moderate',msg:'Paper trade size may ignore liquidity/volatility risk.'});
  return c;
}

export function generateMissingEvidenceChecklist(inputs){
  const m=[]; const s=inputs.selectedSources||[]; const catalyst=String(inputs.catalyst?.catalyst_type||'').toLowerCase(); const thesis=inputs.thesis||{};
  if (!s.some(x=>x.source_type==='sec')) m.push('No SEC source selected.');
  if (catalyst.includes('trial') && !s.some(x=>x.source_type==='clinical_trials')) m.push('No ClinicalTrials source selected for clinical catalyst.');
  if (includesAny(`${thesis.mechanism} ${thesis.science_summary}`,['receptor','pathway','mechanism']) && !s.some(x=>x.source_type==='pubmed')) m.push('No PubMed source selected for mechanism-heavy thesis.');
  if (includesAny(`${thesis.regulatory_risk} ${thesis.safety_analysis}`,['fda','label','warning']) && !s.some(x=>x.source_type==='fda')) m.push('No FDA source selected for regulatory-heavy thesis.');
  return m;
}

export function generateRiskConcentrationSummary(inputs){
  const out=[]; const market=inputs.marketData||{};
  if ((market?.derived?.liquidity_flags||[]).length) out.push('Liquidity/volatility concentration present.');
  if (includesAny(inputs.thesis?.financial_risk,['missing'])) out.push('Financial-risk coverage concentration.');
  return out;
}

export function scoreThesisQuality(thesis,sources,marketData,catalyst){
  let score=0;
  if ((thesis.source_summary||[]).length) score+=15;
  if (sources.some(s=>s.source_type==='sec')) score+=10;
  if (String(catalyst?.catalyst_type||'').includes('trial') && sources.some(s=>s.source_type==='clinical_trials')) score+=10;
  if (includesAny(`${thesis.mechanism} ${thesis.science_summary}`,['receptor','pathway','mechanism']) && sources.some(s=>s.source_type==='pubmed')) score+=10;
  if (includesAny(`${thesis.regulatory_risk} ${thesis.safety_analysis}`,['fda','warning','label']) && sources.some(s=>s.source_type==='fda')) score+=10;
  if (thesis.bull_case&&thesis.bear_case&&thesis.base_case) score+=10;
  if (thesis.invalidation_criteria && thesis.invalidation_criteria!=='missing') score+=10;
  if (thesis.financial_risk && thesis.dilution_risk && thesis.financial_risk!=='missing') score+=10;
  if (thesis.market_expectation && thesis.market_expectation!=='missing') score+=10;
  if ((thesis.warnings||[]).length) score+=5;
  const conflicts=detectEvidenceConflicts({thesis,secSources:sources.filter(s=>s.source_type==='sec'),clinicalTrialsSources:sources.filter(s=>s.source_type==='clinical_trials'),pubmedSources:sources.filter(s=>s.source_type==='pubmed'),fdaSources:sources.filter(s=>s.source_type==='fda'),marketData});
  for(const x of conflicts) score-= x.severity==='major'?15:x.severity==='moderate'?8:3;
  score=Math.max(0,Math.min(100,score));
  return {score, conflicts};
}

export function synthesizeEvidence(inputs){
  const thesis=inputs.thesis||{}; const sources=inputs.selectedSources||[];
  const {score, conflicts}=scoreThesisQuality(thesis,sources,inputs.marketData,inputs.catalyst);
  const missing=generateMissingEvidenceChecklist(inputs);
  const riskConc=generateRiskConcentrationSummary(inputs);
  const label=score<40?'weak':score<60?'developing':score<80?'reasonable':'strong';
  const readiness=score<45||conflicts.some(c=>c.severity==='major')?'not_ready':(score<65?'watchlist_only':'paper_trade_ready');
  return {
    overall_quality_score: score,
    quality_label: label,
    science_confidence: score<45?'low':score<70?'moderate':'high',
    regulatory_risk: conflicts.some(c=>c.msg.includes('Safety')||c.msg.includes('FDA'))?'high':'moderate',
    financial_risk: conflicts.some(c=>c.msg.includes('Dilution'))?'high':'moderate',
    market_expectation_risk: conflicts.some(c=>c.msg.includes('priced'))?'high':'moderate',
    liquidity_risk: (inputs.marketData?.derived?.liquidity_flags||[]).length?'high':'moderate',
    evidence_conflicts: conflicts.map(c=>c.msg),
    missing_evidence: missing,
    risk_concentrations: riskConc,
    quality_gate_warnings: conflicts.map(c=>`Potential conflict: ${c.msg}`),
    suggested_follow_up_questions: [...missing.map(m=>`How can this gap be addressed: ${m}`), 'Which assumptions are least supported by public evidence?'],
    paper_trade_readiness: readiness,
    summary: 'Educational paper-trading-only synthesis. Scores are heuristic and approximate; review conflicts manually.',
  };
}
