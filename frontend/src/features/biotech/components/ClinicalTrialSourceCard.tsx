export default function ClinicalTrialSourceCard({ trial, selected, onToggle }: { trial: any; selected: boolean; onToggle: () => void }) {
  return <label className="block border border-zinc-800 rounded p-3 text-sm">
    <div className="flex items-start gap-2"><input type="checkbox" checked={selected} onChange={onToggle} />
      <div>
        <div><b>{trial.nct_id}</b> — {trial.brief_title}</div>
        <div className="text-zinc-400">{trial.phase} • {trial.status} • enrollment {trial.enrollment ?? 'missing'}</div>
        <div className="text-zinc-400">Condition: {(trial.conditions||[])[0] || 'missing'} | Drug: {(trial.drug_candidates||[])[0] || 'missing'}</div>
        <div className="text-zinc-400">Primary endpoint: {(trial.primary_endpoints||[])[0] || 'missing'}</div>
        <div className="text-zinc-400">Primary completion: {trial.primary_completion_date || 'missing'}</div>
        <div className="text-zinc-400">Missing: {(trial.missing_fields||[]).join(', ') || 'none'}</div>
        <a className="text-blue-400 text-xs" href={trial.source_url} target="_blank">Source link</a>
      </div>
    </div>
  </label>;
}
