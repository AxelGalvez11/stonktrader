import { buildFundamentalAnalysisReport } from '@/features/biotech/lib/fundamentals/fundamentalAnalysis';
import { synthesizeEvidence } from '@/features/biotech/lib/synthesis/evidenceSynthesis';
import { generateStructuredThesisDraft } from '@/features/biotech/lib/ai/thesisDrafting';

export function buildResearchPlan(ticker, companyName, options={}) {
  return [
    'sec','fundamentals','clinical_trials','pubmed','fda','market','infer_catalysts','source_snapshots',
    options.createDraftThesis ? 'draft_thesis' : null,
    options.runSynthesis ? 'synthesis' : null,
  ].filter(Boolean);
}

export async function runSecStep(ctx){
  try { const j = await fetch(`${ctx.base}/api/sec/filings?ticker=${ctx.ticker}`).then(r=>r.json()); const filings=j.filings||[]; return { step:'sec', status: filings.length?'success':'partial', message:'SEC step completed', records_found:filings.length, records_saved:0, warnings: filings.length?[]:['No SEC filings returned.'], data:filings }; }
  catch(e){ return { step:'sec', status:'failed', message:String(e.message||e), records_found:0, records_saved:0, warnings:['SEC step failed'], data:[] }; }
}
export async function runClinicalTrialsStep(ctx){
  try { const j = await fetch(`${ctx.base}/api/clinical-trials/search?ticker=${ctx.ticker}`).then(r=>r.json()); const trials=j.trials||[]; return { step:'clinical_trials', status:trials.length?'success':'partial', message:'ClinicalTrials step completed', records_found:trials.length, records_saved:0, warnings:trials.length?[]:['No trial records found'], data:trials }; }
  catch(e){ return { step:'clinical_trials', status:'failed', message:String(e.message||e), records_found:0, records_saved:0, warnings:['ClinicalTrials failed'], data:[] }; }
}
export function buildPubMedQuery(ticker, companyName, trials=[]){
  const t = trials[0]||{}; const cond = (t.conditions||[])[0]||''; const intv = (t.interventions||[])[0]||'';
  return `${intv||ticker} ${cond||companyName||ticker} mechanism endpoint safety`.trim();
}
export async function runPubMedStep(ctx){
  try { const query = buildPubMedQuery(ctx.ticker, ctx.companyName, ctx.trials); const j = await fetch(`${ctx.base}/api/pubmed/ingest`, { method:'POST', body: JSON.stringify({ ticker:ctx.ticker, query, context:{drug:ctx.ticker}, limit:ctx.limitPerSource||5 }) }).then(r=>r.json()); const arr=j.articles||[]; return { step:'pubmed', status:arr.length?'success':'partial', message:'PubMed step completed', records_found:arr.length, records_saved:0, warnings:arr.length?[]:['No PubMed records found'], data:arr, query }; }
  catch(e){ return { step:'pubmed', status:'failed', message:String(e.message||e), records_found:0, records_saved:0, warnings:['PubMed failed'], data:[] }; }
}
export function buildFdaQuery(ticker, companyName, trials=[]){ const t=trials[0]||{}; const intv=(t.interventions||[])[0]||ticker; const cond=(t.conditions||[])[0]||''; return `${intv} ${cond} safety label warning ${companyName||ticker}`.trim(); }
export async function runFdaStep(ctx){
  try { const query = buildFdaQuery(ctx.ticker, ctx.companyName, ctx.trials); const j = await fetch(`${ctx.base}/api/fda/ingest`, { method:'POST', body: JSON.stringify({ ticker:ctx.ticker, query, context:{drug:ctx.ticker,company:ctx.companyName||ctx.ticker}, limit:ctx.limitPerSource||5 }) }).then(r=>r.json()); const arr=j.records||[]; return { step:'fda', status:arr.length?'success':'partial', message:'FDA step completed', records_found:arr.length, records_saved:0, warnings:arr.length?[]:['No FDA records found (possible investigational asset).'], data:arr, query }; }
  catch(e){ return { step:'fda', status:'failed', message:String(e.message||e), records_found:0, records_saved:0, warnings:['FDA failed'], data:[] }; }
}
export async function runMarketDataStep(ctx){
  try { const j = await fetch(`${ctx.base}/api/market/refresh`, { method:'POST', body: JSON.stringify({ ticker:ctx.ticker, range:'6mo' }) }).then(r=>r.json()); return { step:'market', status:j?.quote?'success':'partial', message:'Market step completed', records_found:j?.quote?1:0, records_saved:0, warnings:j?.quote?[]:['Missing market snapshot'], data:j }; }
  catch(e){ return { step:'market', status:'failed', message:String(e.message||e), records_found:0, records_saved:0, warnings:['Market step failed'], data:{} }; }
}
export async function runFundamentalsStep(ctx){
  try { const report = buildFundamentalAnalysisReport({ ticker:ctx.ticker, companyName:ctx.companyName, secFilings:ctx.secFilings||[], marketData:ctx.marketData||{}, pipeline:ctx.trials||[] }); return { step:'fundamentals', status:'success', message:'Fundamentals analyzed', records_found:1, records_saved:0, warnings:[], data:report }; }
  catch(e){ return { step:'fundamentals', status:'failed', message:String(e.message||e), records_found:0, records_saved:0, warnings:['Fundamentals failed'], data:null }; }
}
export function inferCatalystsStep(ctx){ const c=(ctx.trials||[]).slice(0,3).map(t=>({ title:`Potential readout ${t.nct_id||'missing'}`, expected_date:t.primary_completion_date||'missing', catalyst_type:'trial_data' })); return { step:'infer_catalysts', status:c.length?'success':'partial', message:'Catalyst inference complete', records_found:c.length, records_saved:0, warnings:c.length?[]:['No catalyst inference'], data:c }; }
export async function createSourceSnapshotsStep(ctx){
  const snaps=[];
  const push=(type,arr,mk)=> (arr||[]).slice(0,ctx.limitPerSource||5).forEach(x=>snaps.push(mk(x)));
  push('sec',ctx.secFilings,f=>({ source_type:'sec', title:`${f.filingType||'SEC'} ${f.filingDate||''}`.trim(), source_url:f.url||'missing', raw_text:JSON.stringify(f), ticker:ctx.ticker, user_id:ctx.userId }));
  push('clinical_trials',ctx.trials,t=>({ source_type:'clinical_trials', title:t.brief_title||t.nct_id||'trial', source_url:t.source_url||'missing', raw_text:JSON.stringify(t), ticker:ctx.ticker, user_id:ctx.userId }));
  push('pubmed',ctx.pubmed,p=>({ source_type:'pubmed', title:p.title||p.pmid||'pubmed', source_url:p.source_url||'missing', raw_text:p.abstract||'', ticker:ctx.ticker, user_id:ctx.userId }));
  push('fda',ctx.fda,f=>({ source_type:'fda', title:f.title||'fda', source_url:f.source_url||'missing', raw_text:JSON.stringify(f), ticker:ctx.ticker, user_id:ctx.userId }));
  if (ctx.fundamentals) snaps.push({ source_type:'fundamentals', title:`Fundamentals ${ctx.ticker}`, source_url:'missing', raw_text:JSON.stringify(ctx.fundamentals), ticker:ctx.ticker, user_id:ctx.userId });
  return { step:'source_snapshots', status: snaps.length?'success':'partial', message:'Source snapshots prepared', records_found:snaps.length, records_saved:snaps.length, warnings:[], data:snaps };
}
export function buildResearchPacketSummary(ctx){
  const f=ctx.fundamentals||{};
  return {
    company_overview: `Public-source research packet for ${ctx.ticker}.`,
    fundamental_context: f.company_type||'missing',
    financial_risk: f.biotech_specific_metrics?.dilution_risk||'missing',
    clinical_pipeline: (ctx.trials||[]).slice(0,3).map(t=>t.brief_title||t.nct_id||'missing'),
    scientific_context: (ctx.pubmed||[]).slice(0,3).map(p=>p.title||'missing'),
    regulatory_context: (ctx.fda||[]).slice(0,3).map(x=>x.title||'missing'),
    market_context: ctx.marketData?.quote?`Approximate quote ${ctx.marketData.quote.price||'missing'}`:'missing',
    catalyst_context: (ctx.catalysts||[]).slice(0,3).map(c=>c.title||'missing'),
    key_risks: [f.biotech_specific_metrics?.dilution_risk==='high'?'Observed dilution risk elevated.':null, (ctx.fda||[]).length?null:'Regulatory context may be incomplete.'].filter(Boolean),
    missing_data: [...(f.missing_data||[]), ...(ctx.pubmed||[]).length?[]:['pubmed'], ...(ctx.fda||[]).length?[]:['fda']],
    suggested_follow_up_questions: ['Review research packet before using in thesis.','Run synthesis after thesis drafting.']
  };
}
export async function optionallyDraftThesisStep(ctx){
  if(!ctx.options.createDraftThesis) return { step:'draft_thesis', status:'skipped', message:'Skipped', records_found:0, records_saved:0, warnings:[] };
  try{ const selectedSources=(ctx.snapshots||[]).slice(0,8).map(s=>({ source_type:s.source_type,title:s.title,url:s.source_url,summary:s.raw_text,metadata:{} })); const res=await generateStructuredThesisDraft({ ticker:ctx.ticker, companyName:ctx.companyName, selectedSources, draftPreferences:{tone:'conservative',includeFollowUpQuestions:true}, marketContext:ctx.marketData||{} }); return { step:'draft_thesis', status:res.validation.ok?'success':'partial', message:'Draft thesis generated', records_found:1, records_saved:0, warnings:res.validation.ok?[]:res.validation.issues, data:res }; }catch(e){ return { step:'draft_thesis', status:'failed', message:String(e.message||e), records_found:0, records_saved:0, warnings:['Draft thesis failed'] }; }
}
export function optionallyRunSynthesisStep(ctx){
  if(!ctx.options.runSynthesis) return { step:'synthesis', status:'skipped', message:'Skipped', records_found:0, records_saved:0, warnings:[] };
  if(!ctx.draftThesis?.draft) return { step:'synthesis', status:'partial', message:'No draft thesis available for synthesis', records_found:0, records_saved:0, warnings:['Missing thesis input'] };
  const s=synthesizeEvidence({ thesis:ctx.draftThesis.draft, selectedSources:(ctx.snapshots||[]).map(x=>({source_type:x.source_type})), marketData:ctx.marketData||{}, catalyst:null });
  return { step:'synthesis', status:'success', message:'Synthesis generated', records_found:1, records_saved:0, warnings:[], data:s };
}

