function pick(raw, re) {
  const m = raw.match(re);
  return m?.[1]?.trim() || 'missing';
}

export function structureResearchNote({ raw_text, ticker = 'missing', company = 'missing' }) {
  const raw = String(raw_text || '');
  const out = {
    company,
    ticker,
    drug_candidate: pick(raw, /(?:drug|candidate)\s*[:\-]\s*([^\n]+)/i),
    indication: pick(raw, /indication\s*[:\-]\s*([^\n]+)/i),
    mechanism: pick(raw, /mechanism\s*[:\-]\s*([^\n]+)/i),
    trial_phase: pick(raw, /(phase\s*[1234])/i),
    catalyst: pick(raw, /catalyst\s*[:\-]\s*([^\n]+)/i),
    expected_date: pick(raw, /(20\d{2}-\d{2}-\d{2}|q[1-4]\s*20\d{2}|h[12]\s*20\d{2})/i),
    primary_endpoint: pick(raw, /primary endpoint\s*[:\-]\s*([^\n]+)/i),
    safety_concerns: pick(raw, /safety\s*[:\-]\s*([^\n]+)/i),
    cash_runway_info: pick(raw, /cash runway\s*[:\-]\s*([^\n]+)/i),
    dilution_info: pick(raw, /dilution\s*[:\-]\s*([^\n]+)/i),
    bull_points: raw.toLowerCase().includes('bull') ? ['See note bull section'] : ['missing'],
    bear_points: raw.toLowerCase().includes('bear') ? ['See note bear section'] : ['missing'],
    missing_fields: [],
    suggested_follow_up_questions: [
      'What source confirms the expected catalyst date?',
      'What does management guide for cash runway?',
      'What data would invalidate the thesis?'
    ],
  };
  out.missing_fields = Object.entries(out).filter(([_,v]) => typeof v === 'string' && v === 'missing').map(([k]) => k);
  return out;
}
