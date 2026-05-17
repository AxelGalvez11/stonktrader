export default function CatalystTypePerformanceTable({ data }: { data: any }) {
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4"><h3 className="font-semibold mb-2">Catalyst Type Analysis</h3>{Object.entries(data||{}).map(([k,v]:any)=><div key={k} className="text-sm py-1">{k}: avg {v.average_result_percent==null?'n/a':v.average_result_percent.toFixed(2)}%, common mistake {v.common_mistake_category}</div>)}</div>;
}
