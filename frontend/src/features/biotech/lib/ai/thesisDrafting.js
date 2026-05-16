const FORBIDDEN = ['will go up','guaranteed','certain','risk-free','approval likely','buy','strong buy','sell now'];

export function compressSources(selectedSources=[], budget=700){
  return (selectedSources||[]).map((s)=>({
    source_type: s.source_type || 'other',
    title: String(s.title||'missing').slice(0,120),
    url: s.url || s.source_url || 'missing',
    key_snippets: String(s.summary || s.raw_text || '').slice(0,budget),
    extracted_signals: s.metadata?.signals || s.extracted || {},
    dates: s.metadata?.dates || {},
    missing_fields: s.metadata?.missing_fields || [],
  }));
}

export function createAiClient(){
  const provider = process.env.AI_PROVIDER || 'mock';
  const model = process.env.AI_MODEL || 'mock-thesis-v1';
  const key = process.env.AI_API_KEY;
  if (provider !== 'mock' && !key) throw new Error('AI provider configured but AI_API_KEY missing.');
  return {
    provider,
    model,
    async draft(input){
      return generateMockDraft(input);
    }
  };
}

function generateMockDraft(input){
  const src = compressSources(input.selectedSources || []);
  const facts = src.slice(0,4).map((s)=>`Fact from ${s.source_type}: ${s.title}`);
  return {
    ticker: input.ticker || 'missing', company: input.companyName || 'missing', drug: 'missing', indication: 'missing', mechanism: 'missing',
    trial_phase: 'missing', catalyst: input.catalystId || 'missing', expected_date: 'missing',
    facts, interpretations: ['Interpretation: evidence is incomplete and uncertain for paper-trading thesis use only.'],
    science_summary: `Fact: ${facts[0]||'missing'}. Interpretation: research thesis is uncertain and not predictive.`,
    clinical_trial_design:'missing', primary_endpoint_analysis:'missing', secondary_endpoint_analysis:'missing', safety_analysis:'missing',
    standard_of_care:'missing', competitor_landscape:'missing', regulatory_risk:'missing', financial_risk:'missing', cash_runway:'missing', dilution_risk:'missing',
    market_expectation:'Delayed/approximate market context may not reflect full pricing-in.',
    bull_case:'If evidence quality improves with consistent public updates, paper-trading thesis could strengthen.',
    bear_case:'If endpoint, safety, dilution, or regulatory evidence worsens, thesis weakens materially.',
    base_case:'Mixed evidence and uncertainty; maintain conservative paper-trading posture.',
    invalidation_criteria:'Invalidate if core endpoint rationale fails or dilution/regulatory risk rises beyond assumptions.',
    warnings:['AI-assisted draft is editable and may be incomplete.','Uses selected public sources only.','Paper-trading only; not investment advice.'],
    missing_fields:['drug','indication','trial_phase'], suggested_follow_up_questions: input.draftPreferences?.includeFollowUpQuestions ? ['Which endpoint is decision-critical?','What SEC dilution signals changed recently?'] : [],
    source_summary: src.map((s,i)=>({ sourceId: `${s.source_type}:${i}`, source_type:s.source_type, title:s.title, source_url:s.url })),
    confidence_label:'low'
  };
}

export async function generateStructuredThesisDraft(input){
  if (!input?.selectedSources?.length) throw new Error('Select at least one source before drafting.');
  const client = createAiClient();
  const draft = await client.draft(input);
  return repairDraftIfNeeded(draft);
}

export function validateAiThesisDraft(draft){
  const issues=[];
  if (!Array.isArray(draft?.source_summary) || draft.source_summary.length===0) issues.push('source_summary required');
  if (!draft?.bear_case || draft.bear_case==='missing') issues.push('bear_case required');
  if (!draft?.invalidation_criteria || draft.invalidation_criteria==='missing') issues.push('invalidation_criteria required');
  const blob = JSON.stringify(draft).toLowerCase();
  for(const w of FORBIDDEN){ if (blob.includes(w)) issues.push(`forbidden certainty wording: ${w}`); }
  return { ok: issues.length===0, issues };
}

export function repairDraftIfNeeded(draft){
  const out = { ...draft };
  if (!out.bear_case) out.bear_case = 'missing';
  if (!out.invalidation_criteria) out.invalidation_criteria = 'missing';
  if (!Array.isArray(out.source_summary)) out.source_summary = [];
  if (!Array.isArray(out.facts)) out.facts = [];
  if (!Array.isArray(out.interpretations)) out.interpretations = [];
  if (!Array.isArray(out.warnings)) out.warnings = [];
  if (!Array.isArray(out.missing_fields)) out.missing_fields = [];
  if (!Array.isArray(out.suggested_follow_up_questions)) out.suggested_follow_up_questions = [];
  return out;
}
