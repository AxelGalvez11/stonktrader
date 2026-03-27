'use client';

import type { MemeCoinRanking } from '@/types';
import Modal from '@/components/ui/Modal';
import ScoreBar from '@/components/ui/ScoreBar';
import { ScoreBadge, RiskBadge } from '@/components/ui/Badge';
import ConfidenceDot from '@/components/ui/ConfidenceDot';
import ReasonTags from '@/components/ui/ReasonTags';
import WarningPills from '@/components/ui/WarningPills';
import { formatPct, formatNumber, formatMarketCap, pctColor, cn } from '@/lib/utils';

interface Props { coin: MemeCoinRanking; onClose: () => void; onWatchlist?: (s: string, t: 'memecoin') => void }

const FACTOR_LABELS: Record<string, string> = {
  attention_velocity: 'Attention Velocity',
  sentiment: 'Sentiment',
  mom_24h: '24H Momentum',
  mom_1h: '1H Momentum',
  volume_growth: 'Volume Growth',
  liquidity: 'Liquidity',
  rug_safety: 'Rug Safety',
};

export default function MemeCoinDetailModal({ coin: c, onClose, onWatchlist }: Props) {
  return (
    <Modal title={`${c.symbol} — ${c.name}`} onClose={onClose} size="lg">
      <div className="flex items-start gap-6 mb-6">
        <div>
          <div className="text-2xl font-mono font-semibold text-zinc-100">${formatNumber(c.price)}</div>
          <div className="text-xs text-zinc-500 mt-0.5">{formatMarketCap(c.market_cap)} mkt cap</div>
        </div>
        <div className="flex gap-3 ml-auto items-center flex-wrap">
          {[['1H', c.return_1h], ['24H', c.return_24h]].map(([label, val]) => (
            <div key={label as string} className="text-center">
              <div className={cn('font-mono text-sm font-semibold', pctColor(val as number))}>{formatPct(val as number)}</div>
              <div className="text-xs text-zinc-500">{label}</div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <ScoreBar score={c.composite_score} className="w-20" showLabel />
            <ScoreBadge score={c.composite_score} />
          </div>
          <ConfidenceDot confidence={c.confidence} showLabel />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800">
          <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Factor Breakdown</div>
          <div className="space-y-2">
            {Object.entries(c.factors).map(([key, val]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 w-32 shrink-0">{FACTOR_LABELS[key] ?? key}</span>
                <ScoreBar score={val * 100} className="flex-1" />
                <span className="text-xs font-mono text-zinc-500 w-8 text-right">{(val * 100).toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-3">Sub-Scores</div>
            <div className="space-y-2">
              {[
                ['Opportunity', c.opportunity_score],
                ['Risk', c.risk_score],
              ].map(([label, val]) => (
                <div key={label as string} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{label}</span>
                  <div className="flex items-center gap-2">
                    <ScoreBar score={val as number} className="w-16" />
                    {label === 'Risk' ? <RiskBadge score={val as number} /> : <ScoreBadge score={val as number} />}
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
                <span className="text-xs text-zinc-400">Volume 24H</span>
                <span className="font-mono text-xs text-zinc-300">{formatMarketCap(c.volume_24h)}</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800">
            <div className="text-xs text-zinc-500 uppercase tracking-wide mb-2">Reason Codes</div>
            <ReasonTags codes={c.reason_codes} max={10} />
          </div>

          {c.warnings.length > 0 && (
            <div className="bg-zinc-950/60 rounded-lg p-4 border border-amber-500/20">
              <div className="text-xs text-amber-500 uppercase tracking-wide mb-2">Warnings</div>
              <WarningPills warnings={c.warnings} />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button onClick={() => { onWatchlist?.(c.symbol, 'memecoin'); onClose(); }}
          className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors">
          {c.in_watchlist ? 'Remove from Watchlist' : '+ Watchlist'}
        </button>
        <button onClick={onClose} className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors">
          Close
        </button>
      </div>
    </Modal>
  );
}
