export default function TradeReviewCard({ item }: { item: any }) {
  const analysis = (() => { try { return JSON.parse(item.ai_review || '{}'); } catch { return {}; } })();
  return <div className="bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2">
    <div className="font-semibold">Trade #{item.paper_trade_id}</div>
    <div className="text-sm"><b>Actual outcome:</b> {item.catalyst_outcome || 'missing'}</div>
    <div className="text-sm"><b>Stock reaction:</b> {item.stock_reaction_percent || 'missing'}</div>
    <div className="text-sm"><b>Mistake category:</b> {item.mistake_category || 'missing'}</div>
    <div className="text-sm"><b>Lesson learned:</b> {item.lesson_learned || 'missing'}</div>
    <div className="text-sm"><b>Future rule:</b> {item.future_rule || 'missing'}</div>
    <div className="text-xs text-zinc-400">Scientific accuracy: {analysis.scientific_accuracy || 'missing'}</div>
    <div className="text-xs text-zinc-400">Market accuracy: {analysis.market_accuracy || 'missing'}</div>
    <div className="text-xs text-zinc-400">Risk management: {analysis.risk_management_accuracy || 'missing'}</div>
  </div>;
}
