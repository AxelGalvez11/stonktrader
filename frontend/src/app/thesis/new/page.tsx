'use client';
import { useState } from 'react';
import { mockThesis } from '@/features/biotech/data/mockData';
import { validateThesisJson } from '@/features/biotech/lib/thesisSchema';

export default function NewThesisPage() {
  const [text, setText] = useState(JSON.stringify(mockThesis, null, 2));
  const [msg, setMsg] = useState('');

  async function submit() {
    setMsg('');
    let parsed: any;
    try { parsed = JSON.parse(text); } catch { setMsg('Invalid JSON'); return; }
    const valid = validateThesisJson(parsed);
    if (!valid.ok) { setMsg((valid.errors || ['Invalid thesis']).join(' | ')); return; }
    const r = await fetch('/api/theses', { method: 'POST', body: JSON.stringify({ ticker: parsed.ticker, thesis_json: parsed, source_ids: parsed.source_summary?.map((s:any)=>s.sourceId) || [] }) });
    setMsg(r.ok ? 'Thesis saved.' : `Save failed: ${(await r.json()).error}`);
  }

  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-semibold">AI Thesis Generator</h1>
    <p className="text-sm text-zinc-400">Separate facts, assumptions, and interpretations. Use "missing" for unknown data.</p>
    <textarea className="w-full h-[420px] bg-zinc-900 border border-zinc-800 rounded p-3 font-mono text-xs" value={text} onChange={e => setText(e.target.value)} />
    <button className="bg-blue-600 rounded px-3 py-2" onClick={submit}>Validate + Save thesis</button>
    {msg && <div className="text-sm text-amber-300">{msg}</div>}
  </div>;
}
