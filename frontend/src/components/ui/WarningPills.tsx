import { AlertTriangle } from 'lucide-react';
import { TagBadge } from './Badge';

const LABELS: Record<string, string> = {
  EARNINGS_PROXIMITY:      'earnings soon',
  HIGH_VOLATILITY:         'high vol',
  UNUSUAL_VOLUME:          'unusual vol',
  POTENTIAL_OVEREXTENSION: 'overextended',
  DOWNTREND:               'downtrend',
  HIGH_RUG_RISK:           'rug risk',
  LOW_LIQUIDITY:           'low liquidity',
  MICRO_CAP:               'micro cap',
  EXTREME_ATTENTION_SPIKE: 'attention spike',
  EXTREME_MOVE_24H:        'extreme move',
  RAPID_PUMP_1H:           'rapid pump',
  SHARP_DUMP_24H:          'sharp dump',
};

interface Props { warnings: string[] }

export default function WarningPills({ warnings }: Props) {
  if (!warnings.length) return null;
  return (
    <span className="inline-flex flex-wrap gap-1 items-center">
      <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
      {warnings.slice(0, 2).map(w => (
        <TagBadge key={w} label={LABELS[w] ?? w.toLowerCase().replace(/_/g, ' ')} variant="amber" />
      ))}
      {warnings.length > 2 && (
        <TagBadge label={`+${warnings.length - 2}`} variant="amber" />
      )}
    </span>
  );
}
