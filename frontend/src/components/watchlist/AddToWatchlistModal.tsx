'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import type { WatchlistItemCreate } from '@/types';

interface Props { onClose: () => void; onAdd: (item: WatchlistItemCreate) => Promise<void> }

export default function AddToWatchlistModal({ onClose, onAdd }: Props) {
  const [symbol, setSymbol] = useState('');
  const [assetType, setAssetType] = useState<'stock' | 'memecoin'>('stock');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) { setError('Symbol is required'); return; }
    setLoading(true); setError('');
    try {
      await onAdd({
        symbol: symbol.trim().toUpperCase(),
        asset_type: assetType,
        notes: notes.trim() || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Add to Watchlist" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Symbol *</label>
            <input value={symbol} onChange={e => setSymbol(e.target.value)} placeholder="NVDA"
              className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono uppercase" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Type</label>
            <select value={assetType} onChange={e => setAssetType(e.target.value as 'stock' | 'memecoin')}
              className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 focus:outline-none focus:border-zinc-500">
              <option value="stock">Stock</option>
              <option value="memecoin">Meme Coin</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Why are you watching this?"
            className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 resize-none" />
        </div>

        <div>
          <label className="block text-xs text-zinc-400 mb-1">Tags (comma-separated)</label>
          <input value={tags} onChange={e => setTags(e.target.value)} placeholder="momentum, earnings, high-risk"
            className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500" />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-md bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {loading ? 'Adding…' : 'Add to Watchlist'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
