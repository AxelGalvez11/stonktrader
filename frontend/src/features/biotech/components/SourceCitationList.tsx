import { SourceSummaryItem } from '@/types/biotech';

export default function SourceCitationList({ sources }: { sources: SourceSummaryItem[] }) {
  return <ul className="space-y-2">{sources.map((s) => <li key={s.sourceId} className="text-sm text-zinc-300"><a className="text-blue-400" href={s.url} target="_blank">{s.sourceType}</a> — {s.note}</li>)}</ul>;
}
