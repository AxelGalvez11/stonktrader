const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

function ncbiParams() {
  const tool = process.env.NCBI_TOOL;
  const email = process.env.NCBI_EMAIL;
  const apiKey = process.env.NCBI_API_KEY;
  if (!tool || !email) throw new Error('NCBI config missing. Set NCBI_TOOL and NCBI_EMAIL.');
  return { tool, email, apiKey };
}

export function normalizePmid(pmid) { return String(pmid || '').replace(/\D/g, ''); }

export function buildPubMedQueryFromTrialOrAsset(input) {
  return [input?.drug, input?.indication, input?.mechanism, input?.primary_endpoint, input?.trial_phase].filter(Boolean).join(' ');
}

export async function searchPubMed(query, options = {}) {
  const { tool, email, apiKey } = ncbiParams();
  const limit = options.limit || 10;
  const qs = new URLSearchParams({ db: 'pubmed', term: query, retmode: 'json', retmax: String(limit), tool, email });
  if (apiKey) qs.set('api_key', apiKey);
  const r = await fetch(`${EUTILS}/esearch.fcgi?${qs.toString()}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`PubMed search failed (${r.status})`);
  const j = await r.json();
  return j?.esearchresult?.idlist || [];
}

export async function fetchPubMedArticle(pmid) {
  const { tool, email, apiKey } = ncbiParams();
  const id = normalizePmid(pmid);
  const qs = new URLSearchParams({ db: 'pubmed', id, retmode: 'json', tool, email });
  if (apiKey) qs.set('api_key', apiKey);
  const r = await fetch(`${EUTILS}/esummary.fcgi?${qs.toString()}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`PubMed article fetch failed (${r.status})`);
  const j = await r.json();
  return j?.result?.[id] || { uid: id };
}

export async function fetchPubMedBatch(pmids) {
  const out = [];
  for (const p of pmids) out.push(await fetchPubMedArticle(p));
  return out;
}

export function extractScientificSignals(article, context = {}) {
  const t = `${article.title || ''} ${article.abstract || ''}`.toLowerCase();
  const hit = (words) => words.filter(w => t.includes(w));
  const signals = {
    mechanism_support: hit(['target','receptor','pathway','agonist','antagonist','inhibitor','antibody','sirna','crispr']),
    disease_biology: hit(['pathophysiology','biomarker','mutation','inflammation','fibrosis','tumor','metabolic']),
    endpoint_relevance: hit(['overall survival','progression-free survival','response rate','hba1c','weight loss','ldl','fev1']),
    safety_signals: hit(['adverse event','toxicity','hepatotoxicity','qt','infection','malignancy','discontinuation','serious adverse event']),
    prior_target_failures: hit(['failed','did not meet','discontinued','terminated']),
    prior_target_successes: hit(['improved','significant','approved']),
    competitor_context: hit(['compared with','standard of care','placebo','active comparator','existing therapy']),
    missing_fields: [],
  };
  signals.missing_fields = Object.entries(signals).filter(([k,v])=>k!=='missing_fields'&&Array.isArray(v)&&v.length===0).map(([k])=>k);
  return signals;
}

export function scorePubMedRelevance(article, context = {}) {
  const t = `${article.title || ''} ${article.abstract || ''}`.toLowerCase();
  let score = 0; const reasons = [];
  for (const [k,v] of Object.entries({ drug: context.drug, indication: context.indication, mechanism: context.mechanism })) {
    if (v && t.includes(String(v).toLowerCase())) { score += 30; reasons.push(`${k} match`); }
  }
  if (context.primary_endpoint && t.includes(String(context.primary_endpoint).toLowerCase())) { score += 10; reasons.push('endpoint match'); }
  return { relevance_score: Math.min(score, 100), relevance_reasons: reasons.length?reasons:['missing'] };
}

export function normalizePubMedArticle(raw, context = {}) {
  const article = {
    pmid: normalizePmid(raw.uid || raw.pmid || 'missing'),
    title: raw.title || 'missing',
    abstract: raw.summary || 'missing',
    journal: raw.fulljournalname || raw.source || 'missing',
    publication_date: raw.pubdate || 'missing',
    authors: (raw.authors || []).map(a => a.name).filter(Boolean),
    doi: (raw.articleids || []).find(x => x.idtype === 'doi')?.value || 'missing',
    article_types: raw.pubtype || [],
    mesh_terms: raw.meshheadinglist || [],
    keywords: raw.keywords || [],
    source_url: `https://pubmed.ncbi.nlm.nih.gov/${normalizePmid(raw.uid || raw.pmid || '')}/`,
    retrieved_at: new Date().toISOString(),
    relevance_score: 0,
    relevance_reasons: [],
    scientific_signals: { mechanism_support: [], disease_biology: [], endpoint_relevance: [], safety_signals: [], prior_target_failures: [], prior_target_successes: [], competitor_context: [], missing_fields: [] },
    raw_json: raw,
    missing_fields: [],
  };
  const rel = scorePubMedRelevance(article, context);
  article.relevance_score = rel.relevance_score;
  article.relevance_reasons = rel.relevance_reasons;
  article.scientific_signals = extractScientificSignals(article, context);
  article.missing_fields = Object.entries(article).filter(([k,v])=>!['raw_json','scientific_signals','missing_fields'].includes(k)&&(v==='missing'||(Array.isArray(v)&&v.length===0))).map(([k])=>k);
  return article;
}
