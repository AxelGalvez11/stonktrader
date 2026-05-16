import { mockWatchlist } from '@/features/biotech/data/mockData';

export default function WatchlistPage() {
  return <div className="p-6">
    <h1 className="text-2xl font-semibold mb-4">Watchlist</h1>
    <table className="w-full text-sm bg-zinc-900 border border-zinc-800 rounded">
      <thead><tr className="text-left text-zinc-400"><th className="p-2">Ticker</th><th>Company</th><th>Subsector</th><th>Tags</th><th>Status</th></tr></thead>
      <tbody>{mockWatchlist.map(w => <tr key={w.id} className="border-t border-zinc-800"><td className="p-2 font-mono">{w.ticker}</td><td>{w.companyName}</td><td>{w.subsector}</td><td>{w.tags.join(', ')}</td><td>{w.status}</td></tr>)}</tbody>
    </table>
  </div>;
}
