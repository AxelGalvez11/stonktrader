const CTGOV_BASE = 'https://clinicaltrials.gov/api/v2/studies';

export function normalizeNctId(nctId) {
  const s = String(nctId || '').toUpperCase().trim();
  return s.startsWith('NCT') ? s : `NCT${s.replace(/^0+/, '')}`;
}

function asArray(v) { return Array.isArray(v) ? v : (v ? [v] : []); }

export function normalizeTrialRecord(raw) {
  const p = raw?.protocolSection || {};
  const id = p?.identificationModule || {};
  const status = p?.statusModule || {};
  const design = p?.designModule || {};
  const cond = p?.conditionsModule || {};
  const arms = p?.armsInterventionsModule || {};
  const elig = p?.eligibilityModule || {};
  const contacts = p?.contactsLocationsModule || {};
  const outcomes = p?.outcomesModule || {};
  const sponsor = p?.sponsorCollaboratorsModule || {};

  const interventions = asArray(arms?.interventions).map((x) => x?.name).filter(Boolean);
  const conditions = asArray(cond?.conditions).filter(Boolean);
  const primaryEndpoints = asArray(outcomes?.primaryOutcomes).map((x) => x?.measure).filter(Boolean);
  const secondaryEndpoints = asArray(outcomes?.secondaryOutcomes).map((x) => x?.measure).filter(Boolean);

  const out = {
    nct_id: normalizeNctId(id?.nctId || 'missing'),
    brief_title: id?.briefTitle || 'missing',
    official_title: id?.officialTitle || 'missing',
    sponsor: sponsor?.leadSponsor?.name || 'missing',
    collaborators: asArray(sponsor?.collaborators).map((x) => x?.name).filter(Boolean),
    conditions,
    interventions,
    drug_candidates: interventions,
    phase: asArray(design?.phases)[0] || 'missing',
    status: status?.overallStatus || 'missing',
    enrollment: design?.enrollmentInfo?.count ?? 'missing',
    study_type: design?.studyType || 'missing',
    allocation: design?.designInfo?.allocation || 'missing',
    masking: design?.designInfo?.maskingInfo?.masking || 'missing',
    primary_purpose: design?.designInfo?.primaryPurpose || 'missing',
    start_date: status?.startDateStruct?.date || 'missing',
    primary_completion_date: status?.primaryCompletionDateStruct?.date || 'missing',
    completion_date: status?.completionDateStruct?.date || 'missing',
    primary_endpoints: primaryEndpoints,
    secondary_endpoints: secondaryEndpoints,
    inclusion_criteria: elig?.eligibilityCriteria || 'missing',
    exclusion_criteria: elig?.eligibilityCriteria || 'missing',
    locations: asArray(contacts?.locations).map((x) => `${x?.facility || ''} ${x?.city || ''} ${x?.country || ''}`.trim()).filter(Boolean),
    source_url: `https://clinicaltrials.gov/study/${id?.nctId || 'missing'}`,
    retrieved_at: new Date().toISOString(),
    missing_fields: [],
    raw_json: raw,
  };
  out.missing_fields = Object.entries(out).filter(([k, v]) => k !== 'missing_fields' && (v === 'missing' || (Array.isArray(v) && v.length === 0))).map(([k]) => k);
  return out;
}

export async function searchTrialsByCompany(companyName, ticker) {
  const q = encodeURIComponent([companyName, ticker].filter(Boolean).join(' '));
  const res = await fetch(`${CTGOV_BASE}?query.term=${q}&pageSize=20&format=json`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`ClinicalTrials search failed (${res.status})`);
  const data = await res.json();
  return (data.studies || []).map(normalizeTrialRecord);
}

export async function searchTrialsByDrug(drugName) {
  const q = encodeURIComponent(drugName);
  const res = await fetch(`${CTGOV_BASE}?query.term=${q}&pageSize=20&format=json`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`ClinicalTrials drug search failed (${res.status})`);
  const data = await res.json();
  return (data.studies || []).map(normalizeTrialRecord);
}

export async function fetchTrialByNctId(nctId) {
  const n = normalizeNctId(nctId);
  const res = await fetch(`${CTGOV_BASE}/${n}?format=json`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`ClinicalTrials NCT fetch failed (${res.status})`);
  const data = await res.json();
  return normalizeTrialRecord(data);
}

export function extractTrialCatalystSignals(trial) {
  return {
    endpoint_signals: (trial.primary_endpoints || []).slice(0, 5),
    phase_signal: trial.phase || 'missing',
    status_signal: trial.status || 'missing',
    completion_signal: trial.primary_completion_date || trial.completion_date || 'missing',
    uncertainty: 'Trial completion does not guarantee data release.',
    missing_fields: trial.missing_fields || [],
  };
}

export function inferPotentialCatalystFromTrial(trial) {
  const expected = trial.primary_completion_date !== 'missing' ? trial.primary_completion_date : (trial.completion_date || 'missing');
  const type = expected === 'missing' ? 'completion_update' : 'trial_data';
  const phase = String(trial.phase || 'missing');
  const enrollment = Number(trial.enrollment);
  const risk = phase.includes('PHASE3') ? 'medium' : (phase.includes('PHASE2') ? 'high' : 'high');
  return {
    catalyst_type: type,
    title: `${trial.nct_id} possible catalyst window`,
    expected_date: expected,
    date_confidence: expected === 'missing' ? 'low' : 'moderate',
    risk_level: Number.isFinite(enrollment) && enrollment > 500 ? 'medium' : risk,
    description: 'Possible catalyst window from public registry data; trial completion does not guarantee data release.',
    missing_fields: expected === 'missing' ? ['expected_date'] : [],
  };
}
