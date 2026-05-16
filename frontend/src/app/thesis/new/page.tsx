'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockThesis } from '@/features/biotech/data/mockData';
import { validateThesisJson } from '@/features/biotech/lib/thesisSchema';
import { buildSourcesFromNotes, findMissingFields, generateDraftFromNotes, thesisQualityGates } from '@/features/biotech/lib/thesisBuilder.js';
import ThesisPreview from '@/features/biotech/components/ThesisPreview';

export default function NewThesisPage() {
  const params = useSearchParams();
  const noteId = params.get('noteId');
  const tickerParam = params.get('ticker') || '';
  const [notes, setNotes] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>(noteId ? [noteId] : []);
  const [thesis, setThesis] = useState<any>({ ...mockThesis, ticker: tickerParam || mockThesis.ticker });
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState(JSON.stringify(mockThesis, null, 2));
  const [msg, setMsg] = useState('');

  useEffect(() => {
    async function load() {
      const r = await fetch(`/api/research-notes${tickerParam ? `?ticker=${tickerParam}` : ''}`);
      if (r.ok) setNotes(await r.json());
    }
    load();
  }, [tickerParam]);

  const selectedNotes = useMemo(() => notes.filter(n => selected.includes(n.id)), [notes, selected]);
  const missing = useMemo(() => findMissingFields(thesis), [thesis]);

  function toggleSelect(id: string) { setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); }

  function generateDraft() {
    const d = generateDraftFromNotes({ ticker: thesis.ticker, company: thesis.company, notes: selectedNotes });
    setThesis(d);
  }

  async function saveGuided() {
    setMsg('');
    const draft = { ...thesis, source_summary: buildSourcesFromNotes(selectedNotes) };
    const gate = thesisQualityGates(draft);
    if (gate.length) { setMsg(gate.join(' | ')); return; }
    const valid = validateThesisJson(draft);
    if (!valid.ok) { setMsg((valid.errors || ['Invalid thesis']).join(' | ')); return; }
    const r = await fetch('/api/theses', { method: 'POST', body: JSON.stringify({ ticker: draft.ticker, thesis_json: draft, source_ids: draft.source_summary.map((s: any) => s.sourceId) }) });
    setMsg(r.ok ? 'Thesis saved.' : `Save failed: ${(await r.json()).error}`);
  }

  async function saveJson() {
    setMsg('');
    let parsed: any;
    try { parsed = JSON.parse(jsonText); } catch { setMsg('Invalid JSON'); return; }
    const valid = validateThesisJson(parsed);
    if (!valid.ok) { setMsg((valid.errors || ['Invalid thesis']).join(' | ')); return; }
    if (!parsed.invalidation_criteria || parsed.invalidation_criteria === 'missing') { setMsg('Invalidation criteria required'); return; }
    if (!parsed.source_summary?.length) { setMsg('Source summary required'); return; }
    const r = await fetch('/api/theses', { method: 'POST', body: JSON.stringify({ ticker: parsed.ticker, thesis_json: parsed, source_ids: parsed.source_summary.map((s: any) => s.sourceId).filter(Boolean) }) });
    setMsg(r.ok ? 'Thesis saved.' : `Save failed: ${(await r.json()).error}`);
  }

  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-semibold">Guided Thesis Builder</h1>
    <p className="text-sm text-zinc-400">Use public evidence only. Build a paper-trading thesis with explicit uncertainty and missing data.</p>

    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2">
      <h2 className="font-semibold">Select research notes as sources</h2>
      {notes.length === 0 ? <div className="text-sm text-zinc-400">No notes found for this ticker.</div> : notes.map(n => (
        <label key={n.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.includes(n.id)} onChange={() => toggleSelect(n.id)} /> {n.title} <span className="text-zinc-500">({n.source_type})</span></label>
      ))}
      <button className="bg-zinc-700 rounded px-3 py-2" onClick={generateDraft}>Generate draft from selected notes</button>
    </div>

    <div className="grid grid-cols-2 gap-3 bg-zinc-900 border border-zinc-800 rounded p-4">
      {['company','ticker','drug','indication','mechanism','trial_phase','catalyst','expected_date','science_summary','clinical_trial_design','primary_endpoint_analysis','secondary_endpoint_analysis','safety_analysis','standard_of_care','competitor_landscape','regulatory_risk','financial_risk','cash_runway','dilution_risk','market_expectation','bull_case','bear_case','base_case','invalidation_criteria'].map((k) => (
        <div key={k} className={k.includes('summary') || k.includes('analysis') || k.includes('case') ? 'col-span-2' : ''}>
          <label className="block text-xs text-zinc-400">{k}</label>
          <textarea className="w-full bg-zinc-800 rounded p-2 text-sm" rows={k.includes('summary') || k.includes('analysis') || k.includes('case') ? 3 : 2} value={thesis[k] ?? ''} onChange={e => setThesis({ ...thesis, [k]: e.target.value })} />
        </div>
      ))}
      <div>
        <label className="block text-xs text-zinc-400">confidence_label</label>
        <select className="w-full bg-zinc-800 rounded p-2" value={thesis.confidence_label} onChange={e => setThesis({ ...thesis, confidence_label: e.target.value })}>
          <option value="low">low</option><option value="moderate">moderate</option><option value="high">high</option>
        </select>
      </div>
      <div>
        <label className="block text-xs text-zinc-400">warnings (comma-separated or "none identified")</label>
        <input className="w-full bg-zinc-800 rounded p-2" value={(thesis.warnings || []).join(', ')} onChange={e => setThesis({ ...thesis, warnings: e.target.value.split(',').map((x: string) => x.trim()).filter(Boolean) })} />
      </div>
    </div>

    <ThesisPreview thesis={{ ...thesis, source_summary: buildSourcesFromNotes(selectedNotes) }} missing={missing} />
    <button className="bg-blue-600 rounded px-3 py-2" onClick={saveGuided}>Save guided thesis</button>

    <div className="pt-4 border-t border-zinc-800">
      <button className="text-sm text-blue-400" onClick={() => setJsonMode(!jsonMode)}>Advanced JSON import</button>
      {jsonMode && <div className="space-y-2 mt-2">
        <textarea className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded p-3 font-mono text-xs" value={jsonText} onChange={e => setJsonText(e.target.value)} />
        <button className="bg-zinc-700 rounded px-3 py-2" onClick={saveJson}>Validate + Save JSON</button>
      </div>}
    </div>

    {msg && <div className="text-sm text-amber-300">{msg}</div>}
  </div>;
}