export async function runCompanyResearchPacket(input){
  const ticker=String(input.ticker||'').toUpperCase();
  const companyName=input.companyName||ticker;
  const options={ includeSec:true, includeFundamentals:true, includeClinicalTrials:true, includePubMed:true, includeFda:true, includeMarketData:true, createDraftThesis:false, runSynthesis:true, limitPerSource:5, ...(input.options||{}) };
  const ctx={ ...input, ticker, companyName, options, base:input.base||'http://localhost:3000' };
  const steps=[];
  const sec = options.includeSec ? await runSecStep(ctx) : { step:'sec',status:'skipped',message:'Skipped',records_found:0,records_saved:0,warnings:[] }; steps.push(sec); ctx.secFilings=sec.data||[];
  const trials = options.includeClinicalTrials ? await runClinicalTrialsStep(ctx) : { step:'clinical_trials',status:'skipped',message:'Skipped',records_found:0,records_saved:0,warnings:[] }; steps.push(trials); ctx.trials=trials.data||[];
  const market = options.includeMarketData ? await runMarketDataStep(ctx) : { step:'market',status:'skipped',message:'Skipped',records_found:0,records_saved:0,warnings:[] }; steps.push(market); ctx.marketData=market.data||{};
  const fund = options.includeFundamentals ? await runFundamentalsStep(ctx) : { step:'fundamentals',status:'skipped',message:'Skipped',records_found:0,records_saved:0,warnings:[] }; steps.push(fund); ctx.fundamentals=fund.data;
  const pubmed = options.includePubMed ? await runPubMedStep(ctx) : { step:'pubmed',status:'skipped',message:'Skipped',records_found:0,records_saved:0,warnings:[] }; steps.push(pubmed); ctx.pubmed=pubmed.data||[];
  const fda = options.includeFda ? await runFdaStep(ctx) : { step:'fda',status:'skipped',message:'Skipped',records_found:0,records_saved:0,warnings:[] }; steps.push(fda); ctx.fda=fda.data||[];
  const c = inferCatalystsStep(ctx); steps.push(c); ctx.catalysts=c.data||[];
  const snaps = await createSourceSnapshotsStep(ctx); steps.push(snaps); ctx.snapshots=snaps.data||[];
  const d = await optionallyDraftThesisStep(ctx); steps.push(d); ctx.draftThesis=d.data;
  const syn = optionallyRunSynthesisStep(ctx); steps.push(syn); ctx.synthesis=syn.data;
  const summary = buildResearchPacketSummary(ctx);
  const failed = steps.filter(s=>s.status==='failed').length; const partial = steps.filter(s=>s.status==='partial').length;
  const status = failed===steps.length?'failed':(failed||partial?'partial':'success');
  return { ticker, companyName, status, steps, sources_created:ctx.snapshots||[], catalysts_created_or_suggested:ctx.catalysts||[], fundamental_report_id:ctx.fundamentals?.id, research_packet_summary:summary, draft_thesis_id:ctx.draftThesis?.draft?.id, synthesis_id:ctx.synthesis?.id, missing_data:summary.missing_data||[], warnings:steps.flatMap(s=>s.warnings||[]) };
}
