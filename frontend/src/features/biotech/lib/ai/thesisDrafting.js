const FORBIDDEN = ['will go up','guaranteed','certain','risk-free','approval likely','approval certain','buy','strong buy','sell now','sell'];

export const THESIS_DRAFT_SYSTEM_PROMPT = `You are a conservative biotech research assistant.
You are drafting an editable paper-trading research thesis.
You are not providing investment advice.
Use only selected public sources.
Never invent facts.
Mark missing information as "missing."
Separate facts from interpretations.
Preserve source references.
Do not use buy/sell language.
Do not say guaranteed, certain, will go up, risk-free, approval certain, or similar.
Discuss uncertainty and downside.
Include bear case and invalidation criteria.
Label market data as delayed/approximate when applicable.
Output strict JSON only.`;

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

function mkUserPayload(input){
  return JSON.stringify({
    ticker: input.ticker || 'missing',
    companyName: input.companyName || 'missing',
    catalystId: input.catalystId || 'missing',
    marketContext: input.marketContext || {},
    draftPreferences: input.draftPreferences || { tone:'conservative', includeFollowUpQuestions:true },
    selectedSources: input.selectedSources || [],
    required_output_fields: ['ticker','company','drug','indication','mechanism','trial_phase','catalyst','expected_date','facts','interpretations','science_summary','clinical_trial_design','primary_endpoint_analysis','secondary_endpoint_analysis','safety_analysis','standard_of_care','competitor_landscape','regulatory_risk','financial_risk','cash_runway','dilution_risk','market_expectation','bull_case','bear_case','base_case','invalidation_criteria','warnings','missing_fields','suggested_follow_up_questions','source_summary','confidence_label']
  });
}

export function createAiClient(){
  const provider = process.env.AI_PROVIDER || 'mock';
  const model = process.env.AI_MODEL || (provider==='anthropic' ? 'claude-3-5-sonnet-latest' : 'gpt-4.1-mini');
  const key = process.env.AI_API_KEY;
  if (provider !== 'mock' && !key) throw new Error(`AI provider '${provider}' requires AI_API_KEY. Set AI_PROVIDER=mock for local fallback.`);
  return {
    provider, model,
    async generateRaw(input){
      if (provider==='mock') return JSON.stringify(generateMockDraft(input));
      const userPayload = mkUserPayload(input);
      if (provider==='openai') {
        const r = await fetch('https://api.openai.com/v1/chat/completions', {
          method:'POST', headers:{ 'content-type':'application/json', 'authorization':`Bearer ${key}` },
          body: JSON.stringify({ model, temperature:0.2, response_format:{ type:'json_object' }, messages:[{ role:'system', content:THESIS_DRAFT_SYSTEM_PROMPT },{ role:'user', content:userPayload }] })
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error?.message || 'OpenAI request failed');
        return j.choices?.[0]?.message?.content || '';
      }
      if (provider==='anthropic') {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method:'POST', headers:{ 'content-type':'application/json', 'x-api-key':key, 'anthropic-version':'2023-06-01' },
          body: JSON.stringify({ model, temperature:0.2, max_tokens:2200, system: THESIS_DRAFT_SYSTEM_PROMPT, messages:[{ role:'user', content:`Return strict JSON only:\n${userPayload}` }] })
        });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error?.message || 'Anthropic request failed');
        return j.content?.[0]?.text || '';
      }
      throw new Error(`Unsupported AI_PROVIDER '${provider}'`);
    }
  };
}

function generateMockDraft(input){ const src=compressSources(input.selectedSources||[]); return { ticker:input.ticker||'missing',company:input.companyName||'missing',drug:'missing',indication:'missing',mechanism:'missing',trial_phase:'missing',catalyst:input.catalystId||'missing',expected_date:'missing',facts:src.slice(0,3).map(s=>`Fact from ${s.source_type}: ${s.title}`),interpretations:['Interpretation: uncertainty remains; this is an editable research thesis.'],science_summary:'Fact: selected evidence is partial. Interpretation: uncertainty remains.',clinical_trial_design:'missing',primary_endpoint_analysis:'missing',secondary_endpoint_analysis:'missing',safety_analysis:'missing',standard_of_care:'missing',competitor_landscape:'missing',regulatory_risk:'missing',financial_risk:'missing',cash_runway:'missing',dilution_risk:'missing',market_expectation:'Delayed/approximate market context.',bull_case:'Evidence quality improves with public data.',bear_case:'New evidence weakens endpoint/safety/regulatory assumptions.',base_case:'Mixed evidence, uncertain thesis.',invalidation_criteria:'Invalidate on endpoint failure or rising dilution/regulatory risk.',warnings:['AI-assisted draft is editable and may be incomplete.','Paper-trading only; not investment advice.'],missing_fields:['drug','indication'],suggested_follow_up_questions:['What endpoint should drive invalidation?'],source_summary:src.map((s,i)=>({sourceId:`${s.source_type}:${i}`,source_type:s.source_type,title:s.title,source_url:s.url})),confidence_label:'low' }; }

