export default function WorkflowChecklist({ status, actions }: { status: any, actions: string[] }) {
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2 text-sm">
    <h2 className="font-semibold">Workflow checklist</h2>
    {Object.entries(status||{}).map(([k,v]:any)=><div key={k}>{v?'✅':'⬜'} {k.replaceAll('_',' ')}</div>)}
    <div className="pt-2 border-t border-zinc-800">
      <div className="font-medium">Next best action</div>
      <ul className="list-disc pl-5">{(actions||[]).map((a,i)=><li key={i}>{a}</li>)}</ul>
    </div>
  </div>;
}
