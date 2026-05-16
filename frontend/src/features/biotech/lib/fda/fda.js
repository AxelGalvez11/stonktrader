const OPENFDA = 'https://api.fda.gov';

export function buildFdaQueryFromThesisContext(input = {}) {
  return [input.drug, input.indication, input.mechanism, input.company].filter(Boolean).join(' ');
}

function findText(raw, key) {
  const v = raw?.openfda?.[key] || raw?.[key];
  if (Array.isArray(v)) return v[0] || 'missing';
  return v || 'missing';
}

export function extractRegulatorySignals(record) {
  const txt = JSON.stringify(record).toLowerCase();
  const has = (x) => txt.includes(x);
  const out = {
    approval_precedent: [has('approved') ? 'approved language present' : null].filter(Boolean),
    boxed_warning: [has('boxed warning') ? 'boxed warning present' : null].filter(Boolean),
    contraindications: [has('contraindication') ? 'contraindication present' : null].filter(Boolean),
    safety_warnings: [has('warnings and precautions') ? 'warnings and precautions present' : null, has('rems') ? 'rems mention' : null].filter(Boolean),
    adverse_reactions: [has('adverse reaction') ? 'adverse reactions mentioned' : null, has('serious adverse event') ? 'serious adverse event mention' : null].filter(Boolean),
    efficacy_label_claims: [has('clinical studies') ? 'clinical studies section present' : null].filter(Boolean),
    advisory_committee_concerns: [has('advisory committee') ? 'advisory committee mention' : null, has('complete response letter') ? 'complete response letter mention' : null].filter(Boolean),
    missing_fields: [],
  };
  out.missing_fields = Object.entries(out).filter(([k,v])=>k!=='missing_fields'&&Array.isArray(v)&&v.length===0).map(([k])=>k);
  return out;
}

export function normalizeFdaDrugRecord(raw, context = {}) {
  const label_sections = {
    indications_and_usage: findText(raw, 'indications_and_usage'),
    dosage_and_administration: findText(raw, 'dosage_and_administration'),
    contraindications: findText(raw, 'contraindications'),
    warnings_and_precautions: findText(raw, 'warnings_and_precautions'),
    adverse_reactions: findText(raw, 'adverse_reactions'),
    boxed_warning: findText(raw, 'boxed_warning'),
    clinical_studies: findText(raw, 'clinical_studies'),
  };
  const rec = {
    fda_source_id: raw?.id || raw?.set_id || raw?.application_number || 'missing',
    source_kind: raw?.source_kind || 'openfda_label',
    title: findText(raw, 'brand_name'),
    drug_name: findText(raw, 'generic_name'),
    active_ingredients: raw?.active_ingredient || raw?.openfda?.substance_name || [],
    application_number: findText(raw, 'application_number'),
    sponsor: findText(raw, 'manufacturer_name'),
    indication: label_sections.indications_and_usage,
    approval_status: hasApproval(raw),
    approval_date: findText(raw, 'effective_time'),
    label_sections,
    safety_signals: { warnings: [label_sections.warnings_and_precautions, label_sections.boxed_warning].filter(x=>x!=='missing') },
    regulatory_signals: extractRegulatorySignals(raw),
    source_url: `https://open.fda.gov/apis/drug/label/search/?search=${encodeURIComponent(findText(raw,'application_number'))}`,
    retrieved_at: new Date().toISOString(),
    raw_json: raw,
    missing_fields: [],
  };
  rec.missing_fields = Object.entries(rec).filter(([k,v])=>!['raw_json','label_sections','safety_signals','regulatory_signals','missing_fields'].includes(k)&&(v==='missing'||(Array.isArray(v)&&v.length===0))).map(([k])=>k);
  if (context?.drug && rec.drug_name === 'missing') rec.drug_name = context.drug;
  return rec;
}

function hasApproval(raw){ const t=JSON.stringify(raw).toLowerCase(); return t.includes('approved')?'public FDA source (approval language present)':'missing'; }

export function normalizeFdaLabel(raw, context={}) { return normalizeFdaDrugRecord(raw, context); }

export async function searchFdaLabels(query, options={}) {
  const limit = options.limit || 10;
  const q = encodeURIComponent(query);
  const r = await fetch(`${OPENFDA}/drug/label.json?search=${q}&limit=${limit}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`FDA label search failed (${r.status})`);
  const j = await r.json();
  return (j.results || []).map((x)=>normalizeFdaLabel(x));
}

export async function searchFdaDrugs(query, options={}) { return searchFdaLabels(query, options); }
export async function fetchFdaDrugLabel(applicationNumberOrSetId) { const out = await searchFdaLabels(applicationNumberOrSetId, { limit: 1 }); return out[0] || null; }
export async function searchFdaSafetyCommunications(query, options={}) { return searchFdaLabels(query + ' safety', options); }
