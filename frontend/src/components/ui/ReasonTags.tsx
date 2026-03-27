import { TagBadge } from './Badge';

const POSITIVE = new Set([
  'STRONG_MOMENTUM','RECENT_BREAKOUT','LONG_TERM_TREND',
  'ABOVE_50D_MA','LOW_VOLATILITY','SECTOR_LEADER','POSITIVE_SENTIMENT',
  'ABNORMAL_VOLUME','VIRAL_MOMENTUM','STRONG_SENTIMENT','PRICE_SURGE_24H',
  'VOLUME_SPIKE','GOOD_LIQUIDITY','LOW_RUG_RISK','RECENT_PUMP_1H',
]);

interface Props { codes: string[]; max?: number }

export default function ReasonTags({ codes, max = 3 }: Props) {
  const visible = codes.slice(0, max);
  return (
    <span className="inline-flex flex-wrap gap-1">
      {visible.map(code => (
        <TagBadge
          key={code}
          label={code.replace(/_/g, ' ').toLowerCase()}
          variant={POSITIVE.has(code) ? 'blue' : 'default'}
        />
      ))}
      {codes.length > max && (
        <TagBadge label={`+${codes.length - max}`} variant="default" />
      )}
    </span>
  );
}
