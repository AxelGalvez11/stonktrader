export default function AnalyticsOverviewCards({ overview }: { overview: any }) {
  return <div className="grid grid-cols-4 gap-3 text-sm">{[
    ['Total paper trades', overview.total_paper_trades],
    ['Reviewed trades', overview.reviewed_trades],
    ['Open trades', overview.open_trades],
    ['Closed unreviewed', overview.closed_unreviewed_trades],
    ['Avg thesis score', overview.average_thesis_quality_score?.toFixed?.(2) ?? 'n/a'],
    ['Avg result %', overview.average_paper_trade_result_percent?.toFixed?.(2) ?? 'n/a'],
    ['Win rate', overview.paper_trade_win_rate!=null ? `${(overview.paper_trade_win_rate*100).toFixed(1)}%` : 'n/a'],
    ['Readiness buckets', Object.keys(overview.average_result_by_readiness_label||{}).length],
  ].map(([k,v])=><div key={String(k)} className="bg-zinc-900 border border-zinc-800 rounded p-3"><div className="text-zinc-400">{k}</div><div className="font-semibold">{String(v)}</div></div>)}</div>;
}
