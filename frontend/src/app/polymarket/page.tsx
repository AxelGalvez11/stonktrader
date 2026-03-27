'use client';

import { useApi } from '@/hooks/useApi';
import { polymarketApi } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import SignalTable from '@/components/polymarket/SignalTable';

export default function PolymarketPage() {
  const { data, loading } = useApi(() => polymarketApi.getSignals(), []);

  return (
    <div>
      <TopBar title="Polymarket" subtitle="Prediction market signals" meta={data?.meta} />
      <div className="p-6">
        <SignalTable signals={data?.items ?? []} loading={loading} />
      </div>
    </div>
  );
}
