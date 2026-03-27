'use client';

import { useApi } from '@/hooks/useApi';
import { stocksApi, memecoinsApi, watchlistApi } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import StatCard from '@/components/ui/StatCard';
import ScoreBar from '@/components/ui/ScoreBar';
import { ScoreBadge, RiskBadge } from '@/components/ui/Badge';
import { cn, formatPct, pctColor } from '@/lib/utils';

export default function OverviewPage() {
  const stocks = useApi(() => stocksApi.getRankings(), []);
  const coins = useApi(() => memecoinsApi.getRankings(), []);
  const watchlist = useApi(() => watchlistApi.list(), []);

  const topStocks = (stocks.data?.items ?? []).slice(0, 5);
  const topCoins = (coins.data?.items ?? []).slice(0, 5);
  const wlCount = watchlist.data?.length ?? 0;
  const stockCount = stocks.data?.items.length ?? 0;
  const coinCount = coins.data?.items.length ?? 0;
  const meta = stocks.data?.meta;

  return (
    <div>
      <TopBar
        title="Market Radar"
        subtitle="Overview"
        meta={meta}
      />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Stocks Ranked" value={stockCount} loading={stocks.loading} />
          <StatCard label="Meme Coins Ranked" value={coinCount} loading={coins.loading} />
          <StatCard label="Watchlist Items" value={wlCount} loading={watchlist.loading} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Top stocks */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Top Stocks</div>
              <a href="/stocks" className="text-xs text-blue-400 hover:text-blue-300">View all →</a>
            </div>
            {stocks.loading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" />)}</div>
            ) : topStocks.map((s, i) => (
              <div key={s.symbol} className="flex items-center gap-3 py-2 border-b border-zinc-800/40 last:border-0">
                <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                <span className="font-mono font-semibold text-zinc-100 w-14">{s.symbol}</span>
                <span className={cn('font-mono text-xs w-14', pctColor(s.return_5d))}>{formatPct(s.return_5d)}</span>
                <ScoreBar score={s.composite_score} className="flex-1" />
                <ScoreBadge score={s.composite_score} />
              </div>
            ))}
          </div>

          {/* Top coins */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Top Meme Coins</div>
              <a href="/memecoins" className="text-xs text-violet-400 hover:text-violet-300">View all →</a>
            </div>
            {coins.loading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" />)}</div>
            ) : topCoins.map((c, i) => (
              <div key={c.symbol} className="flex items-center gap-3 py-2 border-b border-zinc-800/40 last:border-0">
                <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                <span className="font-mono font-semibold text-zinc-100 w-14">{c.symbol}</span>
                <span className={cn('font-mono text-xs w-14', pctColor(c.return_24h))}>{formatPct(c.return_24h)}</span>
                <ScoreBar score={c.composite_score} className="flex-1" />
                <RiskBadge score={c.risk_score} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
