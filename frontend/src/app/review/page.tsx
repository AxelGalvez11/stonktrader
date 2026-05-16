'use client';
import { useEffect, useMemo, useState } from 'react';
import TradeReviewCard from '@/features/biotech/components/TradeReviewCard';
import { MISTAKE_CATEGORIES } from '@/features/biotech/lib/reviewAnalyzer';

export default function ReviewPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ paper_trade_id: '', catalyst_outcome: '', actual_event_date: '', stock_reaction_percent: 'not available', exit_price: '', result_percent: '', result_dollars: '', scientific_notes: '', financial_notes: '', market_reaction_notes: '', user_reflection: '', mistake_category: '', lesson_learned: '', future_rule: '' });
  const [msg, setMsg] = useState('');

  async function load() {
    const [t, r] = await Promise.all([fetch('/api/paper-trades'), fetch('/api/trade-reviews')]);
    if (t.ok) setTrades(await t.json());
    if (r.ok) setReviews(await r.json());
  }
  useEffect(() => { load(); }, []);

  const reviewedIds = useMemo(() => new Set(reviews.map((x:any) => String(x.paper_trade_id))), [reviews]);
  const openTrades = trades.filter(t => t.status === 'open');
  const closedUnreviewed = trades.filter(t => t.status === 'closed_unreviewed' || (t.status === 'closed' && !reviewedIds.has(String(t.id))));
  const awaitingReview = trades.filter(t => t.thesis_id && (t.status === 'closed_unreviewed' || t.status === 'closed'));
  const reviewedTrades = trades.filter(t => t.status === 'reviewed' || reviewedIds.has(String(t.id)));

  async function autoCalcMoves(date: string, ticker: string) {
    if (!date || !ticker) return;
    const r = await fetch('/api/market/refresh', { method: 'POST', body: JSON.stringify({ ticker, range: '6mo', eventDate: date }) });
    if (!r.ok) return;
    const j = await r.json();
    const d = j.derived?.post_catalyst_move || {};
    setMsg(`Auto-calculated approximate moves: 1d ${d.move_1d_percent}, 3d ${d.move_3d_percent}, 5d ${d.move_5d_percent}, 10d ${d.move_10d_percent}`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, paper_trade_id: form.paper_trade_id, exit_price: form.exit_price ? Number(form.exit_price) : null, result_percent: form.result_percent ? Number(form.result_percent) : null, result_dollars: form.result_dollars ? Number(form.result_dollars) : null };
    const r = await fetch('/api/trade-reviews', { method: 'POST', body: JSON.stringify(body) });
    const j = await r.json();
    setMsg(r.ok ? 'Review saved.' : (Array.isArray(j.error) ? j.error.join(' | ') : (j.error || 'Failed')));
    if (r.ok) { setForm({ ...form, catalyst_outcome: '', lesson_learned: '', future_rule: '', mistake_category: '' }); await load(); }
  }

  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-semibold">Post-Event Review</h1>
    <p className="text-sm text-zinc-400">Educational paper-trading review only. Public evidence suggests uncertainty; this does not predict future trades.</p>

    <div className="grid grid-cols-4 gap-3 text-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded p-3">Open trades: {openTrades.length}</div>
      <div className="bg-zinc-900 border border-zinc-800 rounded p-3">Closed unreviewed: {closedUnreviewed.length}</div>
      <div className="bg-zinc-900 border border-zinc-800 rounded p-3">Awaiting review: {awaitingReview.length}</div>
      <div className="bg-zinc-900 border border-zinc-800 rounded p-3">Reviewed: {reviewedTrades.length}</div>
    </div>

    <form onSubmit={submit} className="bg-zinc-900 border border-zinc-800 rounded p-4 grid grid-cols-2 gap-2">
      <select className="bg-zinc-800 p-2 rounded" value={form.paper_trade_id} onChange={e => { const id=e.target.value; const t=trades.find((x:any)=>String(x.id)===String(id)); setForm({ ...form, paper_trade_id: id, actual_event_date: t?.actual_exit_date || form.actual_event_date, catalyst_outcome: t?.catalyst_outcome || form.catalyst_outcome }); }} required>
        <option value="">Select paper trade</option>
        {trades.map(t => <option key={t.id} value={t.id}>{t.ticker} #{t.id} ({t.status})</option>)}
      </select>
      <input className="bg-zinc-800 p-2 rounded" placeholder="Catalyst outcome" value={form.catalyst_outcome} onChange={e => setForm({ ...form, catalyst_outcome: e.target.value })} required />
      <input className="bg-zinc-800 p-2 rounded" type="date" value={form.actual_event_date} onChange={e => { const d=e.target.value; setForm({ ...form, actual_event_date: d }); const t=trades.find(x=>String(x.id)===String(form.paper_trade_id)); autoCalcMoves(d, t?.ticker||''); }} />
      <input className="bg-zinc-800 p-2 rounded" placeholder="Stock reaction % or not available" value={form.stock_reaction_percent} onChange={e => setForm({ ...form, stock_reaction_percent: e.target.value })} required />
      <input className="bg-zinc-800 p-2 rounded" placeholder="Exit price" value={form.exit_price} onChange={e => setForm({ ...form, exit_price: e.target.value })} />
      <input className="bg-zinc-800 p-2 rounded" placeholder="Result %" value={form.result_percent} onChange={e => setForm({ ...form, result_percent: e.target.value })} />
      <input className="bg-zinc-800 p-2 rounded" placeholder="Result $" value={form.result_dollars} onChange={e => setForm({ ...form, result_dollars: e.target.value })} />
      <select className="bg-zinc-800 p-2 rounded" value={form.mistake_category} onChange={e => setForm({ ...form, mistake_category: e.target.value })} required>
        <option value="">Mistake category</option>{MISTAKE_CATEGORIES.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <textarea className="bg-zinc-800 p-2 rounded col-span-2" placeholder="What happened scientifically" value={form.scientific_notes} onChange={e => setForm({ ...form, scientific_notes: e.target.value })} />
      <textarea className="bg-zinc-800 p-2 rounded col-span-2" placeholder="What happened financially" value={form.financial_notes} onChange={e => setForm({ ...form, financial_notes: e.target.value })} />
      <textarea className="bg-zinc-800 p-2 rounded col-span-2" placeholder="What happened in market reaction" value={form.market_reaction_notes} onChange={e => setForm({ ...form, market_reaction_notes: e.target.value })} />
      <textarea className="bg-zinc-800 p-2 rounded col-span-2" placeholder="User reflection" value={form.user_reflection} onChange={e => setForm({ ...form, user_reflection: e.target.value })} />
      <input className="bg-zinc-800 p-2 rounded" placeholder="Lesson learned" value={form.lesson_learned} onChange={e => setForm({ ...form, lesson_learned: e.target.value })} required />
      <input className="bg-zinc-800 p-2 rounded" placeholder="Future rule" value={form.future_rule} onChange={e => setForm({ ...form, future_rule: e.target.value })} required />
      <button className="bg-blue-600 rounded px-3 py-2 col-span-2">Save review</button>
    </form>
    {msg && <div className="text-sm text-amber-300">{msg}</div>}

    <div className="space-y-3">
      {reviews.map(r => <TradeReviewCard key={r.id} item={r} />)}
    </div>
  </div>;
}
