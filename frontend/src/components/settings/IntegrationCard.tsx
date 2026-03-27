'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Settings, Clock } from 'lucide-react';
import type { Integration, IntegrationTestResult } from '@/types';
import { cn } from '@/lib/utils';
import IntegrationForm from './IntegrationForm';

interface Props {
  integration: Integration;
  onUpdate: (name: string, apiKey: string, config: Record<string, string>) => Promise<void>;
  onTest: (name: string) => Promise<IntegrationTestResult>;
}

function StatusIcon({ status }: { status: Integration['status'] }) {
  if (status === 'configured') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status === 'error') return <XCircle className="w-4 h-4 text-red-400" />;
  return <AlertCircle className="w-4 h-4 text-zinc-600" />;
}

function formatTestedAt(ts: string | null): string | null {
  if (!ts) return null;
  const d = new Date(ts);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  const borderColor = intg.deferred
    ? 'border-zinc-800/50'
    : intg.status === 'configured'
      ? 'border-emerald-800/40'
      : intg.status === 'error'
        ? 'border-red-800/40'
        : 'border-zinc-800';

  return (
    <div className={cn('bg-zinc-900 rounded-lg border p-4 space-y-3', borderColor, intg.deferred && 'opacity-60')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <div className="mt-0.5 shrink-0">
            <StatusIcon status={intg.status} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-zinc-100">{intg.display_name}</span>
              {intg.deferred && (
                <span className="px-1.5 py-0.5 text-xs rounded bg-zinc-800 text-zinc-500 border border-zinc-700">
                  Coming Soon
                </span>
              )}
              {!intg.deferred && intg.demo_available && intg.status === 'unconfigured' && (
                <span className="px-1.5 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  Demo available
                </span>
              )}
              {!intg.deferred && intg.status === 'configured' && (
                <span className="px-1.5 py-0.5 text-xs rounded bg-emerald-900/40 text-emerald-400 border border-emerald-800/40">
                  Live
                </span>
              )}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5 leading-snug">{intg.description}</div>
          </div>
        </div>
        {!intg.deferred && (
          <button onClick={() => setEditing(v => !v)}
            className="p-1.5 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors shrink-0">
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Features */}
      {intg.features.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {intg.features.map(f => (
            <span key={f} className="px-1.5 py-0.5 text-xs rounded bg-zinc-800/70 text-zinc-500 border border-zinc-800">
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Masked key */}
      {intg.api_key_masked && (
        <div className="text-xs text-zinc-500 font-mono bg-zinc-800/50 px-2 py-1 rounded">
          {intg.api_key_label}: {intg.api_key_masked}
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <IntegrationForm
          integration={intg}
          onSave={async (key, cfg) => { await onUpdate(intg.name, key, cfg); setEditing(false); }}
          onCancel={() => setEditing(false)}
        />
      )}

      {/* Footer: test button + last tested */}
      {!intg.deferred && (
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={handleTest} disabled={testing}
            className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 transition-colors">
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
          {testResult && (
            <span className={cn('text-xs', testResult.success ? 'text-emerald-400' : 'text-red-400')}>
              {testResult.success ? `✓ ${testResult.message}` : `✗ ${testResult.message}`}
              {testResult.latency_ms != null && (
                <span className="text-zinc-600 ml-1">({testResult.latency_ms.toFixed(0)}ms)</span>
              )}
            </span>
          )}
          {!testResult && intg.last_tested_at && (
            <span className="flex items-center gap-1 text-xs text-zinc-600">
              <Clock className="w-3 h-3" />
              Tested {formatTestedAt(intg.last_tested_at)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
