'use client';

import { useApi } from '@/hooks/useApi';
import { diagnosticsApi } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import DiagnosticsPanel from '@/components/diagnostics/DiagnosticsPanel';

export default function DiagnosticsPage() {
  const stocks = useApi(() => diagnosticsApi.stocks(), []);
  const coins = useApi(() => diagnosticsApi.memecoins(), []);

  return (
    <div>
      <TopBar title="Diagnostics" subtitle="Scoring model analysis" />
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-zinc-300 mb-4">Stocks</div>
            <DiagnosticsPanel data={stocks.data ?? null} loading={stocks.loading} label="Stocks" />
          </div>
          <div>
            <div className="text-sm font-medium text-zinc-300 mb-4">Meme Coins</div>
            <DiagnosticsPanel data={coins.data ?? null} loading={coins.loading} label="Meme Coins" />
          </div>
        </div>
      </div>
    </div>
  );
}
