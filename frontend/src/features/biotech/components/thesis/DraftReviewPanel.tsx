export default function DraftReviewPanel({ draft, onApply }: { draft: any, onApply?: ()=>void }) {
  if (!draft) return null;
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2 text-sm">
    <h3 className="font-semibold">AI-assisted draft review</h3>
    <div className="text-zinc-400">AI draft is editable and may be incomplete. Uses only selected sources. Review all missing fields before saving.</div>
    <div><b>Facts</b>: {(draft.facts||[]).join(' | ') || 'missing'}</div>
    <div><b>Interpretations</b>: {(draft.interpretations||[]).join(' | ') || 'missing'}</div>
    <div><b>Missing fields</b>: {(draft.missing_fields||[]).join(', ') || 'none'}</div>
    <div><b>Warnings</b>: {(draft.warnings||[]).join(' | ') || 'none'}</div>
    <div><b>Source coverage</b>: {(draft.source_summary||[]).length}</div>
    <div><b>Follow-up questions</b>: {(draft.suggested_follow_up_questions||[]).join(' | ') || 'none'}</div>
    {onApply && <button className="bg-blue-600 rounded px-3 py-2" onClick={onApply}>Apply draft to form</button>}
  </div>;
}
