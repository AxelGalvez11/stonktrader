import { mockThesis } from '@/features/biotech/data/mockData';
import SourceCitationList from '@/features/biotech/components/SourceCitationList';

export default function NewThesisPage() {
  return <div className="p-6 space-y-4">
    <h1 className="text-2xl font-semibold">AI Thesis Generator</h1>
    <p className="text-sm text-zinc-400">The public evidence suggests mixed outcomes are possible. This is suitable for paper trading review only.</p>
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2">
      <div><b>{mockThesis.ticker}</b> — {mockThesis.company}</div>
      <div>Bull: {mockThesis.bull_case}</div>
      <div>Bear: {mockThesis.bear_case}</div>
      <div>Base: {mockThesis.base_case}</div>
      <div>Invalidation: {mockThesis.invalidation_criteria}</div>
      <h2 className="font-medium">Sources</h2>
      <SourceCitationList sources={mockThesis.source_summary} />
    </div>
  </div>;
}
