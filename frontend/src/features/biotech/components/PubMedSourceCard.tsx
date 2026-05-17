export default function PubMedSourceCard({ article, selected, onToggle }: { article: any; selected: boolean; onToggle: () => void }) {
  const s = article.scientific_signals || {};
  return <label className="block border border-zinc-800 rounded p-3 text-sm">
    <div className="flex items-start gap-2"><input type="checkbox" checked={selected} onChange={onToggle} />
      <div>
        <div><b>PMID {article.pmid}</b> — {article.title}</div>
        <div className="text-zinc-400">{article.journal} • {article.publication_date} • relevance {article.relevance_score}</div>
        <div className="text-zinc-400">{(article.authors||[]).slice(0,3).join(', ')}</div>
        <div className="text-zinc-400">{String(article.abstract || 'missing').slice(0,220)}</div>
        <div className="text-zinc-400">Reasons: {(article.relevance_reasons||[]).join(', ') || 'missing'}</div>
        <div className="text-zinc-400">Signals: mech {s.mechanism_support?.length||0}, safety {s.safety_signals?.length||0}, endpoint {s.endpoint_relevance?.length||0}, competitor {s.competitor_context?.length||0}</div>
        <div className="text-zinc-400">Missing: {(s.missing_fields||[]).join(', ') || 'none'}</div>
        <a className="text-blue-400 text-xs" href={article.source_url} target="_blank">Source link</a>
      </div>
    </div>
  </label>;
}
