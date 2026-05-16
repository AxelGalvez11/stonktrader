'use client';
import { useEffect, useMemo, useState } from 'react';
import WorkflowChecklist from '@/features/biotech/components/workflow/WorkflowChecklist';
import { buildLinkageWarnings, buildWorkflowChecklist, nextBestActions } from '@/features/biotech/lib/workflow/workflowChecklist';

const SOURCE_TYPES = ['manual','company_ir','sec','pubmed','clinical_trials','fda','news','other'] as const;

export default function TickerPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase();
  const [catalysts, setCatalysts] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [catalystType, setCatalystType] = useState('manual');
  const [dateConfidence, setDateConfidence] = useState('low');
  const [riskLevel, setRiskLevel] = useState('medium');
  const [catalystDescription, setCatalystDescription] = useState('');
  const [catalystSourceUrl, setCatalystSourceUrl] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<(typeof SOURCE_TYPES)[number]>('manual');
  const [attachCatalyst, setAttachCatalyst] = useState('');
  const [structured, setStructured] = useState<any>(null);
  const [secLoading, setSecLoading] = useState(false);
  const [secData, setSecData] = useState<any[]>([]);
  const [secMsg, setSecMsg] = useState('');
  const [trialLoading, setTrialLoading] = useState(false);
  const [trials, setTrials] = useState<any[]>([]);
  const [trialMsg, setTrialMsg] = useState('');
  const [pubmedQuery, setPubmedQuery] = useState('');
  const [pubmedLoading, setPubmedLoading] = useState(false);
  const [pubmed, setPubmed] = useState<any[]>([]);
  const [pubmedMsg, setPubmedMsg] = useState('');
  const [fdaQuery, setFdaQuery] = useState('');
  const [fdaLoading, setFdaLoading] = useState(false);
  const [fda, setFda] = useState<any[]>([]);
  const [fdaMsg, setFdaMsg] = useState('');
  const [market, setMarket] = useState<any>(null);
  const [marketMsg, setMarketMsg] = useState('');
  const [marketLoading, setMarketLoading] = useState(false);
  const [watchlistExists, setWatchlistExists] = useState(false);
  const [paperTrades, setPaperTrades] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [syntheses, setSyntheses] = useState<any[]>([]);
  const [theses, setTheses] = useState<any[]>([]);
  const [fundamentals, setFundamentals] = useState<any[]>([]);
  const [fundMsg, setFundMsg] = useState('');



  async function load() {
    const [c, n, w, p, r, syn, th, fr] = await Promise.all([fetch(`/api/catalysts?ticker=${symbol}`), fetch(`/api/research-notes?ticker=${symbol}`), fetch('/api/watchlist'), fetch('/api/paper-trades'), fetch('/api/trade-reviews'), fetch(`/api/thesis-synthesis?ticker=${symbol}`), fetch(`/api/theses?ticker=${symbol}`), fetch(`/api/fundamentals?ticker=${symbol}`)]);
    if (c.ok) setCatalysts(await c.json());
    if (n.ok) setNotes(await n.json());
    if (w.ok) { const j = await w.json(); setWatchlistExists((j||[]).some((x:any)=>String(x.ticker||'').toUpperCase()===symbol)); }
    if (p.ok) setPaperTrades((await p.json()).filter((x:any)=>String(x.ticker||'').toUpperCase()===symbol));
    if (r.ok) setReviews(await r.json());
    if (syn.ok) setSyntheses(await syn.json());
    if (th.ok) setTheses(await th.json());
    if (fr.ok) setFundamentals(await fr.json());
  }
  useEffect(() => { load(); }, [symbol]);

  async function addCatalyst(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/catalysts', { method: 'POST', body: JSON.stringify({ ticker: symbol, title, expected_date: expectedDate, catalyst_type: catalystType, date_confidence: dateConfidence, risk_level: riskLevel, description: catalystDescription, source_url: catalystSourceUrl || null, status: 'upcoming' }) });
    setTitle(''); setExpectedDate(''); setCatalystType('manual'); setDateConfidence('low'); setRiskLevel('medium'); setCatalystDescription(''); setCatalystSourceUrl('');
    await load();
  }

  async function structureNote() {
    const r = await fetch('/api/research-structure', { method: 'POST', body: JSON.stringify({ ticker: symbol, raw_text: noteText, company: 'missing' }) });
    setStructured(await r.json());
  }






  async function refreshMarketData() {
    setMarketLoading(true); setMarketMsg('');
    const catalystDate = catalysts?.[0]?.expected_date;
    const r = await fetch('/api/market/refresh', { method: 'POST', body: JSON.stringify({ ticker: symbol, range: '6mo', catalystDate }) });
    const j = await r.json();
    if (!r.ok) setMarketMsg(j.error || 'Market refresh failed. Market data may be delayed.');
    else setMarket(j);
    setMarketLoading(false);
  }

  async function searchFda() {
    setFdaLoading(true); setFdaMsg('');
    const q = fdaQuery || `${symbol} safety warning contraindication`;
    const r = await fetch('/api/fda/ingest', { method: 'POST', body: JSON.stringify({ ticker: symbol, query: q, context: { drug: symbol, company: symbol }, limit: 10 }) });
    const j = await r.json();
    if (!r.ok) setFdaMsg(j.error || 'FDA ingestion failed.');
    else setFda(j.records || []);
    setFdaLoading(false);
  }

  async function searchPubMed() {
    setPubmedLoading(true); setPubmedMsg('');
    const q = pubmedQuery || `${symbol} mechanism endpoint safety`;
    const r = await fetch('/api/pubmed/ingest', { method: 'POST', body: JSON.stringify({ ticker: symbol, query: q, context: { drug: symbol }, limit: 10 }) });
    const j = await r.json();
    if (!r.ok) setPubmedMsg(j.error || 'PubMed ingestion failed. Set NCBI_TOOL and NCBI_EMAIL.');
    else setPubmed(j.articles || []);
    setPubmedLoading(false);
  }

  async function fetchClinicalTrials() {
    setTrialLoading(true); setTrialMsg('');
    const r = await fetch('/api/clinical-trials/ingest', { method: 'POST', body: JSON.stringify({ ticker: symbol, companyName: symbol, limit: 10 }) });
    const j = await r.json();
    if (!r.ok) setTrialMsg(j.error || 'ClinicalTrials ingestion failed.');
    else setTrials(j.trials || []);
    setTrialLoading(false);
  }

  async function fetchSecFilings() {
    setSecLoading(true);
    setSecMsg('');
    const r = await fetch('/api/sec/ingest', { method: 'POST', body: JSON.stringify({ ticker: symbol, filingTypes: ['10-Q','10-K','8-K','S-3','S-1','424B5','424B3'], limit: 5 }) });
    const j = await r.json();
    if (!r.ok) setSecMsg(j.error || 'SEC ingestion failed. Set SEC_USER_AGENT in environment.');
    else setSecData(j.filings || []);
    setSecLoading(false);
  }


  const checklist = useMemo(()=>buildWorkflowChecklist({
    watchlist_exists: watchlistExists,
    sec_count: secData.length,
    clinical_trials_count: trials.length,
    pubmed_count: pubmed.length,
    fda_count: fda.length,
    market_refreshed: !!market,
    catalyst_count: catalysts.length,
    thesis_exists: theses.length>0,
    synthesis_exists: syntheses.length>0,
    paper_trade_exists: paperTrades.length>0,
    review_exists: reviews.some((x:any)=>paperTrades.some((t:any)=>String(t.id)===String(x.paper_trade_id))),
  }), [watchlistExists,secData,trials,pubmed,fda,market,catalysts,theses,syntheses,paperTrades,reviews]);
  const actions = useMemo(()=>nextBestActions(checklist),[checklist]);
  const linkageWarnings = useMemo(()=>buildLinkageWarnings({ paper_trades: paperTrades, syntheses, catalysts, theses }), [paperTrades, syntheses, catalysts, theses]);


  async function analyzeFundamentals(){
    setFundMsg('');
    const r = await fetch('/api/fundamentals/analyze', { method:'POST', body: JSON.stringify({ ticker: symbol, companyName: symbol, includeSec:true, includeMarketData:true, includePipelineContext:true }) });
    const j = await r.json();
    if(!r.ok) setFundMsg(j.error||'Fundamental analysis failed.');
    else { setFundMsg('Fundamental research report updated (paper-trading analysis only).'); await load(); }
  }

  async function saveNote(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/research-notes', { method: 'POST', body: JSON.stringify({ ticker: symbol, title: noteTitle || `Note ${new Date().toISOString()}`, raw_text: noteText, source_url: sourceUrl || null, source_type: sourceType, catalyst_id: attachCatalyst || null, user_id: '00000000-0000-0000-0000-000000000000' }) });
    setNoteTitle(''); setNoteText(''); setSourceUrl(''); setAttachCatalyst(''); setStructured(null);
    await load();
  }

  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-semibold">{symbol} detail</h1>
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4">Company summary: missing</div>
    <WorkflowChecklist status={checklist} actions={actions} />
    <div className="bg-zinc-900 border border-zinc-800 rounded p-3 text-xs"><b>Linked Research Objects</b> • theses {theses.length} • syntheses {syntheses.length} • open paper trades {paperTrades.filter((t:any)=>t.status==='open').length} • reviews {reviews.filter((x:any)=>paperTrades.some((t:any)=>String(t.id)===String(x.paper_trade_id))).length}{linkageWarnings.length>0 && <div className='text-amber-300 mt-1'>Warnings: {linkageWarnings.join(' | ')}</div>}</div>
    <div className="text-xs text-zinc-400">Quick links: <a className="text-blue-400" href={`/thesis/new?ticker=${symbol}`}>Thesis builder</a> • <a className="text-blue-400" href={`/paper-trades`}>Paper trades</a> • <a className="text-blue-400" href={`/review`}>Post-event review</a> • <a className="text-blue-400" href={`/analytics`}>Analytics</a></div>
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4">Pipeline: missing</div>
    <div className='bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2'>
      <h2 className='font-semibold'>Fundamentals</h2>
      <button className='bg-blue-600 rounded px-3 py-2' onClick={analyzeFundamentals}>Analyze fundamentals</button>
      {fundMsg && <div className='text-sm text-amber-300'>{fundMsg}</div>}
      {(fundamentals||[]).length===0 ? <div className='text-sm text-zinc-400'>No fundamental research report yet.</div> : <div className='text-sm space-y-1'>
        <div>Company type: <b>{fundamentals[0].company_type}</b></div>
        <div>Cash/runway: {fundamentals[0].financial_snapshot?.cash_and_equivalents ?? 'missing'} / {fundamentals[0].financial_snapshot?.estimated_runway_quarters ?? 'missing'} qtrs</div>
        <div>Profitability/revenue: {fundamentals[0].financial_snapshot?.net_income ?? 'missing'} / {fundamentals[0].financial_snapshot?.revenue ?? 'missing'}</div>
        <div>Valuation: P/S {fundamentals[0].valuation_metrics?.price_to_sales ?? 'missing'} | EV/S {fundamentals[0].valuation_metrics?.enterprise_value_to_sales ?? 'missing'}</div>
        <div>Dilution risk: {fundamentals[0].biotech_specific_metrics?.dilution_risk ?? 'missing'}</div>
        <div>Concentration: {fundamentals[0].biotech_specific_metrics?.product_concentration_risk ?? 'missing'}</div>
        <div>Bull/Base/Bear: {fundamentals[0].bull_case} | {fundamentals[0].base_case} | {fundamentals[0].bear_case}</div>
        <div>Missing data: {(fundamentals[0].missing_data||[]).join(', ') || 'none'}</div>
        <a className='text-blue-400 text-xs' href={`/thesis/new?ticker=${symbol}`}>Use in thesis</a>
      </div>}
    </div>
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
      <h2 className="font-semibold">Manual Catalysts</h2>
      <form onSubmit={addCatalyst} className="grid grid-cols-3 gap-2 my-2">
        <input className="bg-zinc-800 p-2 rounded" placeholder="Catalyst title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input className="bg-zinc-800 p-2 rounded" type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} required />
        <select className="bg-zinc-800 p-2 rounded" value={catalystType} onChange={e=>setCatalystType(e.target.value)}><option value="manual">manual</option><option value="trial_data">trial_data</option><option value="completion_update">completion_update</option></select>
        <select className="bg-zinc-800 p-2 rounded" value={dateConfidence} onChange={e=>setDateConfidence(e.target.value)}><option>low</option><option>moderate</option><option>high</option></select>
        <select className="bg-zinc-800 p-2 rounded" value={riskLevel} onChange={e=>setRiskLevel(e.target.value)}><option>low</option><option>medium</option><option>high</option></select>
        <input className="bg-zinc-800 p-2 rounded" placeholder="Source URL" value={catalystSourceUrl} onChange={e=>setCatalystSourceUrl(e.target.value)} />
        <input className="bg-zinc-800 p-2 rounded col-span-3" placeholder="Description" value={catalystDescription} onChange={e=>setCatalystDescription(e.target.value)} />
        <button className="bg-blue-600 rounded px-3 col-span-3">Add</button>
      </form>
      {catalysts.length === 0 ? <div className="text-sm text-zinc-400">No catalysts yet. Add a possible catalyst window to unlock downstream workflow.</div> : catalysts.map(c => <div key={c.id} className="text-sm py-1">{c.expected_date}: {c.title}</div>)}
    </div>



    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2">
      <h2 className="font-semibold">SEC Filings</h2>
      <div className="flex gap-2">
        <button className="bg-blue-600 rounded px-3 py-2" onClick={fetchSecFilings} disabled={secLoading}>{secLoading ? 'Fetching…' : 'Fetch SEC filings'}</button>
        <span className="text-xs text-zinc-400">Uses public EDGAR data only.</span>
      </div>
      {secMsg && <div className="text-sm text-amber-300">{secMsg}</div>}
      {secData.length === 0 ? <div className="text-sm text-zinc-400">No SEC filings fetched yet.</div> : secData.map((f:any) => (
        <div key={f.accessionNumber} className="border-t border-zinc-800 py-2 text-sm">
          <div><b>{f.filingType}</b> {f.filingDate} • {f.accessionNumber}</div>
          <a className="text-blue-400 text-xs" href={f.url} target="_blank">Source filing</a>
          <div className="text-xs text-zinc-400">Dilution flags: {(f.extracted?.dilution_mentions || []).slice(0,2).join(' | ') || 'missing'}</div>
          <div className="text-xs text-zinc-400">Runway language: {(f.extracted?.runway_mentions || []).slice(0,2).join(' | ') || 'missing'}</div>
          <a className="text-blue-400 text-xs" href={`/thesis/new?ticker=${symbol}`}>Use in thesis</a>
        </div>
      ))}
    </div>


    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2">
      <h2 className="font-semibold">Clinical Trials</h2>
      <button className="bg-blue-600 rounded px-3 py-2" onClick={fetchClinicalTrials} disabled={trialLoading}>{trialLoading ? 'Fetching…' : 'Fetch clinical trials'}</button>
      {trialMsg && <div className="text-sm text-amber-300">{trialMsg}</div>}
      {trials.length === 0 ? <div className="text-sm text-zinc-400">No ClinicalTrials records yet. Try again later or adjust company/ticker assumptions.</div> : trials.map((x:any) => {
        const t = x.trial;
        return <div key={t.nct_id} className="border-t border-zinc-800 py-2 text-sm"> 
          <div><b>{t.nct_id}</b> • {t.phase} • {t.status}</div>
          <div>{t.brief_title}</div>
          <div className="text-zinc-400">Condition: {(t.conditions||[])[0] || 'missing'} | Intervention: {(t.interventions||[])[0] || 'missing'} | Enrollment: {t.enrollment}</div>
          <div className="text-zinc-400">Primary endpoint: {(t.primary_endpoints||[])[0] || 'missing'}</div>
          <div className="text-zinc-400">Primary completion: {t.primary_completion_date}</div>
          <div className="text-zinc-400">Potential catalyst: {x.potentialCatalyst.title} ({x.potentialCatalyst.expected_date})</div>
          <a className="text-blue-400 text-xs mr-3" href={t.source_url} target="_blank">Source</a>
          <button className="text-blue-400 text-xs mr-3" onClick={() => { setTitle(x.potentialCatalyst.title); setExpectedDate(x.potentialCatalyst.expected_date === 'missing' ? '' : x.potentialCatalyst.expected_date); setCatalystType(x.potentialCatalyst.catalyst_type); setDateConfidence(x.potentialCatalyst.date_confidence); setRiskLevel(x.potentialCatalyst.risk_level); setCatalystDescription(x.potentialCatalyst.description); setCatalystSourceUrl(t.source_url); }}>Create potential catalyst</button>
          <a className="text-blue-400 text-xs" href={`/thesis/new?ticker=${symbol}`}>Use in thesis</a>
        </div>
      })}
    </div>


    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2">
      <h2 className="font-semibold">PubMed Literature</h2>
      <div className="flex gap-2"><input className="bg-zinc-800 p-2 rounded flex-1" placeholder="Search PubMed query" value={pubmedQuery} onChange={e=>setPubmedQuery(e.target.value)} />
      <button className="bg-blue-600 rounded px-3 py-2" onClick={searchPubMed} disabled={pubmedLoading}>{pubmedLoading ? 'Searching…' : 'Search PubMed'}</button></div>
      {pubmedMsg && <div className="text-sm text-amber-300">{pubmedMsg}</div>}
      {pubmed.length===0 ? <div className="text-sm text-zinc-400">No PubMed results yet. Provider may be unavailable or query may be too narrow.</div> : pubmed.map((a:any)=><div key={a.pmid} className="border-t border-zinc-800 py-2 text-sm"><div><b>PMID {a.pmid}</b> {a.title}</div><div className="text-zinc-400">{a.journal} {a.publication_date} relevance {a.relevance_score}</div><div className="text-zinc-400">{String(a.abstract||'').slice(0,180)}</div><a className="text-blue-400 text-xs" href={`/thesis/new?ticker=${symbol}`}>Use in thesis</a></div>)}
    </div>


    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2">
      <h2 className="font-semibold">FDA Regulatory Sources</h2>
      <div className="flex gap-2"><input className="bg-zinc-800 p-2 rounded flex-1" placeholder="Search FDA query" value={fdaQuery} onChange={e=>setFdaQuery(e.target.value)} />
      <button className="bg-blue-600 rounded px-3 py-2" onClick={searchFda} disabled={fdaLoading}>{fdaLoading ? 'Searching…' : 'Search FDA'}</button></div>
      {fdaMsg && <div className="text-sm text-amber-300">{fdaMsg}</div>}
      {fda.length===0 ? <div className="text-sm text-zinc-400">No FDA results yet. Try broader safety/label terms or retry later.</div> : fda.map((r:any)=><div key={r.fda_source_id+r.title} className="border-t border-zinc-800 py-2 text-sm"><div><b>{r.source_kind}</b> {r.title}</div><div className="text-zinc-400">{r.drug_name} • {r.sponsor} • {r.approval_date}</div><div className="text-zinc-400">Regulatory context: boxed {(r.regulatory_signals?.boxed_warning||[]).length}, contraindications {(r.regulatory_signals?.contraindications||[]).length}, advisory {(r.regulatory_signals?.advisory_committee_concerns||[]).length}</div><a className="text-blue-400 text-xs" href={`/thesis/new?ticker=${symbol}`}>Use in thesis</a></div>)}
    </div>


    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2">
      <h2 className="font-semibold">Market Data</h2>
      <button className="bg-blue-600 rounded px-3 py-2" onClick={refreshMarketData} disabled={marketLoading}>{marketLoading ? 'Refreshing…' : 'Refresh market data'}</button>
      {marketMsg && <div className="text-sm text-amber-300">{marketMsg}</div>}
      {!market ? <div className="text-sm text-zinc-400">No market data loaded. Paper-trading analysis only. Market data may be delayed.</div> : <div className="text-sm space-y-1">
        <div>Quote: {market.quote?.price ?? 'missing'} ({market.quote?.provider}) {market.quote?.delayed ? 'delayed' : 'real-time unknown'}</div>
        <div>Market cap: {market.quote?.market_cap ?? 'missing'} | Volume: {market.quote?.volume ?? 'missing'} vs avg {market.quote?.average_volume ?? 'missing'}</div>
        <div>Liquidity flags: {(market.derived?.liquidity_flags || []).join(' | ') || 'missing'}</div>
        <div>Volatility summary (approximate): {JSON.stringify(market.derived?.volatility_summary || {})}</div>
        <div>Pre-catalyst run-up (approximate): {JSON.stringify(market.derived?.pre_catalyst_runup || {})}</div>
      </div>}
    </div>

    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-3">
      <h2 className="font-semibold">Research intake (paper trading only)</h2>
      <p className="text-xs text-zinc-400">Paste messy research notes, preserve source URL, and structure them with missing fields marked as "missing".</p>
      <form onSubmit={saveNote} className="space-y-2">
        <input className="bg-zinc-800 p-2 rounded w-full" placeholder="Note title" value={noteTitle} onChange={e => setNoteTitle(e.target.value)} required />
        <textarea className="bg-zinc-800 p-2 rounded w-full h-32" placeholder="Paste raw research note" value={noteText} onChange={e => setNoteText(e.target.value)} required />
        <div className="grid grid-cols-3 gap-2">
          <input className="bg-zinc-800 p-2 rounded" placeholder="Source URL (optional)" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} />
          <select className="bg-zinc-800 p-2 rounded" value={sourceType} onChange={e => setSourceType(e.target.value as any)}>{SOURCE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}</select>
          <select className="bg-zinc-800 p-2 rounded" value={attachCatalyst} onChange={e => setAttachCatalyst(e.target.value)}><option value="">Attach catalyst (optional)</option>{catalysts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        </div>
        <div className="flex gap-2">
          <button type="button" className="bg-zinc-700 rounded px-3 py-2" onClick={structureNote}>Structure draft</button>
          <button className="bg-blue-600 rounded px-3 py-2">Save note</button>
        </div>
      </form>
      {structured && <pre className="text-xs bg-zinc-950 border border-zinc-800 rounded p-2 overflow-auto">{JSON.stringify(structured, null, 2)}</pre>}
      <div>
        <h3 className="font-medium">Saved notes</h3>
        {notes.length === 0 ? <div className="text-sm text-zinc-400">No notes yet</div> : notes.map(n => <div key={n.id} className="border-t border-zinc-800 py-2 text-sm"><div className="font-medium">{n.title}</div><div className="text-zinc-400">{n.source_type} {n.source_url ? `• ${n.source_url}` : ''}</div><div className="line-clamp-2">{n.raw_text}</div><a className="text-blue-400 text-xs" href={`/thesis/new?ticker=${symbol}&noteId=${n.id}`}>Use in thesis</a></div>)}
      </div>
    </div>
  </div>;
}
