'use client';

import { Trash2, ExternalLink } from 'lucide-react';
import type { WatchlistItem } from '@/types';
import { TagBadge } from '@/components/ui/Badge';
import Empty from '@/components/ui/Empty';
import LoadingRows from '@/components/ui/LoadingRows';
import { cn, relativeTime } from '@/lib/utils';

interface Props {
  items: WatchlistItem[];
  loading?: boolean;
  onRemove: (id: number) => void;
}

export default function WatchlistTable({ items, loading, onRemove }: Props) {
  if (loading) return <table className="w-full text-sm"><tbody><LoadingRows cols={5} rows={6} /></tbody></table>;
  if (items.length === 0) return <Empty message="Your watchlist is empty. Add stocks or meme coins to track them." />;

  const stocks = items.filter(i => i.asset_type === 'stock');
  const coins = items.filter(i => i.asset_type === 'memecoin');

  return (
    <div className="space-y-6">
      {[{ label: 'Stocks', rows: stocks }, { label: 'Meme Coins', rows: coins }].map(({ label, rows }) =>
        rows.length === 0 ? null : (
          <div key={label}>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">{label}</div>
            <div className="rounded-lg border border-zinc-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-zinc-900/60 border-b border-zinc-800">
                  <tr>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-left">Symbol</th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-left">Notes</th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-left">Tags</th>
                    <th className="px-3 py-2 text-xs font-medium text-zinc-500">Added</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map(item => (
                    <tr key={item.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="font-mono font-semibold text-zinc-100">{item.symbol}</div>
                        <div className={cn('text-xs mt-0.5', item.asset_type === 'memecoin' ? 'text-violet-400' : 'text-blue-400')}>
                          {item.asset_type}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 max-w-[200px]">
                        <span className="text-xs text-zinc-400 line-clamp-2">{item.notes || '—'}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map(t => <TagBadge key={t} label={t} />)}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs text-zinc-500">{relativeTime(item.added_at)}</td>
                      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                        <button onClick={() => onRemove(item.id)}
                          className="p-1 rounded text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
