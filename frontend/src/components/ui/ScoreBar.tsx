import { cn } from '@/lib/utils';

interface Props { score: number; className?: string; showLabel?: boolean }

export default function ScoreBar({ score, className, showLabel = false }: Props) {
  const pct = Math.max(0, Math.min(100, score));
  const color =
    pct >= 80 ? 'bg-emerald-500' :
    pct >= 65 ? 'bg-yellow-500'  :
    pct >= 45 ? 'bg-orange-500'  : 'bg-red-500';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs font-mono text-zinc-400 w-7 text-right">{pct.toFixed(0)}</span>}
    </div>
  );
}
