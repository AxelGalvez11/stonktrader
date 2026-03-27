'use client';

import { useState } from 'react';
import type { Integration } from '@/types';

interface Props {
  integration: Integration;
  onSave: (apiKey: string, config: Record<string, string>) => Promise<void>;
  onCancel: () => void;
}

export default function IntegrationForm({ integration: intg, onSave, onCancel }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [config, setConfig] = useState<Record<string, string>>(intg.config ?? {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await onSave(apiKey, config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full px-2.5 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 font-mono';

  return (
    <form onSubmit={handleSave} className="space-y-2 pt-2 border-t border-zinc-800">
      {/* Extra config fields (e.g. Key ID for Kalshi, Client ID for Reddit) */}
      {intg.config_fields.map(field => (
        <div key={field.key}>
          <label className="block text-xs text-zinc-500 mb-1">
            {field.label}
            {field.hint && <span className="text-zinc-600 ml-1">— {field.hint}</span>}
          </label>
          <input
            type={field.secret ? 'password' : 'text'}
            value={config[field.key] ?? ''}
            onChange={e => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
            className={inputCls}
          />
        </div>
      ))}

      {/* Primary credential */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1">
          {intg.api_key_label} {intg.api_key_masked ? '(leave blank to keep existing)' : ''}
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder={intg.api_key_masked ? intg.api_key_masked : ''}
          className={inputCls}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" onClick={onCancel}
          className="px-2.5 py-1 text-xs rounded bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading}
          className="px-2.5 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">
          {loading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
