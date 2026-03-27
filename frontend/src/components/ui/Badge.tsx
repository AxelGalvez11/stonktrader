import { scoreBg, riskBg } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps { score: number; className?: string }
interface RiskBadgeProps  { score: number; className?: string }
interface TagBadgeProps   { label: string; variant?: 'default' | 'blue' | 'amber' | 'red'; className?: string }

export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono font-semibold border', scoreBg(score), className)}>
      {score.toFixed(0)}
    </span>
  );
}

export function RiskBadge({ score, className }: RiskBadgeProps) {
  const label = score <= 25 ? 'LOW' : score <= 50 ? 'MED' : score <= 75 ? 'HIGH' : 'V.HIGH';
  return (
    <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold border', riskBg(score), className)}>
      {label}
    </span>
  );
}

export function TagBadge({ label, variant = 'default', className }: TagBadgeProps) {
  const styles = {
    default: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    blue:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red:     'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded text-xs border', styles[variant], className)}>
      {label}
    </span>
  );
}
