export default function RiskBlindSpotPanel({ data }: { data: any }) {
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4"><h3 className="font-semibold mb-2">Risk Blind Spot Analysis</h3>{Object.entries(data||{}).map(([k,v]:any)=><div className="text-sm" key={k}>{k}: {v}</div>)}</div>;
}
