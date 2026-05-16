export default function AlertReviewAssociationsPanel({ data }: { data: any }) {
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4"><h3 className="font-semibold mb-2">Alert-to-Review Analysis</h3>{Object.entries(data.associations||{}).map(([k,v]:any)=><div key={k} className="text-sm">{k}: {v}</div>)}<div className="text-xs text-zinc-400 mt-2">{data.summary}</div></div>;
}
