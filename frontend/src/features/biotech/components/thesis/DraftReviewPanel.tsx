export default function DraftReviewPanel({ draft, onApply, meta }: { draft: any, onApply?: ()=>void, meta?: any }) {
  if (!draft) return null;
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2 text-sm">
    <h3 className="font-semibold">AI-assisted draft review</h3>
    <div className="text-zinc-400">AI draft is editable and may be incomplete. Uses only selected sources. Review all missing fields before saving.</div>
    {meta && <div className='text-xs text-zinc-400'>Provider/model: {meta.provider}/{meta.model} • validation: {meta.validation?.ok ? 'ok' : 'failed'} • repaired: {String(meta.repaired)} • source count: {meta.source_count} • compressed chars: {meta.compressed_source_char_count}</div>}
    <div className='text-amber-300 text-xs'>Review before saving.</div>
    <div><b>Facts</b>: {(draft.facts||[]).join(' | ') || 'missing'}</div>
    <div><b>Interpretations</b>: {(draft.interpretations||[]).join(' | ') || 'missing'}</div>
    <div><b>Missing fields</b>: {(draft.missing_fields||[]).join(', ') || 'none'}</div>
    <div><b>Warnings</b>: {(draft.warnings||[]).join(' | ') || 'none'}</div>
    <div><b>Source coverage</b>: {(draft.source_summary||[]).length}</div>
    <div><b>Follow-up questions</b>: {(draft.suggested_follow_up_questions||[]).join(' | ') || 'none'}</div>
    {onApply && <button className="bg-blue-600 rounded px-3 py-2" onClick={onApply}>Apply draft to form</button>}
  </div>;
}
