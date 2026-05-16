'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockThesis } from '@/features/biotech/data/mockData';
import { validateThesisJson } from '@/features/biotech/lib/thesisSchema';
import { buildSourcesFromNotes, findMissingFields, generateDraftFromNotes, prefillFromClinicalTrial, thesisQualityGates } from '@/features/biotech/lib/thesisBuilder.js';
import ThesisPreview from '@/features/biotech/components/ThesisPreview';
import ClinicalTrialSourceCard from '@/features/biotech/components/ClinicalTrialSourceCard';
import PubMedSourceCard from '@/features/biotech/components/PubMedSourceCard';
import FdaSourceCard from '@/features/biotech/components/FdaSourceCard';
import SynthesisPanel from '@/features/biotech/components/SynthesisPanel';
import DraftReviewPanel from '@/features/biotech/components/thesis/DraftReviewPanel';

export default function NewThesisPage() {
  const params = useSearchParams();
  const noteId = params.get('noteId');
  const tickerParam = params.get('ticker') || '';
  const [notes, setNotes] = useState<any[]>([]);
  const [secSources, setSecSources] = useState<any[]>([]);
  const [trialSources, setTrialSources] = useState<any[]>([]);
  const [pubmedSources, setPubmedSources] = useState<any[]>([]);
  const [fdaSources, setFdaSources] = useState<any[]>([]);
  const [fundamentalSources, setFundamentalSources] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>(noteId ? [noteId] : []);
  const [thesis, setThesis] = useState<any>({ ...mockThesis, ticker: tickerParam || mockThesis.ticker });
  const [msg, setMsg] = useState('');
  const [syn, setSyn] = useState<any>(null);
  const [ackWeak, setAckWeak] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [aiDraft, setAiDraft] = useState<any>(null);
  const [aiMeta, setAiMeta] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const [n, s, t, p, f, fr] = await Promise.all([
        fetch(`/api/research-notes${tickerParam ? `?ticker=${tickerParam}` : ''}`),
        tickerParam ? fetch(`/api/sec/filings?ticker=${tickerParam}`) : Promise.resolve(new Response(JSON.stringify({ filings: [] }))),
        tickerParam ? fetch(`/api/clinical-trials/search?ticker=${tickerParam}`) : Promise.resolve(new Response(JSON.stringify({ trials: [] }))),
        tickerParam ? fetch(`/api/pubmed/ingest`, { method: 'POST', body: JSON.stringify({ ticker: tickerParam, query: `${tickerParam} mechanism endpoint safety`, context: { drug: tickerParam }, limit: 10 }) }) : Promise.resolve(new Response(JSON.stringify({ articles: [] }))),
        tickerParam ? fetch(`/api/fda/ingest`, { method: 'POST', body: JSON.stringify({ ticker: tickerParam, query: `${tickerParam} safety warning label`, context: { drug: tickerParam, company: tickerParam }, limit: 10 }) }) : Promise.resolve(new Response(JSON.stringify({ records: [] }))),
        tickerParam ? fetch(`/api/fundamentals?ticker=${tickerParam}`) : Promise.resolve(new Response(JSON.stringify([]))),
      ]);
      if (n.ok) setNotes(await n.json());
      if (s.ok) setSecSources((await s.json()).filings || []);
      if (t.ok) setTrialSources((await t.json()).trials || []);
      if (p.ok) setPubmedSources((await p.json()).articles || []);
      if (f.ok) setFdaSources((await f.json()).records || []);
      if (fr.ok) setFundamentalSources(await fr.json());
    }
    load();
  }, [tickerParam]);

  const sourceCandidates = useMemo(() => {
    const a = notes.map((n:any)=>({ id:n.id, source_type:n.source_type||'manual', source_url:n.source_url||'missing', title:n.title||'note', raw_text:n.raw_text||'' }));
    const b = secSources.map((s:any)=>({ id:`sec:${s.accessionNumber}`, source_type:'sec', source_url:`https://www.sec.gov/Archives/edgar/data/${Number(s.cik||0)}/${String(s.accessionNumber||'').replace(/-/g,'')}/${s.primaryDocument||''}`, title:`${s.filingType} ${s.filingDate}`, raw_text:'' }));
    const c = trialSources.map((t:any)=>({ id:`ct:${t.nct_id}`, source_type:'clinical_trials', source_url:t.source_url, title:t.brief_title, trial:t, raw_text:'' }));
    const d = pubmedSources.map((p:any)=>({ id:`pm:${p.pmid}`, source_type:'pubmed', source_url:p.source_url, title:p.title, pubmed:p, raw_text:p.abstract||'' }));
    const e = fdaSources.map((r:any)=>({ id:`fda:${r.fda_source_id||r.title}`, source_type:'fda', source_url:r.source_url, title:r.title, fda:r, raw_text:JSON.stringify(r.label_sections||{}) }));
    const f = fundamentalSources.map((r:any)=>({ id:`fund:${r.id||r.created_at}`, source_type:'fundamentals', source_url:'missing', title:`Fundamentals ${r.ticker}`, fundamentals:r, raw_text:JSON.stringify(r) }));
    return [...a,...b,...c,...d,...e,...f];
  }, [notes, secSources, trialSources, pubmedSources, fdaSources, fundamentalSources]);

  const selectedSources = useMemo(() => sourceCandidates.filter(s => selected.includes(s.id)), [sourceCandidates, selected]);
  const missing = useMemo(() => findMissingFields(thesis), [thesis]);
  const toggle = (id:string)=> setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]);

  function applyDraftToForm(d:any){ setThesis({ ...thesis, ...d }); }

  async function draftFromSelectedEvidence() {
    if (!selectedSources.length) return setMsg('Select at least one source before requesting AI-assisted draft.');
    setDraftLoading(true); setMsg('');
    const payload = { ticker: thesis.ticker, companyName: thesis.company, catalystId: null, selectedSources: selectedSources.map((s:any)=>({ source_type:s.source_type, title:s.title, url:s.source_url, summary:s.raw_text||'', metadata:{ id:s.id } })), marketContext: {}, draftPreferences:{ tone:'conservative', includeFollowUpQuestions:true } };
    const r = await fetch('/api/thesis-draft', { method:'POST', body: JSON.stringify(payload) });
    const j = await r.json();
    if (!r.ok) { setMsg((j.error || 'Draft failed. Manual builder remains available.') + (j.validation?.issues ? ` | ${j.validation.issues.join(' | ')}` : '')); setAiMeta(j); setDraftLoading(false); return; }
    setAiDraft(j.draft); setAiMeta(j);
    applyDraftToForm(j.draft);
    if (!j.validation?.ok) setMsg(`Draft validation warnings: ${(j.validation.issues||[]).join(' | ')}`);
    else setMsg('AI-assisted draft applied. Review fields and run synthesis before saving.');
    setDraftLoading(false);
  }

  function generateDraft() {
    const d = generateDraftFromNotes({ ticker: thesis.ticker, company: thesis.company, notes: selectedSources });
    const trial = (selectedSources.find((s:any)=>s.source_type==='clinical_trials') as any)?.trial;
    if (trial) Object.assign(d, prefillFromClinicalTrial(d, trial));
    const pm = (selectedSources.find((s:any)=>s.source_type==='pubmed') as any)?.pubmed;
    if (pm) {
      d.science_summary = `Fact: ${pm.title || 'missing'}. Interpretation: public evidence suggests uncertainty.`;
      const sig = pm.scientific_signals || {};
      d.mechanism = d.mechanism === 'missing' ? ((sig.mechanism_support||[]).slice(0,2).join(', ') || 'missing') : d.mechanism;
      if ((sig.endpoint_relevance||[]).length) d.primary_endpoint_analysis = `${d.primary_endpoint_analysis} | literature: ${(sig.endpoint_relevance||[]).slice(0,2).join(', ')}`;
      if ((sig.safety_signals||[]).length) d.safety_analysis = `Potential safety signals: ${(sig.safety_signals||[]).slice(0,3).join(', ')}`;
      if ((sig.competitor_context||[]).length) d.competitor_landscape = `Literature context: ${(sig.competitor_context||[]).slice(0,2).join(', ')}`;
      if ((sig.prior_target_failures||[]).length && (sig.prior_target_successes||[]).length) d.warnings = Array.from(new Set([...(d.warnings||[]), 'conflicting evidence']));
    }

    const fda = (selectedSources.find((s:any)=>s.source_type==='fda') as any)?.fda;
    if (fda) {
      d.regulatory_risk = `Public FDA source regulatory context: ${(fda.regulatory_signals?.safety_warnings||[]).slice(0,2).join(', ') || 'missing'}`;
      if ((fda.regulatory_signals?.safety_warnings||[]).length || (fda.regulatory_signals?.boxed_warning||[]).length) d.safety_analysis = `FDA safety context: ${[...(fda.regulatory_signals?.safety_warnings||[]), ...(fda.regulatory_signals?.boxed_warning||[])].slice(0,3).join(', ')}`;
      if (fda.indication && fda.indication !== 'missing') d.standard_of_care = `Comparator/class evidence from public FDA label: ${String(fda.indication).slice(0,180)}`;
      d.warnings = Array.from(new Set([...(d.warnings||[]), 'public FDA source', 'regulatory context', 'does not imply approval certainty']));
      if ((d.warnings||[]).includes('conflicting evidence')) d.warnings = Array.from(new Set([...(d.warnings||[]), 'regulatory/scientific tension']));
    }

    const fr = (selectedSources.find((s:any)=>s.source_type==='fundamentals') as any)?.fundamentals;
    if (fr) {
      d.financial_risk = `Fundamental research: overall ${fr.fundamental_quality?.overall_label || 'missing'}`;
      d.dilution_risk = fr.biotech_specific_metrics?.dilution_risk || d.dilution_risk;
      d.cash_runway = String(fr.financial_snapshot?.estimated_runway_quarters ?? 'missing');
      d.market_expectation = `Observed public financial data context: P/S ${fr.valuation_metrics?.price_to_sales ?? 'missing'}`;
      d.base_case = fr.base_case || d.base_case;
      d.warnings = Array.from(new Set([...(d.warnings||[]), 'fundamental research is approximate where data is incomplete']));
    }
    setThesis(d);
  }


  async function analyzeThesisQuality() {
    const draft = { ...thesis, source_summary: buildSourcesFromNotes(selectedSources) };
    const marketData = tickerParam ? await (await fetch('/api/market/refresh', { method: 'POST', body: JSON.stringify({ ticker: tickerParam, range: '6mo' }) })).json() : null;
    const catalyst = null;
    const r = await fetch('/api/thesis-synthesis', { method: 'POST', body: JSON.stringify({ ticker: draft.ticker, thesis: draft, selectedSources, marketData, catalyst }) });
    const j = await r.json();
    if (!r.ok) return setMsg(j.error || 'Synthesis failed');
    setSyn(j.synthesis);
  }

  async function saveGuided() {
    setMsg('');
    const draft = { ...thesis, source_summary: buildSourcesFromNotes(selectedSources) };
    const gate = thesisQualityGates(draft); if (gate.length) return setMsg(gate.join(' | '));
    const valid = validateThesisJson(draft); if (!valid.ok) return setMsg((valid.errors||['Invalid thesis']).join(' | '));
    if (syn?.paper_trade_readiness==='not_ready' && !ackWeak) { setMsg('Thesis marked not_ready. Acknowledge educational override to save.'); return; }
    const r = await fetch('/api/theses', { method: 'POST', body: JSON.stringify({ ticker: draft.ticker, thesis_json: draft, source_ids: draft.source_summary.map((s: any) => s.sourceId) }) });
    setMsg(r.ok ? 'Thesis saved.' : `Save failed: ${(await r.json()).error}`);
  }

  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-semibold">Guided Thesis Builder</h1>
    <p className="text-sm text-zinc-400">Paper-trading thesis only. Use public registry/filing data and preserve uncertainty.</p>
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2">
      <h2 className="font-semibold">Select sources (manual, SEC, Clinical Trials)</h2>
      {sourceCandidates.map((s:any)=> s.source_type==='clinical_trials' ? (
        <ClinicalTrialSourceCard key={s.id} trial={s.trial} selected={selected.includes(s.id)} onToggle={()=>toggle(s.id)} />
      ) : s.source_type==='pubmed' ? (
        <PubMedSourceCard key={s.id} article={s.pubmed} selected={selected.includes(s.id)} onToggle={()=>toggle(s.id)} />
      ) : s.source_type==='fda' ? (
        <FdaSourceCard key={s.id} rec={s.fda} selected={selected.includes(s.id)} onToggle={()=>toggle(s.id)} />
      ) : (
        <label key={s.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(s.id)} onChange={()=>toggle(s.id)} /> {s.title} <span className="text-zinc-500">({s.source_type})</span></label>
      ))}
      <button className="bg-zinc-700 rounded px-3 py-2" onClick={generateDraft}>Generate local draft from selected sources</button>
      <button className="bg-blue-600 rounded px-3 py-2" onClick={draftFromSelectedEvidence} disabled={draftLoading}>{draftLoading ? 'Drafting…' : 'Draft thesis from selected evidence'}</button>
      <div className='text-xs text-amber-300'>AI draft is editable and may be incomplete. Uses only selected sources. Review all missing fields before saving.</div>
    </div>

    <div className="grid grid-cols-2 gap-3 bg-zinc-900 border border-zinc-800 rounded p-4">
      {['company','ticker','drug','indication','mechanism','trial_phase','catalyst','expected_date','science_summary','clinical_trial_design','primary_endpoint_analysis','secondary_endpoint_analysis','safety_analysis','standard_of_care','competitor_landscape','regulatory_risk','financial_risk','cash_runway','dilution_risk','market_expectation','bull_case','bear_case','base_case','invalidation_criteria'].map((k) => (
        <div key={k} className={k.includes('summary') || k.includes('analysis') || k.includes('case') ? 'col-span-2' : ''}>
          <label className="block text-xs text-zinc-400">{k}</label>
          <textarea className="w-full bg-zinc-800 rounded p-2 text-sm" rows={k.includes('summary') || k.includes('analysis') || k.includes('case') ? 3 : 2} value={thesis[k] ?? ''} onChange={e => setThesis({ ...thesis, [k]: e.target.value })} />
        </div>
      ))}
    </div>

    <DraftReviewPanel draft={aiDraft} meta={aiMeta} onApply={aiDraft ? ()=>applyDraftToForm(aiDraft) : undefined} />
    <ThesisPreview thesis={{ ...thesis, source_summary: buildSourcesFromNotes(selectedSources) }} missing={missing} />
    <div className="flex gap-2"><button className="bg-zinc-700 rounded px-3 py-2" onClick={analyzeThesisQuality}>Analyze thesis quality</button><button className="bg-blue-600 rounded px-3 py-2" onClick={saveGuided}>Save guided thesis</button></div>
    <label className="text-xs text-zinc-400 flex items-center gap-2"><input type="checkbox" checked={ackWeak} onChange={e=>setAckWeak(e.target.checked)} /> Acknowledge educational override for weak/not_ready synthesis</label>
    <SynthesisPanel s={syn} />
    {msg && <div className="text-sm text-amber-300">{msg}</div>}
  </div>;
}
