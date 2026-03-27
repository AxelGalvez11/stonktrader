'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { paperTradesApi } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import TradeTable from '@/components/paper-trades/TradeTable';
import NewTradeModal from '@/components/paper-trades/NewTradeModal';
import CloseTradeModal from '@/components/paper-trades/CloseTradeModal';
import StatCard from '@/components/ui/StatCard';
import type { PaperTrade, PaperTradeCreate } from '@/types';
import { formatPct } from '@/lib/utils';

export default function PaperTradesPage() {
  const { data: trades, loading, refetch } = useApi(() => paperTradesApi.list(), []);
  const [showNew, setShowNew] = useState(false);
  const [closing, setClosing] = useState<PaperTrade | null>(null);

  const handleAdd = async (t: PaperTradeCreate) => {
    await paperTradesApi.create(t);
    refetch();
  };

  const handleClose = async (id: number, exitPrice: number) => {
    await paperTradesApi.close(id, exitPrice);
    refetch();
  };

  const handleDelete = async (id: number) => {
    await paperTradesApi.delete(id);
    refetch();
  };

  const openTrades = (trades ?? []).filter(t => t.status === 'open');
  const closedTrades = (trades ?? []).filter(t => t.status === 'closed');
  const wins = closedTrades.filter(t => (t.pnl_pct ?? 0) > 0).length;
  const winRate = closedTrades.length > 0 ? wins / closedTrades.length : 0;
  const avgPnl = closedTrades.length > 0
    ? closedTrades.reduce((sum, t) => sum + (t.pnl_pct ?? 0), 0) / closedTrades.length
    : 0;

  return (
    <div>
      <TopBar
        title="Paper Trades"
        subtitle={`${openTrades.length} open · ${closedTrades.length} closed`}
        action={
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Trade
          </button>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Open Trades" value={openTrades.length} loading={loading} />
          <StatCard label="Win Rate" value={closedTrades.length > 0 ? `${(winRate * 100).toFixed(0)}%` : '—'} loading={loading} />
          <StatCard label="Avg P&L" value={closedTrades.length > 0 ? formatPct(avgPnl) : '—'} loading={loading} delta={avgPnl} />
        </div>
        <TradeTable
          trades={trades ?? []}
          loading={loading}
          onClose={id => { const t = (trades ?? []).find(x => x.id === id); if (t) setClosing(t); }}
          onDelete={handleDelete}
        />
      </div>
      {showNew && <NewTradeModal onClose={() => setShowNew(false)} onAdd={handleAdd} />}
      {closing && <CloseTradeModal trade={closing} onClose={() => setClosing(null)} onConfirm={handleClose} />}
    </div>
  );
}
