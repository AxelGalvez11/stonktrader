'use client';

import { useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { stocksApi, watchlistApi } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import StockTable from '@/components/stocks/StockTable';

export default function StocksPage() {
  const { data, loading, refetch } = useApi(() => stocksApi.getRankings(), []);

  const handleWatchlist = useCallback(async (symbol: string, type: 'stock') => {
    const items = await watchlistApi.list();
    const existing = items.find(i => i.symbol === symbol && i.asset_type === type);
    if (existing) {
      await watchlistApi.remove(existing.id);
    } else {
      await watchlistApi.add({ symbol, asset_type: type, tags: [] });
    }
    refetch();
  }, [refetch]);

  // Merge watchlist into stocks
  const enriched = (data?.items ?? []).map(s => ({
    ...s,
    in_watchlist: s.in_watchlist,
  }));

  return (
    <div>
      <TopBar title="Stocks" subtitle={`${enriched.length} ranked`} meta={data?.meta} />
      <div className="p-6">
        <StockTable stocks={enriched} loading={loading} onWatchlist={handleWatchlist} />
      </div>
    </div>
  );
}
