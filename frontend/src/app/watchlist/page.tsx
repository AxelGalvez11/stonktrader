'use client';
import { useEffect, useState } from 'react';
import { mockWatchlist } from '@/features/biotech/data/mockData';

type Item = any;

export default function WatchlistPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState({ ticker: '', company_name: '', subsector: '', status: 'researching', tags: '' });
  const [error, setError] = useState('');

  async function load() {
    const r = await fetch('/api/watchlist');
    const j = await r.json();
    if (r.ok) setItems(j); else { setError(j.error || 'Failed to load'); setItems(mockWatchlist as any); }
  }
  useEffect(() => { load(); }, []);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const body = { ...form, ticker: form.ticker.toUpperCase(), tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), user_id: '00000000-0000-0000-0000-000000000000' };
    const r = await fetch('/api/watchlist', { method: 'POST', body: JSON.stringify(body) });
    if (!r.ok) setError((await r.json()).error || 'Create failed');
    setForm({ ticker: '', company_name: '', subsector: '', status: 'researching', tags: '' });
    await load();
  }

  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-semibold">Watchlist</h1>
    <form onSubmit={addItem} className="grid grid-cols-5 gap-2 bg-zinc-900 border border-zinc-800 rounded p-3">
      <input className="bg-zinc-800 p-2 rounded" placeholder="Ticker" value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })} required />
      <input className="bg-zinc-800 p-2 rounded" placeholder="Company" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} required />
      <input className="bg-zinc-800 p-2 rounded" placeholder="Subsector" value={form.subsector} onChange={e => setForm({ ...form, subsector: e.target.value })} />
      <input className="bg-zinc-800 p-2 rounded" placeholder="Tags comma-separated" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
      <button className="bg-blue-600 rounded px-3">Add</button>
    </form>
    {error && <div className="text-red-400 text-sm">{error}</div>}
    <table className="w-full text-sm bg-zinc-900 border border-zinc-800 rounded">
      <thead><tr className="text-left text-zinc-400"><th className="p-2">Ticker</th><th>Company</th><th>Subsector</th><th>Tags</th><th>Status</th></tr></thead>
      <tbody>{items.map((w: any, i: number) => <tr key={w.id || i} className="border-t border-zinc-800"><td className="p-2 font-mono"><a href={`/ticker/${w.ticker}`}>{w.ticker}</a></td><td>{w.company_name ?? w.companyName}</td><td>{w.subsector}</td><td>{Array.isArray(w.tags) ? w.tags.join(', ') : ''}</td><td>{w.status}</td></tr>)}</tbody>
    </table>
  </div>;
}
