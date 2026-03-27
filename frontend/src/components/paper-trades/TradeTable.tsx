'use client';

import { Trash2, CheckCircle } from 'lucide-react';
import type { PaperTrade } from '@/types';
import Empty from '@/components/ui/Empty';
import LoadingRows from '@/components/ui/LoadingRows';
import { cn, formatNumber, formatPct, pctColor, relativeTime } from '@/lib/utils';

interface Props {
  trades: PaperTrade[];
  loading?: boolean;
  onClose: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TradeTable({ trades, loading, onClose, onDelete }: Props) {
  const open = trades.filter(t => t.status === 'open');
  const closed = trades.filter(t => t.status === 'closed');

  if (loading) return <table className="w-full text-sm"><tbody><LoadingRows cols={8} rows={6} /></tbody></table>;
  if (trades.length === 0) return <Empty message="No paper trades yet. Add one to start tracking." />;

  const Section = ({ label, rows }: { label: string; rows: PaperTrade[] }) => rows.length === 0 ? null : (
    <div>
      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">{label}</div>
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/60 border-b border-zinc-800">
            <tr>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-left">Symbol</th>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500">Dir</th>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-right">Entry</th>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-right">Exit</th>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-right">Qty</th>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500 text-right">P&L</th>
              <th className="px-3 py-2 text-xs font-medium text-zinc-500">Opened</th>
              <th className="w-16" />
            </tr>
          </thead>
          <tbody>
            {rows.map(t => (
              <tr key={t.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/20 transition-colors">
                <td className="px-3 py-2.5">
                  <div className="font-mono font-semibold text-zinc-100">{t.symbol}</div>
                  <div className="text-xs text-zinc-500">{t.asset_type}</div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className={cn('text-xs font-semibold', t.direction === 'long' ? 'text-emerald-400' : 'text-red-400')}>
                    {t.direction.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-xs text-zinc-300">${formatNumber(t.entry_price)}</td>
                <td className="px-3 py-2.5 text-right font-mono text-xs text-zinc-300">
                  {t.exit_price ? `$${formatNumber(t.exit_price)}` : '—'}
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-xs text-zinc-400">{t.quantity}</td>
                <td className="px-3 py-2.5 text-right">
                  {t.pnl_pct !== null ? (
                    <span className={cn('font-mono text-xs', pctColor(t.pnl_pct ?? 0))}>{formatPct(t.pnl_pct ?? 0)}</span>
                  ) : '—'}
                </td>
                <td className="px-3 py-2.5 text-xs text-zinc-500">{relativeTime(t.opened_at)}</td>
                <td className="px-3 py-2.5 flex gap-1 justify-end">
                  {t.status === 'open' && (
                    <button onClick={() => onClose(t.id)}
                      className="p-1 rounded text-zinc-600 hover:text-emerald-400 transition-colors" title="Close trade">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => onDelete(t.id)}
                    className="p-1 rounded text-zinc-600 hover:text-red-400 transition-colors" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Section label="Open Trades" rows={open} />
      <Section label="Closed Trades" rows={closed} />
    </div>
  );
}
