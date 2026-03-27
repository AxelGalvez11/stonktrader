'use client';

import type { DiagnosticsResult } from '@/types';
import ScoreBar from '@/components/ui/ScoreBar';
import { ScoreBadge } from '@/components/ui/Badge';
import Empty from '@/components/ui/Empty';
import { cn } from '@/lib/utils';

interface Props { data: DiagnosticsResult | null; loading?: boolean; label: string }

function StatRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0">
      <span className="text-xs text-zinc-400">{label}</span>
      <div className="text-right">
        <span className="text-sm font-mono text-zinc-200">{value}</span>
        {sub && <div className="text-xs text-zinc-500">{sub}</div>}
      </div>
    </div>
  );
}

export default function DiagnosticsPanel({ data, loading, label }: Props) {
  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-lg bg-zinc-800 animate-pulse" />)}
    </div>
  );
  if (!data) return <Empty message={`No diagnostics data for ${label}`} />;

  return (
    <div className="space-y-4">
      {/* Distribution */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Score Distribution — {label}</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-0.5">
            <StatRow label="Total ranked" value={data.total_ranked} />
            <StatRow label="Mean score" value={data.mean_score.toFixed(1)} />
            <StatRow label="Median score" value={data.median_score.toFixed(1)} />
            <StatRow label="Std dev" value={data.std_dev.toFixed(1)} />
          </div>
          <div className="space-y-0.5">
            <StatRow label="Min" value={data.min_score.toFixed(1)} />
            <StatRow label="Max" value={data.max_score.toFixed(1)} />
            <StatRow label="p25" value={data.p25_score.toFixed(1)} />
            <StatRow label="p75" value={data.p75_score.toFixed(1)} />
          </div>
        </div>
      </div>

      {/* Top items */}
      {data.top_items.length > 0 && (
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Top Ranked</div>
          <div className="space-y-2">
            {data.top_items.map((item, i) => (
              <div key={item.symbol} className="flex items-center gap-3">
                <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                <span className="font-mono font-semibold text-zinc-200 w-16">{item.symbol}</span>
                <ScoreBar score={item.score} className="flex-1" />
                <ScoreBadge score={item.score} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Factor averages */}
      {Object.keys(data.factor_averages).length > 0 && (
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Factor Averages</div>
          <div className="space-y-2">
            {Object.entries(data.factor_averages).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 w-32 shrink-0">{key}</span>
                <ScoreBar score={val * 100} className="flex-1" />
                <span className="text-xs font-mono text-zinc-500 w-8 text-right">{(val * 100).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {data.warnings.length > 0 && (
        <div className="bg-zinc-900 rounded-lg border border-amber-500/20 p-4">
          <div className="text-xs font-medium text-amber-500 uppercase tracking-wide mb-2">Warnings</div>
          <ul className="space-y-1">
            {data.warnings.map((w, i) => (
              <li key={i} className="text-xs text-zinc-400">⚠ {w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
