import { mockCatalysts, mockWatchlist } from '@/features/biotech/data/mockData';
import RiskBadge from '@/features/biotech/components/RiskBadge';

export default function DashboardPage() {
  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-semibold">Biotech Research Dashboard</h1>
    <p className="text-sm text-amber-300">This tool is for personal research and paper trading only. It does not provide financial advice, investment advice, or guaranteed predictions.</p>
    <p className="text-sm text-red-300">Do not enter confidential, leaked, or nonpublic clinical, FDA, company, or trial information.</p>
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded p-4">Watchlist: {mockWatchlist.length}</div>
      <div className="bg-zinc-900 border border-zinc-800 rounded p-4">Upcoming catalysts: {mockCatalysts.length}</div>
      <div className="bg-zinc-900 border border-zinc-800 rounded p-4">Open paper trades: 1</div>
    </div>
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
      <h2 className="font-medium mb-2">Upcoming Catalysts</h2>
      {mockCatalysts.map(c => <div key={c.id} className="flex items-center justify-between py-2 border-b border-zinc-800/40"><span>{c.ticker} — {c.title}</span><RiskBadge level={c.riskLevel} /></div>)}
    </div>
  </div>;
}
