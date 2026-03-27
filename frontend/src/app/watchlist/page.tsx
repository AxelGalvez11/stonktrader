'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { watchlistApi } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import WatchlistTable from '@/components/watchlist/WatchlistTable';
import AddToWatchlistModal from '@/components/watchlist/AddToWatchlistModal';
import type { WatchlistItemCreate } from '@/types';

export default function WatchlistPage() {
  const { data: items, loading, refetch } = useApi(() => watchlistApi.list(), []);
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = async (item: WatchlistItemCreate) => {
    await watchlistApi.add(item);
    refetch();
  };

  const handleRemove = async (id: number) => {
    await watchlistApi.remove(id);
    refetch();
  };

  return (
    <div>
      <TopBar
        title="Watchlist"
        subtitle={`${items?.length ?? 0} items`}
        action={
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-500 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        }
      />
      <div className="p-6">
        <WatchlistTable items={items ?? []} loading={loading} onRemove={handleRemove} />
      </div>
      {showAdd && <AddToWatchlistModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}
