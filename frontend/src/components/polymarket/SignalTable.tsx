'use client';

import { useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import type { PolymarketSignal } from '@/types';
import SearchInput from '@/components/ui/SearchInput';
import LoadingRows from '@/components/ui/LoadingRows';
import Empty from '@/components/ui/Empty';
import { cn } from '@/lib/utils';

type SortKey = 'probability' | 'volume_24h' | 'liquidity';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  return dir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />;
}

function ProbBar({ prob }: { prob: number }) {
  const pct = Math.round(prob * 100);
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn('font-mono text-xs', pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400')}>
        {pct}%
      </span>
    </div>
  );
}

function formatVol(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

interface Props { signals: PolymarketSignal[]; loading?: boolean }

export default function SignalTable({ signals, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('volume_24h');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const categories = [...new Set(signals.map(s => s.category))].sort();

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  const filtered = signals
    .filter(s => !category || s.category === category)
    .filter(s => !search || s.question.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === 'desc' ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search questions…" />
        <div className="flex flex-wrap gap-1">
          {[null, ...categories].map(c => (
            <button key={c ?? 'all'} onClick={() => setCategory(c)}
              className={cn('px-2 py-1 text-xs rounded-full border transition-colors',
                category === c ? 'bg-violet-600 border-violet-600 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500')}>
              {c ?? 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 border-b border-zinc-800">
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-left">Question</th>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500">Category</th>
              <th onClick={() => handleSort('probability')}
                className="px-3 py-2 text-xs font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 select-none">
                <span className="inline-flex items-center gap-1">Prob <SortIcon active={sortKey === 'probability'} dir={sortDir} /></span>
              </th>
              <th onClick={() => handleSort('volume_24h')}
                className="px-3 py-2 text-xs font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 select-none text-right">
                <span className="inline-flex items-center gap-1 justify-end">Vol 24H <SortIcon active={sortKey === 'volume_24h'} dir={sortDir} /></span>
              </th>
              <th onClick={() => handleSort('liquidity')}
                className="px-3 py-2 text-xs font-medium text-zinc-500 cursor-pointer hover:text-zinc-300 select-none text-right">
                <span className="inline-flex items-center gap-1 justify-end">Liquidity <SortIcon active={sortKey === 'liquidity'} dir={sortDir} /></span>
              </th>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500">Closes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRows cols={6} rows={8} /> : filtered.length === 0 ? (
              <tr><td colSpan={6}><Empty /></td></tr>
            ) : filtered.map(s => (
              <tr key={s.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                <td className="px-3 py-2.5 max-w-[340px]">
                  <div className="text-zinc-200 text-xs leading-snug line-clamp-2">{s.question}</div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className="px-1.5 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400">{s.category}</span>
                </td>
                <td className="px-3 py-2.5"><ProbBar prob={s.probability} /></td>
                <td className="px-3 py-2.5 text-right font-mono text-xs text-zinc-300">{formatVol(s.volume_24h)}</td>
                <td className="px-3 py-2.5 text-right font-mono text-xs text-zinc-300">{formatVol(s.liquidity)}</td>
                <td className="px-3 py-2.5 text-xs text-zinc-500">{s.closes_at ? new Date(s.closes_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
