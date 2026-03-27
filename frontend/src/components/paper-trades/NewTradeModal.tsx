'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import type { PaperTradeCreate } from '@/types';

interface Props { onClose: () => void; onAdd: (t: PaperTradeCreate) => Promise<void> }

export default function NewTradeModal({ onClose, onAdd }: Props) {
  const [symbol, setSymbol] = useState('');
  const [assetType, setAssetType] = useState<'stock' | 'memecoin'>('stock');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [entryPrice, setEntryPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) { setError('Symbol is required'); return; }
    const price = parseFloat(entryPrice);
    const qty = parseFloat(quantity);
    if (isNaN(price) || price <= 0) { setError('Enter a valid entry price'); return; }
    if (isNaN(qty) || qty <= 0) { setError('Enter a valid quantity'); return; }
    setLoading(true); setError('');
    try {
      await onAdd({
        symbol: symbol.trim().toUpperCase(),
        asset_type: assetType,
        direction,
        entry_price: price,
        quantity: qty,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trade');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500';

  return (
    <Modal title="New Paper Trade" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Symbol *</label>
            <input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="NVDA" className={`${inputCls} font-mono uppercase`} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Type</label>
            <select value={assetType} onChange={e => setAssetType(e.target.value as 'stock' | 'memecoin')} className={inputCls}>
              <option value="stock">Stock</option>
              <option value="memecoin">Meme Coin</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Direction</label>
            <select value={direction} onChange={e => setDirection(e.target.value as 'long' | 'short')} className={inputCls}>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Entry Price *</label>
            <input type="number" step="any" min="0" value={entryPrice} onChange={e => setEntryPrice(e.target.value)}
              placeholder="0.00" className={`${inputCls} font-mono`} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Quantity</label>
            <input type="number" step="any" min="0" value={quantity} onChange={e => setQuantity(e.target.value)}
              placeholder="1" className={`${inputCls} font-mono`} />
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="Why are you taking this trade?"
            className={`${inputCls} resize-none`} />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-3 py-1.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors">
            {loading ? 'Adding…' : 'Open Trade'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
