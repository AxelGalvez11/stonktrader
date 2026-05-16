export function computeCatalystStatus(c, ctx={}) {
  const now = new Date(); const d = c.expected_date ? new Date(c.expected_date) : null;
  if (c.status && ['reviewed','archived'].includes(c.status)) return c.status;
  if (c.outcome && ctx.linkedTrade) return 'event_passed_review_needed';
  if (d && d < now && !c.outcome) return 'event_passed_review_needed';
  if (!ctx.hasThesis) return 'thesis_needed';
  if (!ctx.hasSynthesis) return 'synthesis_needed';
  if (ctx.linkedTradeOpen) return 'paper_trade_open';
  return 'upcoming';
}

export function generateCatalystAlerts(inputs){
  const out=[]; const now=Date.now();
  for(const c of inputs.catalysts||[]){
    const t=c.ticker; const d=c.expected_date?new Date(c.expected_date).getTime():null;
    const days = d?Math.ceil((d-now)/86400000):null;
    const linked = (inputs.paperTrades||[]).find(p=>String(p.catalyst_id||'')===String(c.id));
    const syn = (inputs.syntheses||[]).find(s=>String(s.ticker||'')===String(t));
    if (days!==null && days<=7 && days>=0) out.push(msg('catalyst_within_7_days','high',t,c.id,c.title,'Catalyst within 7 days','Review thesis and risk plan.'));
    if (days!==null && days<=30 && days>7) out.push(msg('catalyst_within_30_days','moderate',t,c.id,c.title,'Catalyst within 30 days','Check evidence coverage.'));
    if (days!==null && days<0 && !c.outcome) out.push(msg('passed_no_outcome','high',t,c.id,c.title,'Expected date passed but no outcome entered','Capture outcome and source.'));
    if (linked && linked.status==='open' && days!==null && days<=7) out.push(msg('open_trade_near_catalyst','high',t,c.id,c.title,'Open paper trade near catalyst date','Re-check invalidation and size.'));
    if (!c.thesis_id) out.push(msg('missing_thesis','high',t,c.id,c.title,'No thesis attached','Build thesis before event.'));
    if (!syn) out.push(msg('missing_synthesis','moderate',t,c.id,c.title,'No evidence synthesis attached','Run thesis synthesis.'));
    if (syn && ['weak'].includes(syn.quality_label) || syn?.paper_trade_readiness==='not_ready') out.push(msg('weak_synthesis','high',t,c.id,c.title,'Synthesis shows weak/not_ready','Address conflicts before paper trade.'));
    if ((inputs.marketData?.derived?.pre_catalyst_runup?.runup_30d_percent||0)>20) out.push(msg('high_runup','moderate',t,c.id,c.title,'High pre-catalyst run-up detected','Assess pricing-in risk.'));
    if ((inputs.secFlags||[]).includes('high_dilution')) out.push(msg('high_dilution','high',t,c.id,c.title,'High dilution risk flagged','Reassess financial risk.'));
    if (c.outcome && linked && linked.status!=='reviewed') out.push(msg('review_needed','high',t,c.id,c.title,'Post-event review needed','Complete review workflow.'));
  }
  return out;
}
function msg(alert_type,severity,ticker,catalyst_id,title,message,recommended_action){return{alert_type,severity,ticker,catalyst_id,title,message,recommended_action,created_at:new Date().toISOString()};}
