'use client';

import { useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp, Plus, Check } from 'lucide-react';
import type { StockRanking } from '@/types';
import { ScoreBadge } from '@/components/ui/Badge';
import ScoreBar from '@/components/ui/ScoreBar';
import ConfidenceDot from '@/components/ui/ConfidenceDot';
import ReasonTags from '@/components/ui/ReasonTags';
import WarningPills from '@/components/ui/WarningPills';
import SearchInput from '@/components/ui/SearchInput';
import LoadingRows from '@/components/ui/LoadingRows';
import Empty from '@/components/ui/Empty';
import { cn, formatPct, formatNumber, pctColor } from '@/lib/utils';
import StockDetailModal from './StockDetailModal';

const SORTS = ['composite_score','return_5d','return_20d','return_60d','confidence'] as const;
type SortKey = typeof SORTS[number];

interface Props {
  stocks: StockRanking[];
  loading?: boolean;
  onWatchlist?: (symbol: string, type: 'stock') => void;
}

function SortIcon({ active, dir }: { active: boolean; dir: 'asc'|'desc' }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  return dir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />;
}

export default function StockTable({ stocks, loading, onWatchlist }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('composite_score');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState<string|null>(null);
  const [selected, setSelected] = useState<StockRanking|null>(null);

  const sectors = [...new Set(stocks.map(s => s.sector))].sort();

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = stocks
    .filter(s => !sector || s.sector === sector)
    .filter(s => !search || s.symbol.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === 'desc' ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]);

  const Th = ({ label, sortable, field }: { label: string; sortable?: SortKey; field?: string }) => (
    <th
      className={cn('px-3 py-2 text-left text-xs font-medium text-zinc-500', sortable && 'cursor-pointer hover:text-zinc-300 select-none')}
      onClick={sortable ? () => handleSort(sortable) : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortable && <SortIcon active={sortKey === sortable} dir={sortDir} />}
      </span>
    </th>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Symbol or name…" />
        <div className="flex flex-wrap gap-1">
          {[null, ...sectors].map(s => (
            <button key={s ?? 'all'} onClick={() => setSector(s)}
              className={cn('px-2 py-1 text-xs rounded-full border transition-colors',
                sector === s ? 'bg-blue-600 border-blue-600 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500')}>
              {s ?? 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 border-b border-zinc-800">
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500 w-8">#</th>
              <Th label="Symbol" />
              <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-right">Price</th>
              <Th label="5D" sortable="return_5d" />
              <Th label="20D" sortable="return_20d" />
              <Th label="Score" sortable="composite_score" />
              <Th label="Signals" />
              <Th label="Conf" sortable="confidence" />
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRows cols={9} rows={8} /> : filtered.length === 0 ? (
              <tr><td colSpan={9}><Empty /></td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.symbol} onClick={() => setSelected(s)}
                className="border-b border-zinc-800/40 hover:bg-zinc-800/30 cursor-pointer transition-colors">
                <td className="px-3 py-2.5 text-xs text-zinc-500">{i + 1}</td>
                <td className="px-3 py-2.5">
                  <div className="font-mono font-semibold text-zinc-100">{s.symbol}</div>
                  <div className="text-xs text-zinc-500 truncate max-w-[110px]">{s.name}</div>
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-zinc-300">${formatNumber(s.price)}</td>
                <td className={cn('px-3 py-2.5 text-right font-mono text-xs', pctColor(s.return_5d))}>{formatPct(s.return_5d)}</td>
                <td className={cn('px-3 py-2.5 text-right font-mono text-xs', pctColor(s.return_20d))}>{formatPct(s.return_20d)}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2 justify-end">
                    <ScoreBar score={s.composite_score} className="w-14" />
                    <ScoreBadge score={s.composite_score} />
                  </div>
                </td>
                <td className="px-3 py-2.5 max-w-[180px]">
                  <div className="flex flex-wrap gap-1">
                    <ReasonTags codes={s.reason_codes} max={2} />
                    <WarningPills warnings={s.warnings} />
                  </div>
                </td>
                <td className="px-3 py-2.5"><ConfidenceDot confidence={s.confidence} showLabel /></td>
                <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                  <button onClick={() => onWatchlist?.(s.symbol, 'stock')}
                    className={cn('p-1 rounded transition-colors', s.in_watchlist ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-300')}>
                    {s.in_watchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <StockDetailModal stock={selected} onClose={() => setSelected(null)} onWatchlist={onWatchlist} />}
    </div>
  );
}
