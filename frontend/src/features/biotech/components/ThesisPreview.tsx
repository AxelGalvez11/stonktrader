import SourceCitationList from './SourceCitationList';

export default function ThesisPreview({ thesis, missing }: { thesis: any; missing: string[] }) {
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-3">
    <h3 className="font-semibold">Thesis preview</h3>
    <div className="grid grid-cols-3 gap-2 text-sm">
      <div className="bg-emerald-900/20 p-2 rounded"><b>Bull</b><div>{thesis.bull_case}</div></div>
      <div className="bg-amber-900/20 p-2 rounded"><b>Base</b><div>{thesis.base_case}</div></div>
      <div className="bg-red-900/20 p-2 rounded"><b>Bear</b><div>{thesis.bear_case}</div></div>
    </div>
    <div className="text-sm"><b>Invalidation:</b> {thesis.invalidation_criteria}</div>
    <div className="text-sm"><b>Confidence:</b> {thesis.confidence_label}</div>
    <div>
      <b className="text-sm">Sources</b>
      <SourceCitationList sources={thesis.source_summary || []} />
    </div>
    <div className="text-sm text-amber-300"><b>Missing data:</b> {missing.length ? missing.join(', ') : 'none'}</div>
    <div className="text-xs text-zinc-400">Paper-trading thesis only. Public evidence suggests uncertainty; not financial advice.</div>
  </div>;
}
