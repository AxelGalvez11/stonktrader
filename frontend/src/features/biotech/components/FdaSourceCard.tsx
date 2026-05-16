export default function FdaSourceCard({ rec, selected, onToggle }: { rec: any; selected: boolean; onToggle: () => void }) {
  const rs = rec.regulatory_signals || {};
  return <label className="block border border-zinc-800 rounded p-3 text-sm">
    <div className="flex items-start gap-2"><input type="checkbox" checked={selected} onChange={onToggle} />
      <div>
        <div><b>{rec.title}</b> ({rec.source_kind})</div>
        <div className="text-zinc-400">{rec.drug_name} • {rec.sponsor} • app {rec.application_number}</div>
        <div className="text-zinc-400">Approval: {rec.approval_status} {rec.approval_date || ''}</div>
        <div className="text-zinc-400">Warnings: {(rs.boxed_warning||[]).join(', ') || 'missing'} | Contraindications: {(rs.contraindications||[]).join(', ') || 'missing'}</div>
        <div className="text-zinc-400">Clinical studies: {(rs.efficacy_label_claims||[]).join(', ') || 'missing'}</div>
        <div className="text-zinc-400">Missing: {(rs.missing_fields||[]).join(', ') || 'none'}</div>
        <a className="text-blue-400 text-xs" href={rec.source_url} target="_blank">Source link</a>
      </div>
    </div>
  </label>;
}
