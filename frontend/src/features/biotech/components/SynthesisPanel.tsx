export default function SynthesisPanel({ s }: { s: any }) {
  if (!s) return null;
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2 text-sm">
    <div className="font-semibold">Evidence Synthesis</div>
    <div>Quality score: <b>{s.overall_quality_score}</b> ({s.quality_label})</div>
    <div>Paper-trading readiness: <b>{s.paper_trade_readiness}</b></div>
    <div>Risk matrix: science {s.science_confidence}, regulatory {s.regulatory_risk}, financial {s.financial_risk}, market expectation {s.market_expectation_risk}, liquidity {s.liquidity_risk}</div>
    <div><b>This thesis may be incomplete.</b> Scores are heuristic and approximate; educational paper-trading analysis only.</div>
    <div>Potential conflicts: {(s.evidence_conflicts||[]).join(' | ') || 'none'}</div>
    <div>Missing evidence: {(s.missing_evidence||[]).join(' | ') || 'none'}</div>
    <div>Follow-up: {(s.suggested_follow_up_questions||[]).join(' | ') || 'none'}</div>
  </div>;
}
