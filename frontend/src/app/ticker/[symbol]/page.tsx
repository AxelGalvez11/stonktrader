'use client';
import { useEffect, useState } from 'react';

const SOURCE_TYPES = ['manual','company_ir','sec','pubmed','clinical_trials','fda','news','other'] as const;

export default function TickerPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase();
  const [catalysts, setCatalysts] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceType, setSourceType] = useState<(typeof SOURCE_TYPES)[number]>('manual');
  const [attachCatalyst, setAttachCatalyst] = useState('');
  const [structured, setStructured] = useState<any>(null);

  async function load() {
    const [c, n] = await Promise.all([fetch(`/api/catalysts?ticker=${symbol}`), fetch(`/api/research-notes?ticker=${symbol}`)]);
    if (c.ok) setCatalysts(await c.json());
    if (n.ok) setNotes(await n.json());
  }
  useEffect(() => { load(); }, [symbol]);

  async function addCatalyst(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/catalysts', { method: 'POST', body: JSON.stringify({ ticker: symbol, title, expected_date: expectedDate, catalyst_type: 'manual', risk_level: 'medium', status: 'upcoming' }) });
    setTitle(''); setExpectedDate('');
    await load();
  }

  async function structureNote() {
    const r = await fetch('/api/research-structure', { method: 'POST', body: JSON.stringify({ ticker: symbol, raw_text: noteText, company: 'missing' }) });
    setStructured(await r.json());
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
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4">Pipeline: missing</div>
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
      <h2 className="font-semibold">Manual Catalysts</h2>
      <form onSubmit={addCatalyst} className="flex gap-2 my-2">
        <input className="bg-zinc-800 p-2 rounded" placeholder="Catalyst title" value={title} onChange={e => setTitle(e.target.value)} required />
        <input className="bg-zinc-800 p-2 rounded" type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} required />
        <button className="bg-blue-600 rounded px-3">Add</button>
      </form>
      {catalysts.length === 0 ? <div className="text-sm text-zinc-400">No catalysts</div> : catalysts.map(c => <div key={c.id} className="text-sm py-1">{c.expected_date}: {c.title}</div>)}
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
