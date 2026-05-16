'use client';
import { useEffect, useState } from 'react';

export default function TickerPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase();
  const [catalysts, setCatalysts] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  async function load() {
    const r = await fetch(`/api/catalysts?ticker=${symbol}`);
    if (r.ok) setCatalysts(await r.json());
  }
  useEffect(() => { load(); }, [symbol]);

  async function addCatalyst(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/catalysts', { method: 'POST', body: JSON.stringify({ ticker: symbol, title, expected_date: expectedDate, catalyst_type: 'manual', risk_level: 'medium', status: 'upcoming' }) });
    setTitle(''); setExpectedDate('');
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
  </div>;
}
