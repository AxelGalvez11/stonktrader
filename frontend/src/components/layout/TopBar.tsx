import { relativeTime } from '@/lib/utils';
import type { ApiMeta } from '@/types';

interface Props {
  title: string;
  subtitle?: string;
  meta?: ApiMeta | null;
  action?: React.ReactNode;
}

export default function TopBar({ title, subtitle, meta, action }: Props) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {action}
        {meta && (
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {meta.demo_mode && (
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
              DEMO
            </span>
          )}
          <span>via {meta.provider}</span>
          <span>·</span>
          <span>{relativeTime(meta.as_of)}</span>
        </div>
        )}
      </div>
    </div>
  );
}
