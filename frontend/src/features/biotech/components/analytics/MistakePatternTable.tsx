export default function MistakePatternTable({ data }: { data: any }) {
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4"><h3 className="font-semibold mb-2">Mistake Pattern Analysis</h3>{Object.entries(data.by_category||{}).map(([k,v]:any)=><div key={k} className="text-sm py-1">{k}: {v}</div>)}<div className="text-xs text-zinc-400 mt-2">Top recurring: {(data.top_recurring||[]).map((x:any)=>`${x.category} (${x.count})`).join(', ')||'n/a'}</div></div>;
}
