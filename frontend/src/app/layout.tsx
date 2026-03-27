import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Market Radar',
  description: 'Personal decision-support dashboard for stocks, meme coins, and prediction market signals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />

          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {/* Page content */}
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>

            {/* Persistent disclaimer */}
            <footer className="shrink-0 px-6 py-2 bg-zinc-900/80 border-t border-zinc-800 text-center">
              <p className="text-xs text-zinc-600">
                <span className="text-zinc-500 font-medium">Personal research only — not financial advice.</span>
                {' '}All outputs are probabilistic estimates based on demo data.
                Meme coins carry extreme risk of total loss.
                Prediction market signals are contextual, not trade signals.
                Backtests do not guarantee future results.
              </p>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
