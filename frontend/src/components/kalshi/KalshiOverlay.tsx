'use client';

import { useApi } from '@/hooks/useApi';
import { kalshiApi } from '@/lib/api';
import type { KalshiMarket } from '@/types';
import { cn } from '@/lib/utils';

function badge(market: KalshiMarket): { label: string; color: string } {
  const pct = market.yes_price;
  const ch  = market.price_change_24h;

  if (ch > 0.05) return { label: 'Prediction market odds rising', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' };
  if (ch < -0.05) return { label: 'Event odds falling', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5' };
  if (pct > 0.7) return { label: 'High-probability event', color: 'text-red-400 border-red-500/30 bg-red-500/5' };
  if (pct < 0.3) return { label: 'Low-probability event', color: 'text-zinc-400 border-zinc-700 bg-zinc-800/30' };
  return { label: 'Event uncertainty elevated', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' };
}

interface Props { symbols: string[] }

export default function KalshiOverlay({ symbols }: Props) {
  const { data: markets, loading } = useApi(
    () => kalshiApi.overlays(symbols),
    [symbols.join(',')]
  );

  if (loading) return (
    <div className="space-y-1.5">
      {[1, 2].map(i => <div key={i} className="h-8 bg-zinc-800/50 rounded animate-pulse" />)}
    </div>
  );

  if (!markets || markets.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Kalshi Context</div>
      {markets.map(m => {
        const { label, color } = badge(m);
        const pct = Math.round(m.yes_price * 100);
        return (
          <div key={m.id} className={cn('flex items-start gap-2 px-2.5 py-2 rounded-md border text-xs', color)}>
            <div className="flex-1 min-w-0">
              <div className="font-medium leading-snug line-clamp-2">{m.title}</div>
              <div className="text-zinc-500 mt-0.5">{label}</div>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-mono font-semibold">{pct}¢</div>
              {m.price_change_24h !== 0 && (
                <div className={cn('font-mono text-xs', m.price_change_24h > 0 ? 'text-amber-400' : 'text-emerald-400')}>
                  {m.price_change_24h > 0 ? '↑' : '↓'}{Math.abs(m.price_change_24h * 100).toFixed(0)}¢
                </div>
              )}
            </div>
          </div>
        );
      })}
      <p className="text-xs text-zinc-600 italic pt-0.5">Contextual signal only — not a prediction.</p>
    </div>
  );
}
