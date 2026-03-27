'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';
import type { Integration, IntegrationTestResult } from '@/types';
import { cn } from '@/lib/utils';
import IntegrationForm from './IntegrationForm';

interface Props {
  integration: Integration;
  onUpdate: (name: string, apiKey: string, config: Record<string, string>) => Promise<void>;
  onTest: (name: string) => Promise<IntegrationTestResult>;
}

function StatusIcon({ status }: { status: Integration['status'] }) {
  if (status === 'connected') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status === 'error') return <XCircle className="w-4 h-4 text-red-400" />;
  return <AlertCircle className="w-4 h-4 text-zinc-500" />;
}

export default function IntegrationCard({ integration: intg, onUpdate, onTest }: Props) {
  const [editing, setEditing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<IntegrationTestResult | null>(null);

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    try {
      const result = await onTest(intg.name);
      setTestResult(result);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className={cn('bg-zinc-900 rounded-lg border p-4 space-y-3',
      intg.status === 'connected' ? 'border-emerald-800/40' : intg.status === 'error' ? 'border-red-800/40' : 'border-zinc-800')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon status={intg.status} />
          <div>
            <div className="text-sm font-medium text-zinc-100">{intg.display_name}</div>
            <div className="text-xs text-zinc-500">{intg.description}</div>
          </div>
        </div>
        <button onClick={() => setEditing(v => !v)}
          className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {intg.api_key_masked && (
        <div className="text-xs text-zinc-500 font-mono bg-zinc-800/50 px-2 py-1 rounded">
          Key: {intg.api_key_masked}
        </div>
      )}

      {editing && (
        <IntegrationForm
          integration={intg}
          onSave={async (key, cfg) => { await onUpdate(intg.name, key, cfg); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      )}

      <div className="flex items-center gap-2">
        <button onClick={handleTest} disabled={testing}
          className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 transition-colors">
          {testing ? 'Testing…' : 'Test Connection'}
        </button>
        {testResult && (
          <span className={cn('text-xs', testResult.success ? 'text-emerald-400' : 'text-red-400')}>
            {testResult.success ? `✓ ${testResult.message}` : `✗ ${testResult.message}`}
          </span>
        )}
      </div>
    </div>
  );
}