export function repairDraftIfNeeded(output){ if (typeof output==='string') { try { output = JSON.parse(output); } catch { return { repaired:false, draft:null }; } } const d={...output}; if(!Array.isArray(d.facts)) d.facts=[]; if(!Array.isArray(d.interpretations)) d.interpretations=[]; if(!Array.isArray(d.source_summary)) d.source_summary=[]; if(!Array.isArray(d.warnings)) d.warnings=[]; if(!Array.isArray(d.missing_fields)) d.missing_fields=[]; if(!Array.isArray(d.suggested_follow_up_questions)) d.suggested_follow_up_questions=[]; d.bull_case=d.bull_case||'missing'; d.bear_case=d.bear_case||'missing'; d.base_case=d.base_case||'missing'; d.invalidation_criteria=d.invalidation_criteria||'missing'; d.confidence_label=['low','moderate','high'].includes(d.confidence_label)?d.confidence_label:'low'; return { repaired:true, draft:d }; }

export function validateAiThesisDraft(draft, selectedSources=[]){
  const issues=[];
  if (!selectedSources.length) issues.push('selected source count must be > 0');
  if (!Array.isArray(draft?.source_summary) || draft.source_summary.length===0) issues.push('source_summary required');
  if (!Array.isArray(draft?.facts)) issues.push('facts array required');
  if (!Array.isArray(draft?.interpretations)) issues.push('interpretations array required');
  if (!Array.isArray(draft?.missing_fields)) issues.push('missing_fields array required');
  if (!Array.isArray(draft?.warnings)) issues.push('warnings array required');
  if (!draft?.bull_case) issues.push('bull_case required');
  if (!draft?.bear_case) issues.push('bear_case required');
  if (!draft?.base_case) issues.push('base_case required');
  if (!draft?.invalidation_criteria) issues.push('invalidation_criteria required');
  if (!['low','moderate','high'].includes(draft?.confidence_label)) issues.push('confidence_label must be low|moderate|high');
  const blob = JSON.stringify(draft).toLowerCase();
  for(const w of FORBIDDEN){ if(blob.includes(w)) issues.push(`forbidden certainty wording: ${w}`); }
  if (draft?.science_summary && draft.science_summary !== 'missing' && (!draft?.source_summary?.length)) issues.push('science_summary missing source backing');
  return { ok: issues.length===0, issues };
}

export async function generateStructuredThesisDraft(input){
  if (!input?.selectedSources?.length) throw new Error('Select at least one source before drafting.');
  const client = createAiClient();
  const created_at = new Date().toISOString();
  const source_count = input.selectedSources.length;
  const compressed_source_char_count = JSON.stringify(input.selectedSources).length;
  const raw = await client.generateRaw(input);
  let parsed=null; let repaired=false; let parseError='';
  try { parsed = JSON.parse(raw); } catch(e){ parseError=String(e.message||e); const rep = repairDraftIfNeeded(raw); repaired=rep.repaired; parsed=rep.draft; }
  if (!parsed) return { draft:null, validation:{ ok:false, issues:[`invalid JSON from provider`, `raw_excerpt:${String(raw).slice(0,180)}`, `parse_error:${parseError}`] }, provider:client.provider, model:client.model, created_at, source_count, compressed_source_char_count, repaired };
  const validation = validateAiThesisDraft(parsed, input.selectedSources);
  return { draft: parsed, validation, provider:client.provider, model:client.model, created_at, source_count, compressed_source_char_count, repaired };
}
