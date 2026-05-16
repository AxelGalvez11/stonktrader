export default function RiskBadge({ level }: { level: 'low' | 'medium' | 'high' | 'unknown' }) {
  const styles = {
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    high: 'bg-red-500/20 text-red-300 border-red-500/40',
    unknown: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/40',
  }[level];
  return <span className={`text-xs px-2 py-1 rounded border ${styles}`}>{level}</span>;
}
