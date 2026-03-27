'use client';

import { useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { memecoinsApi, watchlistApi } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import MemeCoinTable from '@/components/memecoins/MemeCoinTable';

export default function MemeCoinsPage() {
  const { data, loading, refetch } = useApi(() => memecoinsApi.getRankings(), []);

  const handleWatchlist = useCallback(async (symbol: string, type: 'memecoin') => {
    const items = await watchlistApi.list();
    const existing = items.find(i => i.symbol === symbol && i.asset_type === type);
    if (existing) {
      await watchlistApi.remove(existing.id);
    } else {
      await watchlistApi.add({ symbol, asset_type: type, tags: [] });
    }
    refetch();
  }, [refetch]);

  return (
    <div>
      <TopBar title="Meme Coins" subtitle={`${data?.items.length ?? 0} ranked`} meta={data?.meta} />
      <div className="p-6">
        <MemeCoinTable coins={data?.items ?? []} loading={loading} onWatchlist={handleWatchlist} />
      </div>
    </div>
  );
}
