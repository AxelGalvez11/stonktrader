'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import type { PaperTrade } from '@/types';
import { formatNumber } from '@/lib/utils';

interface Props { trade: PaperTrade; onClose: () => void; onConfirm: (id: number, exitPrice: number) => Promise<void> }

export default function CloseTradeModal({ trade, onClose, onConfirm }: Props) {
  const [exitPrice, setExitPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(exitPrice);
    if (isNaN(price) || price <= 0) { setError('Enter a valid exit price'); return; }
    setLoading(true); setError('');
    try {
      await onConfirm(trade.id, price);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to close trade');
    } finally {
      setLoading(false);
    }
  };

  const preview = exitPrice ? (() => {
    const exit = parseFloat(exitPrice);
    if (isNaN(exit)) return null;
    const pnl = trade.direction === 'long'
      ? (exit - trade.entry_price) / trade.entry_price
      : (trade.entry_price - exit) / trade.entry_price;
    return pnl;
  })() : null;

  return (
    <Modal title={`Close ${trade.symbol} Trade`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-zinc-800/50 rounded-lg p-3 text-sm space-y-1">
          <div className="flex justify-between"><span className="text-zinc-400">Direction</span><span className={trade.direction === 'long' ? 'text-emerald-400' : 'text-red-400'}>{trade.direction.toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-zinc-400">Entry</span><span className="font-mono text-zinc-200">${formatNumber(trade.entry_price)}</span></div>
          <div className="flex justify-between"><span className="text-zinc-400">Quantity</span><span className="font-mono text-zinc-200">{trade.quantity}</span></div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Exit Price *</label>
          <input type="number" step="any" min="0" value={exitPrice} onChange={e => setExitPrice(e.target.value)}
            placeholder="0.00" autoFocus
            className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono" />
        </div>

        {preview !== null && (
          <div className={`text-sm font-mono text-center py-2 rounded ${preview >= 0 ? 'bg-emerald-950/50 text-emerald-400' : 'bg-red-950/50 text-red-400'}`}>
            Est. P&L: {preview >= 0 ? '+' : ''}{(preview * 100).toFixed(2)}%
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {loading ? 'Closing…' : 'Close Trade'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
