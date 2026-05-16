import { mockWatchlist } from '@/features/biotech/data/mockData';

const bucketLabel = {
  anchor: 'Safer biotech learning basket',
  speculative: 'Speculative science/catalyst basket',
  lottery: 'Lottery-only basket',
} as const;

export default function WatchlistPage() {
  return <div className="p-6 space-y-6">
    <h1 className="text-2xl font-semibold">Watchlist</h1>

    {(['anchor', 'speculative', 'lottery'] as const).map((bucket) => {
      const items = mockWatchlist.filter((w) => w.bucket === bucket);
      return (
        <section key={bucket} className="bg-zinc-900 border border-zinc-800 rounded p-4">
          <h2 className="font-semibold mb-3">{bucketLabel[bucket]}</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-zinc-400"><th className="p-2">Ticker</th><th>Company</th><th>Subsector</th><th>Rating</th><th>Status</th></tr></thead>
            <tbody>{items.map(w => <tr key={w.id} className="border-t border-zinc-800"><td className="p-2 font-mono">{w.ticker}</td><td>{w.companyName}</td><td>{w.subsector}</td><td>{w.paperTradeRating ?? '—'}</td><td>{w.status}</td></tr>)}</tbody>
          </table>
        </section>
      );
    })}
  </div>;
}
