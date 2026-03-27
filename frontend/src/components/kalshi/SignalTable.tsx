'use client';

import { useState } from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import type { KalshiMarket } from '@/types';
import SearchInput from '@/components/ui/SearchInput';
import LoadingRows from '@/components/ui/LoadingRows';
import Empty from '@/components/ui/Empty';
import { cn } from '@/lib/utils';

type SortKey = 'yes_price' | 'volume_24h' | 'price_change_24h';

function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
  return dir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />;
}

function ProbBar({ prob, change }: { prob: number; change: number }) {
  const pct = Math.round(prob * 100);
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn('font-mono text-xs font-semibold w-8', textColor)}>{pct}¢</span>
      {change !== 0 && (
        <span className={cn('font-mono text-xs', change > 0 ? 'text-emerald-400' : 'text-red-400')}>
          {change > 0 ? '+' : ''}{(change * 100).toFixed(0)}
        </span>
      )}
    </div>
  );
}

function formatVol(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function SourceBadge({ source }: { source: string }) {
  if (source === 'demo') return (
    <span className="px-1.5 py-0.5 text-xs rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">DEMO</span>
  );
  return (
    <span className="px-1.5 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">LIVE</span>
  );
}

interface Props { markets: KalshiMarket[]; loading?: boolean }

export default function KalshiSignalTable({ markets, loading }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('volume_24h');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const categories = [...new Set(markets.map(m => m.category))].sort();

  const handleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortKey(k); setSortDir('desc'); }
  };

  const filtered = markets
    .filter(m => !category || m.category === category)
    .filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()) || m.ticker.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortDir === 'desc' ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]);

  const Th = ({ label, sk }: { label: string; sk?: SortKey }) => (
    <th onClick={sk ? () => handleSort(sk) : undefined}
      className={cn('px-3 py-2 text-xs font-medium text-zinc-500', sk && 'cursor-pointer hover:text-zinc-300 select-none')}>
      <span className="inline-flex items-center gap-1">
        {label}{sk && <SortIcon active={sortKey === sk} dir={sortDir} />}
      </span>
    </th>
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search markets…" />
        <div className="flex flex-wrap gap-1">
          {[null, ...categories].map(c => (
            <button key={c ?? 'all'} onClick={() => setCategory(c)}
              className={cn('px-2 py-1 text-xs rounded-full border transition-colors',
                category === c ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500')}>
              {c ?? 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 border-b border-zinc-800">
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-left">Market</th>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-left">Category</th>
              <Th label="Yes Price" sk="yes_price" />
              <Th label="Vol 24H" sk="volume_24h" />
              <Th label="24H Δ" sk="price_change_24h" />
              <th className="px-3 py-2 text-xs font-medium text-zinc-500">Closes</th>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500">Source</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRows cols={7} rows={8} /> : filtered.length === 0 ? (
              <tr><td colSpan={7}><Empty /></td></tr>
            ) : filtered.map(m => (
              <tr key={m.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors group">
                <td className="px-3 py-2.5 max-w-[340px]">
                  <div className="text-zinc-200 text-xs font-medium leading-snug line-clamp-2">{m.title}</div>
                  {m.subtitle && <div className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{m.subtitle}</div>}
                  <div className="font-mono text-xs text-zinc-600 mt-0.5">{m.ticker}</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="px-1.5 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400">{m.category}</span>
                </td>
                <td className="px-3 py-2.5">
                  <ProbBar prob={m.yes_price} change={m.price_change_24h} />
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-xs text-zinc-300">{formatVol(m.volume_24h)}</td>
                <td className={cn('px-3 py-2.5 text-right font-mono text-xs',
                  m.price_change_24h > 0 ? 'text-emerald-400' : m.price_change_24h < 0 ? 'text-red-400' : 'text-zinc-500')}>
                  {m.price_change_24h > 0 ? '+' : ''}{(m.price_change_24h * 100).toFixed(0)}¢
                </td>
                <td className="px-3 py-2.5 text-xs text-zinc-500">
                  {m.close_time ? new Date(m.close_time).toLocaleDateString() : '—'}
                </td>
                <td className="px-3 py-2.5"><SourceBadge source={m.source} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-zinc-600 italic">
        Kalshi signals are contextual research inputs only — not financial advice. Demo and live environments are separate.
      </p>
    </div>
  );
}
