'use client';

import type { StockRanking } from '@/types';
import Modal from '@/components/ui/Modal';
import ScoreBar from '@/components/ui/ScoreBar';
import { ScoreBadge } from '@/components/ui/Badge';
import ConfidenceDot from '@/components/ui/ConfidenceDot';
import ReasonTags from '@/components/ui/ReasonTags';
import WarningPills from '@/components/ui/WarningPills';
import { formatPct, formatNumber, formatMarketCap, pctColor, probLabel, cn } from '@/lib/utils';

interface Props { stock: StockRanking; onClose: () => void; onWatchlist?: (s: string, t: 'stock') => void }

const FACTOR_LABELS: Record<string, string> = {
  mom_5d: '5D Momentum', mom_20d: '20D Momentum', mom_60d: '60D Momentum',
  rel_volume: 'Relative Volume', volatility: 'Low Volatility',
  ma_distance: 'MA Distance (50D)', sentiment: 'Sentiment', sector_rs: 'Sector RS',
};

export default function StockDetailModal({ stock: s, onClose, onWatchlist }: Props) {
  return (
    <Modal title={`${s.symbol} — ${s.name}`} onClose={onClose} size="lg">
      {/* Header row */}
      <div className="flex items-start gap-6 mb-6">
        <div>
          <div className="text-2xl font-mono font-semibold text-zinc-100">${formatNumber(s.price)}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{s.sector} · {formatMarketCap(s.market_cap)}</div>
        </div>
        <div className="flex gap-3 ml-auto items-center flex-wrap">
          {[['5D', s.return_5d], ['20D', s.return_20d], ['60D', s.return_60d]].map(([label, val]) => (
            <div key={label as string} className="text-center">
              <div className={cn('font-mono text-sm font-semibold', pctColor(val as number))}>{formatPct(val as number)}</div>
              <div className="text-xs text-zinc-500">{label}</div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <ScoreBar score={s.composite_score} className="w-20" showLabel />
            <ScoreBadge score={s.composite_score} />
          </div>
          <ConfidenceDot confidence={s.confidence} showLabel />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Factor breakdown */}
        <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800">
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Factor Breakdown</div>
          <div className="space-y-2">
            {Object.entries(s.factors).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 w-28 shrink-0">{FACTOR_LABELS[key] ?? key}</span>
                <ScoreBar score={val * 100} className="flex-1" />
                <span className="text-xs font-mono text-zinc-500 w-8 text-right">{(val * 100).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Probabilities + signals */}
        <div className="space-y-3">
          <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Estimates</div>
            <div className="space-y-2">
              {[
                ['Positive return (5D)', s.prob_positive_5d],
                ['Outperform SPY (5D)', s.prob_beat_spy],
              ].map(([label, p]) => (
                <div key={label as string} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{label}</span>
                  <span className="font-mono text-sm text-zinc-200">
                    {((p as number) * 100).toFixed(0)}%
                    <span className="text-xs text-zinc-500 ml-1">({probLabel(p as number)})</span>
                  </span>
                </div>
              ))}
              {s.days_to_earnings !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Days to earnings</span>
                  <span className={cn('font-mono text-sm', s.days_to_earnings <= 7 ? 'text-amber-400' : 'text-zinc-300')}>
                    {s.days_to_earnings}d
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Reason Codes</div>
            <ReasonTags codes={s.reason_codes} max={10} />
          </div>

          {s.warnings.length > 0 && (
            <div className="bg-zinc-950/60 rounded-lg p-4 border border-amber-500/20">
              <div className="text-xs text-amber-500 uppercase tracking-wide mb-2">Warnings</div>
              <WarningPills warnings={s.warnings} />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => { onWatchlist?.(s.symbol, 'stock'); onClose(); }}
          className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors">
          {s.in_watchlist ? 'Remove from Watchlist' : '+ Watchlist'}
        </button>
        <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors">
          Close
        </button>
      </div>
    </Modal>
  );
}
