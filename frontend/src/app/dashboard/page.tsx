'use client';
import { useEffect, useMemo, useState } from 'react';

export default function DashboardPage() {
  const [catalysts, setCatalysts] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [syntheses, setSyntheses] = useState<any[]>([]);
  const [learning, setLearning] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const [c, a, t, s, l] = await Promise.all([
        fetch('/api/catalysts'),
        fetch('/api/catalyst-alerts'),
        fetch('/api/paper-trades'),
        fetch('/api/thesis-synthesis'),
        fetch('/api/analytics/learning'),
      ]);
      if (c.ok) setCatalysts(await c.json());
      if (a.ok) setAlerts((await a.json()).alerts || []);
      if (t.ok) setTrades(await t.json());
      if (s.ok) setSyntheses(await s.json());
      if (l.ok) setLearning(await l.json());
    }
    load();
  }, []);

  const upcoming = useMemo(() => catalysts.filter((c) => c.expected_date && new Date(c.expected_date).getTime() >= Date.now()).sort((a, b) => new Date(a.expected_date).getTime() - new Date(b.expected_date).getTime()), [catalysts]);
  const upcoming30 = useMemo(() => upcoming.filter((c) => (new Date(c.expected_date).getTime() - Date.now()) / 86400000 <= 30), [upcoming]);
  const reviewNeededTrades = useMemo(() => trades.filter((t) => t.status === 'closed_unreviewed'), [trades]);
  const weakSyntheses = useMemo(() => syntheses.filter((s) => s.quality_label === 'weak' || s.paper_trade_readiness === 'not_ready'), [syntheses]);

  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-semibold">Biotech Research Dashboard</h1>
    <p className="text-sm text-amber-300">Paper-trading only. Research alerts and possible catalyst windows are uncertain and not buy/sell signals.</p>

    <div className="grid grid-cols-5 gap-3 text-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded p-3">Upcoming catalysts (30d): {upcoming30.length}</div>
      <div className="bg-zinc-900 border border-zinc-800 rounded p-3">Review-needed trades: {reviewNeededTrades.length}</div>
      <div className="bg-zinc-900 border border-zinc-800 rounded p-3">Weak/not_ready theses: {weakSyntheses.length}</div>
      <div className="bg-zinc-900 border border-zinc-800 rounded p-3">Top research alerts: {alerts.slice(0, 5).length}</div>
      <div className="bg-zinc-900 border border-zinc-800 rounded p-3">Total catalysts: {catalysts.length}</div>
    </div>

    <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
      <h2 className="font-medium mb-2">Next 5 Upcoming Catalysts</h2>
      {upcoming.slice(0, 5).map((c) => <div key={c.id} className="py-2 border-b border-zinc-800/40 text-sm">{c.ticker} — {c.title} ({c.expected_date})</div>)}
    </div>

    <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
      <h2 className="font-medium mb-2">Top 5 Research Alerts</h2>
      {alerts.slice(0, 5).map((a, idx) => <div key={`${a.alert_type}-${idx}`} className="py-2 border-b border-zinc-800/40 text-sm">{a.ticker} — {a.message}</div>)}
    </div>

    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 text-sm">
      <h2 className="font-medium mb-2">Learning insights</h2>
      <div>Top recurring mistake: {learning?.mistake_patterns?.top_recurring?.[0]?.category || 'n/a'}</div>
      <div>Review-needed count: {reviewNeededTrades.length}</div>
      <div>Average thesis score: {learning?.overview?.average_thesis_quality_score?.toFixed?.(2) ?? 'n/a'}</div>
      <div>Top learning recommendation: {learning?.recommendations?.[0] || 'Collect more paper-trade reviews.'}</div>
      <a className="text-blue-400" href="/analytics">Open learning analytics</a>
    </div>
  </div>;
}
