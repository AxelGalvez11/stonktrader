import { BiotechThesis, Catalyst, WatchlistItem } from '@/types/biotech';

export const mockWatchlist: WatchlistItem[] = [
  { id: '1', ticker: 'SAVA', companyName: 'Cassava Sciences', tags: ['small-cap biotech', 'CNS'], status: 'watching', subsector: 'Neurodegeneration' },
  { id: '2', ticker: 'CRSP', companyName: 'CRISPR Therapeutics', tags: ['gene therapy', 'rare disease'], status: 'researching', subsector: 'Gene Editing' },
  { id: '3', ticker: 'VRTX', companyName: 'Vertex Pharmaceuticals', tags: ['large pharma', 'rare disease'], status: 'paper-traded', subsector: 'Rare Disease' },
];

export const mockCatalysts: Catalyst[] = [
  { id: 'c1', ticker: 'CRSP', title: 'Exa-cel post-launch uptake update', catalystType: 'publication', expectedDate: '2026-07-12', riskLevel: 'medium', sourceUrl: 'https://investors.crisprtx.com/' },
  { id: 'c2', ticker: 'SAVA', title: 'Phase 3 cognition endpoint readout window', catalystType: 'Phase 3 data', expectedDate: '2026-08-20', riskLevel: 'high', sourceUrl: 'https://clinicaltrials.gov/' },
  { id: 'c3', ticker: 'VRTX', title: 'Quarterly earnings and pipeline update', catalystType: 'earnings', expectedDate: '2026-06-30', riskLevel: 'low', sourceUrl: 'https://www.sec.gov/edgar/search/' },
];

export const mockThesis: BiotechThesis = {
  ticker: 'CRSP', company: 'CRISPR Therapeutics', drug: 'Exa-cel', indication: 'Sickle Cell Disease', mechanism: 'Gene editing (CRISPR-Cas9)', trial_phase: 'Commercial/Post-approval', catalyst: 'Early launch execution', expected_date: '2026-07-12',
  science_summary: 'Fact: gene editing can reduce vaso-occlusive crises in treated patients in published cohorts. Interpretation: durability in broad real-world populations remains a key uncertainty.',
  clinical_trial_design: 'Single-arm severe disease cohorts with long-term follow-up; no randomized comparator in pivotal program.',
  primary_endpoint_analysis: 'Primary endpoints focused on severe crisis reduction and transfusion independence depending on cohort.',
  secondary_endpoint_analysis: 'Secondary outcomes include quality-of-life and biomarker durability trends.',
  safety_analysis: 'Conditioning and procedure-related risks remain material; long-term off-target monitoring continues.',
  standard_of_care: 'Hydroxyurea, transfusions, and supportive care remain baseline standards.', competitor_landscape: 'Bluebird and emerging gene-editing programs may compete on access, safety perception, and logistics.',
  regulatory_risk: 'Label updates and long-term safety follow-up obligations could shift perception.', financial_risk: 'Commercial ramp and manufacturing costs may pressure near-term margins.', cash_runway: 'Estimated >8 quarters based on public balance sheet guidance.', dilution_risk: 'Lower near-term than small-cap peers but still sensitive to pipeline expansion.', market_expectation: 'A meaningful portion of success appears priced in after prior approvals.',
  bull_case: 'Faster-than-expected center onboarding and reimbursement could support upside sentiment.', bear_case: 'Operational bottlenecks or safety headlines could dominate near-term narrative.', base_case: 'Gradual launch progress with mixed quarterly volatility.',
  possible_stock_reaction_scenarios: [{ scenario: 'Upside reaction', reasoning: 'Better-than-feared launch metrics.', risk: 'Could reverse if durability concerns emerge.' }],
  paper_trade_idea: 'Paper-trade only: small, risk-defined position around catalyst with explicit invalidation.', invalidation_criteria: 'If launch metrics miss management range for two consecutive updates, thesis invalidated.',
  what_to_watch_next: ['Updated treated-patient counts', 'Any safety signal change', 'Reimbursement timelines'],
  source_summary: [{ sourceId: 'src-ctgov-001', sourceType: 'clinicaltrials', url: 'https://clinicaltrials.gov/', note: 'Program design and status.' }],
  confidence_label: 'moderate', warnings: ['Research and paper trading only.', 'Public information may be incomplete.', 'No guaranteed outcomes.'],
};
