export function validatePaperTradeRisk(input) {
  if (!input.thesisId) return { ok: false, reason: 'Paper trade blocked: missing thesis, invalidation point, or risk plan.' };
  if (!input.invalidationPoint) return { ok: false, reason: 'Paper trade blocked: missing thesis, invalidation point, or risk plan.' };
  if (!input.positionSize || input.positionSize <= 0) return { ok: false, reason: 'Paper trade blocked: missing thesis, invalidation point, or risk plan.' };
  if (!input.exitPlan) return { ok: false, reason: 'Paper trade blocked: missing thesis, invalidation point, or risk plan.' };
  return { ok: true };
}
