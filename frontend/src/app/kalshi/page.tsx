'use client';

import { useApi } from '@/hooks/useApi';
import { kalshiApi } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import KalshiSignalTable from '@/components/kalshi/SignalTable';

export default function KalshiPage() {
  const { data, loading } = useApi(() => kalshiApi.signals(), []);

  return (
    <div>
      <TopBar
        title="Kalshi"
        subtitle="Prediction market signals"
        meta={data?.meta}
      />
      <div className="p-6">
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-500 leading-relaxed">
          <span className="text-zinc-400 font-medium">About Kalshi signals — </span>
          Markets show event probabilities as cents (0–100¢ = 0–100%). These are prediction market prices,
          not forecasts. Use as contextual signals alongside your own research.
          Demo data is shown by default — configure a Kalshi API key in Settings to use live markets.
        </div>
        <KalshiSignalTable markets={data?.data ?? []} loading={loading} />
      </div>
    </div>
  );
}
