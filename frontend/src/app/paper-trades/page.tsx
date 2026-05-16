'use client';
import { useState } from 'react';

export default function PaperTradesPage() {
  const [form, setForm] = useState({ ticker: '', thesis_id: '', stop_reason: '', paper_position_size: '', exit_plan: '' });
  const [msg, setMsg] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, ticker: form.ticker.toUpperCase(), paper_position_size: Number(form.paper_position_size), status: 'planned' };
    const r = await fetch('/api/paper-trades', { method: 'POST', body: JSON.stringify(body) });
    const j = await r.json();
    setMsg(r.ok ? 'Paper trade created.' : (j.error || 'Failed'));
  }

  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-semibold">Paper Trades</h1>
    <form onSubmit={submit} className="grid grid-cols-2 gap-2 bg-zinc-900 border border-zinc-800 rounded p-4 max-w-2xl">
      <input className="bg-zinc-800 p-2 rounded" placeholder="Ticker" value={form.ticker} onChange={e=>setForm({...form,ticker:e.target.value})} required />
      <input className="bg-zinc-800 p-2 rounded" placeholder="Thesis ID" value={form.thesis_id} onChange={e=>setForm({...form,thesis_id:e.target.value})} required />
      <input className="bg-zinc-800 p-2 rounded" placeholder="Invalidation point" value={form.stop_reason} onChange={e=>setForm({...form,stop_reason:e.target.value})} required />
      <input className="bg-zinc-800 p-2 rounded" type="number" placeholder="Position size" value={form.paper_position_size} onChange={e=>setForm({...form,paper_position_size:e.target.value})} required />
      <input className="bg-zinc-800 p-2 rounded col-span-2" placeholder="Exit plan" value={form.exit_plan} onChange={e=>setForm({...form,exit_plan:e.target.value})} required />
      <button className="bg-blue-600 rounded px-3 py-2 col-span-2">Create paper trade</button>
    </form>
    {msg && <div className="text-sm text-amber-300">{msg}</div>}
  </div>;
}
