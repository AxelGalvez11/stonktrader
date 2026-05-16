'use client';
import { useState } from 'react';

export default function PaperTradesPage() {
  const [form, setForm] = useState({ ticker: '', thesis_id: '', stop_reason: '', paper_position_size: '', exit_plan: '' });
  const [msg, setMsg] = useState('');
  const [quoteInfo, setQuoteInfo] = useState<any>(null);
  const [syn, setSyn] = useState<any>(null);
  const [overrideReady, setOverrideReady] = useState(false);

  async function loadSynthesis(thesisId: string, ticker: string) {
    if (!thesisId && !ticker) return;
    const r = await fetch(`/api/thesis-synthesis?${thesisId ? `thesisId=${thesisId}` : `ticker=${ticker}`}`);
    if (r.ok) { const rows = await r.json(); setSyn(Array.isArray(rows)?rows[0]:null); }
  }

  async function useLatestQuote() {
    const t = form.ticker.toUpperCase();
    if (!t) return setMsg('Enter ticker first');
    const r = await fetch(`/api/market/quote?ticker=${t}`);
    const j = await r.json();
    if (!r.ok) return setMsg(j.error || 'Quote unavailable; enter manually.');
    if (!j.price) return setMsg('Price missing; enter manually.');
    setForm({ ...form, paper_position_size: form.paper_position_size, ticker: t });
    setQuoteInfo(j);
    setMsg(`Using latest quote ${j.price} from ${j.provider} at ${j.retrieved_at}. ${j.delayed ? 'market data may be delayed' : ''}`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const entry = quoteInfo?.price;
    const body = { ...form, ticker: form.ticker.toUpperCase(), entry_price: entry ?? null, paper_position_size: Number(form.paper_position_size), status: 'open' };
    await loadSynthesis(form.thesis_id, body.ticker);
    if (syn?.paper_trade_readiness==='not_ready' && !overrideReady) { setMsg('Synthesis not_ready. Add missing risk fields and acknowledge override.'); return; }
    if (!body.entry_price && !form.ticker) { setMsg('Price missing and ticker missing.'); return; }
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
      <button type="button" onClick={useLatestQuote} className="bg-zinc-700 rounded px-3 py-2 col-span-2">Use latest quote as entry price</button>
      {syn && <div className="text-xs text-amber-300 col-span-2">Synthesis readiness: {syn.paper_trade_readiness} (heuristic, approximate)</div>}
      <label className="text-xs text-zinc-400 col-span-2 flex items-center gap-2"><input type="checkbox" checked={overrideReady} onChange={e=>setOverrideReady(e.target.checked)} /> Educational override for not_ready synthesis</label>
      <button className="bg-blue-600 rounded px-3 py-2 col-span-2">Create paper trade</button>
    </form>
    {msg && <div className="text-sm text-amber-300">{msg}</div>}
  </div>;
}
