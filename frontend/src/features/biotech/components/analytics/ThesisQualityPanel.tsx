export default function ThesisQualityPanel({ data }: { data: any }) {
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4"><h3 className="font-semibold mb-2">Thesis Quality Analysis</h3><div className="text-sm">Score distribution: {JSON.stringify(data.score_distribution||{})}</div><div className="text-sm">Readiness distribution: {JSON.stringify(data.readiness_distribution||{})}</div><div className="text-xs text-zinc-400 mt-2">{data.summary}</div></div>;
}
