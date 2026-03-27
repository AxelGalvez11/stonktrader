import { cn, pctColor } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  delta?: number;       // shown as +X% if provided
  icon?: LucideIcon;
  accent?: string;      // Tailwind text class e.g. 'text-emerald-400'
  loading?: boolean;
  className?: string;
}

export default function StatCard({ label, value, delta, icon: Icon, accent, loading, className }: Props) {
  return (
    <div className={cn('bg-zinc-900 border border-zinc-800 rounded-lg p-4', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500 uppercase tracking-wide">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-zinc-600" />}
      </div>
      {loading ? (
        <div className="h-8 w-24 bg-zinc-800 rounded animate-pulse" />
      ) : (
      <div className={cn('text-2xl font-semibold font-mono', accent ?? 'text-zinc-100')}>
        {value}
      </div>
      )}
      {delta !== undefined && (
        <div className={cn('text-xs mt-1 font-mono', pctColor(delta))}>
          {delta >= 0 ? '+' : ''}{(delta * 100).toFixed(1)}%
        </div>
      )}
    </div>
  );
}
