'use client';

import { useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp, Plus, Check } from 'lucide-react';
import type { MemeCoinRanking } from '@/types';
import { ScoreBadge, RiskBadge } from '@/components/ui/Badge';
import ScoreBar from '@/components/ui/ScoreBar';
import ConfidenceDot from '@/components/ui/ConfidenceDot';
import ReasonTags from '@/components/ui/ReasonTags';
import WarningPills from '@/components/ui/WarningPills';
import SearchInput from '@/components/ui/SearchInput';
import LoadingRows from '@/components/ui/LoadingRows';
import Empty from '@/components/ui/Empty';
import { cn, formatPct, formatNumber, formatMarketCap, pctColor } from '@/lib/utils';
import MemeCoinDetailModal from './MemeCoinDetailModal';

type SortKey = 'composite_score'|'return_24h'|'return_1h'|'opportunity_score'|'risk_score'|'confidence';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc'|'desc' }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  return dir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />;
}

interface Props { coins: MemeCoinRanking[]; loading?: boolean; onWatchlist?: (s: string, t: 'memecoin') => void }

export default function MemeCoinTable({ coins, loading, onWatchlist }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('composite_score');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<MemeCoinRanking|null>(null);

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  const filtered = coins
    .filter(c => !search || c.symbol.includes(search.toUpperCase()) || c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === 'desc' ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]);

  return (
    <div className="space-y-3">
      <SearchInput value={search} onChange={setSearch} placeholder="Symbol or name…" />
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 border-b border-zinc-800">
            <tr>
              {[['#',''], ['Symbol',''], ['Price',''], ['1H','return_1h'], ['24H','return_24h'],
                ['Opportunity','opportunity_score'], ['Risk','risk_score'], ['Score','composite_score'],
                ['Signals',''], ['Conf','confidence'], ['','']]
                .map(([label, key]) => (
                  <th key={label} onClick={key ? () => handleSort(key as SortKey) : undefined}
                    className={cn('px-3 py-2 text-xs font-medium text-zinc-500', key && 'cursor-pointer hover:text-zinc-300 select-none')}>
                    <span className="inline-flex items-center gap-1">
                      {label}{key && <SortIcon active={sortKey === key} dir={sortDir} />}
                    </span>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRows cols={11} rows={8} /> : filtered.length === 0 ? (
              <tr><td colSpan={11}><Empty /></td></tr>
            ) : filtered.map((c, i) => (
              <tr key={c.symbol} onClick={() => setSelected(c)}
                className="border-b border-zinc-800/40 hover:bg-zinc-800/30 cursor-pointer transition-colors">
                <td className="px-3 py-2.5 text-xs text-zinc-500">{i + 1}</td>
                <td className="px-3 py-2.5">
                  <div className="font-mono font-semibold text-zinc-100">{c.symbol}</div>
                  <div className="text-xs text-zinc-500 truncate max-w-[90px]">{c.name}</div>
                </td>
                <td className="px-3 py-2.5 font-mono text-zinc-300 text-xs">${formatNumber(c.price)}</td>
                <td className={cn('px-3 py-2.5 font-mono text-xs', pctColor(c.return_1h))}>{formatPct(c.return_1h)}</td>
                <td className={cn('px-3 py-2.5 font-mono text-xs', pctColor(c.return_24h))}>{formatPct(c.return_24h)}</td>
                <td className="px-3 py-2.5"><ScoreBadge score={c.opportunity_score} /></td>
                <td className="px-3 py-2.5"><RiskBadge score={c.risk_score} /></td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <ScoreBar score={c.composite_score} className="w-12" />
                    <ScoreBadge score={c.composite_score} />
                  </div>
                </td>
                <td className="px-3 py-2.5 max-w-[160px]">
                  <div className="flex flex-wrap gap-1">
                    <ReasonTags codes={c.reason_codes} max={2} />
                    <WarningPills warnings={c.warnings} />
                  </div>
                </td>
                <td className="px-3 py-2.5"><ConfidenceDot confidence={c.confidence} showLabel /></td>
                <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onWatchlist?.(c.symbol, 'memecoin')}
                    className={cn('p-1 rounded transition-colors', c.in_watchlist ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-300')}>
                    {c.in_watchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <MemeCoinDetailModal coin={selected} onClose={() => setSelected(null)} onWatchlist={onWatchlist} />}
    </div>
  );
}
