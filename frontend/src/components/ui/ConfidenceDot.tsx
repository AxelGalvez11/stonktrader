import { confidenceColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Props { confidence: number; showLabel?: boolean; className?: string }

export default function ConfidenceDot({ confidence, showLabel = false, className }: Props) {
  const label = confidence >= 0.70 ? 'High' : confidence >= 0.50 ? 'Med' : 'Low';
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('w-2 h-2 rounded-full shrink-0', confidenceColor(confidence))} />
      {showLabel && <span className="text-xs text-zinc-400">{label}</span>}
    </span>
  );
}
