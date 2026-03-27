'use client';

import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { settingsApi, integrationsApi } from '@/lib/api';
import TopBar from '@/components/layout/TopBar';
import IntegrationCard from '@/components/settings/IntegrationCard';
import type { AppSettings, IntegrationTestResult } from '@/types';

export default function SettingsPage() {
  const { data: settings, loading: sLoading, refetch: refetchSettings } = useApi(() => settingsApi.get(), []);
  const { data: integrations, loading: iLoading, refetch: refetchIntegrations } = useApi(() => integrationsApi.list(), []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (updates: Partial<AppSettings>) => {
    setSaving(true);
    try {
      await settingsApi.update(updates);
      await refetchSettings();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleIntegrationUpdate = async (name: string, apiKey: string, config: Record<string, string>) => {
    await integrationsApi.update(name, { api_key: apiKey || undefined, config });
    refetchIntegrations();
  };

  const handleIntegrationTest = async (name: string): Promise<IntegrationTestResult> => {
    return integrationsApi.test(name);
  };

  const toggleInput = (key: keyof AppSettings, checked: boolean) => handleSave({ [key]: checked });

  return (
    <div>
      <TopBar title="Settings" subtitle="Configuration & integrations" />
      <div className="p-6 space-y-8 max-w-3xl">

        {/* General settings */}
        <div>
          <div className="text-sm font-medium text-zinc-300 mb-4">General</div>
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 divide-y divide-zinc-800">
            {sLoading ? (
              <div className="p-4 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-6 bg-zinc-800 rounded animate-pulse" />)}</div>
            ) : settings && (
              <>
                {([
                  ['demo_mode', 'Demo Mode', 'Use built-in demo data instead of live APIs'],
                  ['auto_refresh', 'Auto Refresh', 'Automatically refresh data every 5 minutes'],
                ] as [keyof AppSettings, string, string][]).map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <div className="text-sm text-zinc-200">{label}</div>
                      <div className="text-xs text-zinc-500">{desc}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={!!settings[key]} onChange={e => toggleInput(key, e.target.checked)}
                        className="sr-only peer" />
                      <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="text-sm text-zinc-200">Refresh Interval</div>
                    <div className="text-xs text-zinc-500">How often to refresh data (seconds)</div>
                  </div>
                  <input type="number" min="30" max="3600" step="30"
                    defaultValue={settings.refresh_interval_seconds}
                    onBlur={e => handleSave({ refresh_interval_seconds: parseInt(e.target.value) })}
                    className="w-20 px-2 py-1 text-sm bg-zinc-800 border border-zinc-700 rounded text-zinc-100 font-mono text-right focus:outline-none focus:border-zinc-500" />
                </div>
              </>
            )}
          </div>
          {saved && <p className="text-xs text-emerald-400 mt-2">✓ Settings saved</p>}
        </div>

        {/* Integrations */}
        <div>
          <div className="text-sm font-medium text-zinc-300 mb-4">API Integrations</div>
          {iLoading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-zinc-900 rounded-lg border border-zinc-800 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {(integrations ?? []).map(intg => (
                <IntegrationCard
                  key={intg.name}
                  integration={intg}
                  onUpdate={handleIntegrationUpdate}
                  onTest={handleIntegrationTest}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
