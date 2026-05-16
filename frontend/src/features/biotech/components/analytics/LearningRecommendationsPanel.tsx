export default function LearningRecommendationsPanel({ data }: { data: string[] }) {
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4"><h3 className="font-semibold mb-2">Learning Recommendations</h3><ul className="list-disc pl-5 text-sm">{(data||[]).map((r,i)=><li key={i}>{r}</li>)}</ul></div>;
}
