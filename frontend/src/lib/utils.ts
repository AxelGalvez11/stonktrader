import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Number formatters ────────────────────────────────────────────────────

export function formatPct(value: number, decimals = 1): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  if (value >= 1_000) return value.toLocaleString('en-US', { maximumFractionDigits: decimals });
  if (value >= 1)     return value.toFixed(decimals);
  if (value >= 0.001) return value.toFixed(6);
  return value.toExponential(3);
}

export function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

export function formatVolume(value: number): string {
  return formatMarketCap(value);
}

// ── Score → colour helpers ────────────────────────────────────────────────

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 65) return 'text-yellow-400';
  if (score >= 45) return 'text-orange-400';
  return 'text-red-400';
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (score >= 65) return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
  if (score >= 45) return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
  return 'bg-red-500/15 text-red-400 border-red-500/30';
}

export function riskBg(score: number): string {
  if (score <= 25) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (score <= 50) return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
  if (score <= 75) return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
  return 'bg-red-500/15 text-red-400 border-red-500/30';
}

export function confidenceColor(c: number): string {
  if (c >= 0.70) return 'bg-emerald-400';
  if (c >= 0.50) return 'bg-yellow-400';
  return 'bg-zinc-500';
}

export function pctColor(value: number): string {
  return value >= 0 ? 'text-emerald-400' : 'text-red-400';
}

// ── Probability → label ───────────────────────────────────────────────────

export function probLabel(p: number): string {
  if (p >= 0.75) return 'High';
  if (p >= 0.50) return 'Moderate';
  if (p >= 0.30) return 'Low';
  return 'Very Low';
}

// ── Date ─────────────────────────────────────────────────────────────────

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}
