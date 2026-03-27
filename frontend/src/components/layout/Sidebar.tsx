'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, Zap, Activity,
  Star, BookOpen, BarChart2, Settings, Radio,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/',             label: 'Overview',     icon: LayoutDashboard },
  { href: '/stocks',       label: 'Stocks',       icon: TrendingUp },
  { href: '/memecoins',    label: 'Meme Coins',   icon: Zap },
  { href: '/polymarket',   label: 'Polymarket',   icon: Activity },
  { href: '/watchlist',    label: 'Watchlist',    icon: Star },
  { href: '/paper-trades', label: 'Paper Trades', icon: BookOpen },
  { href: '/diagnostics',  label: 'Diagnostics',  icon: BarChart2 },
  { href: '/settings',     label: 'Settings',     icon: Settings },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col bg-zinc-900 border-r border-zinc-800 h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-zinc-100 tracking-tight">Market Radar</span>
        </div>
        <p className="text-xs text-zinc-500 mt-0.5 pl-7">Decision support</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                active
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Demo badge */}
      <div className="px-4 py-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-500/10 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs text-blue-400 font-medium">Demo Mode</span>
        </div>
      </div>
    </aside>
  );
}
