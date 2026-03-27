'use client';

import type { DiagnosticsResult } from '@/types';
import Empty from '@/components/ui/Empty';
import { cn } from '@/lib/utils';

interface Props { data: DiagnosticsResult | null; loading?: boolean; label: string }

function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className={cn('text-sm font-mono', accent ?? 'text-zinc-200')}>{value}</span>
    </div>
  );
}

function pct(n: number) { return `${(n * 100).toFixed(1)}%`; }

export default function DiagnosticsPanel({ data, loading, label }: Props) {
  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-lg bg-zinc-800 animate-pulse" />)}
    </div>
  );
  if (!data) return <Empty message={`No diagnostics data for ${label}`} />;

  return (
    <div className="space-y-4">
      {/* Performance summary */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
        <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Performance — {label}</div>
        <div className="text-xs text-zinc-600 mb-3">{data.period}</div>
        <div className="space-y-0.5">
          <StatRow label="Total ranked" value={data.total_ranked} />
          <StatRow label="Hit rate" value={pct(data.hit_rate)}
            accent={data.hit_rate >= 0.6 ? 'text-emerald-400' : data.hit_rate >= 0.4 ? 'text-amber-400' : 'text-red-400'} />
          <StatRow label="Avg return" value={pct(data.avg_return)}
            accent={data.avg_return >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <StatRow label="Benchmark return" value={pct(data.benchmark_return)} />
          <StatRow label="Alpha" value={pct(data.alpha)}
            accent={data.alpha >= 0 ? 'text-emerald-400' : 'text-red-400'} />
          <StatRow label="Max drawdown" value={pct(data.max_drawdown)} accent="text-red-400" />
          <StatRow label="Sharpe proxy" value={data.sharpe_proxy.toFixed(2)}
            accent={data.sharpe_proxy >= 1 ? 'text-emerald-400' : 'text-amber-400'} />
        </div>
      </div>

      {/* Top reason codes */}
      {data.top_reason_codes.length > 0 && (
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-3">Top Reason Codes</div>
          <div className="flex flex-wrap gap-1.5">
            {data.top_reason_codes.map(code => (
              <span key={code} className="px-2 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-300 font-mono">
                {code}
              </span>
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

      {/* Disclaimer */}
      <p className="text-xs text-zinc-600 italic leading-relaxed">{data.disclaimer}</p>
    </div>
  );
}
