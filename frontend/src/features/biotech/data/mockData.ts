import { BiotechThesis, Catalyst, WatchlistItem } from '@/types/biotech';

export const mockWatchlist: WatchlistItem[] = [
  { id: '1', ticker: 'VRTX', companyName: 'Vertex Pharmaceuticals', tags: ['large-cap biotech', 'anchor'], status: 'watching', subsector: 'Rare Disease', bucket: 'anchor', whatToWatch: ['Povetacicept regulatory path', 'Journavx adoption', 'Casgevy sales'] },
  { id: '2', ticker: 'REGN', companyName: 'Regeneron Pharmaceuticals', tags: ['large-cap biotech', 'anchor'], status: 'watching', subsector: 'Immunology/Ophthalmology', bucket: 'anchor', whatToWatch: ['Dupixent growth', 'Eylea HD updates'] },
  { id: '3', ticker: 'AMGN', companyName: 'Amgen', tags: ['large-cap biotech', 'anchor'], status: 'researching', subsector: 'Oncology/Inflammation', bucket: 'anchor', whatToWatch: ['MariTide obesity data', 'Biosimilar pressure'] },
  { id: '4', ticker: 'GILD', companyName: 'Gilead Sciences', tags: ['large-cap biotech', 'anchor'], status: 'watching', subsector: 'HIV/Oncology', bucket: 'anchor', whatToWatch: ['HIV/PrEP growth', 'Trodelvy expansion'] },

  { id: '5', ticker: 'BEAM', companyName: 'Beam Therapeutics', tags: ['gene editing', 'catalyst'], status: 'watching', subsector: 'Gene Editing', bucket: 'speculative', paperTradeRating: 'Best gene-editing watch', whatToWatch: ['BEAM-301 initial clinical data', 'BEAM-302 pivotal cohort'] },
  { id: '6', ticker: 'VKTX', companyName: 'Viking Therapeutics', tags: ['metabolic', 'obesity'], status: 'watching', subsector: 'Obesity/Metabolic', bucket: 'speculative', paperTradeRating: 'Best obesity catalyst watch', whatToWatch: ['VK2735 maintenance data Q3 2026', 'Oral Phase 3 start Q4 2026'] },
  { id: '7', ticker: 'NUVL', companyName: 'Nuvalent', tags: ['oncology', 'regulatory catalyst'], status: 'watching', subsector: 'Targeted Oncology', bucket: 'speculative', whatToWatch: ['Zidesamtinib PDUFA Sept 18, 2026'] },
  { id: '8', ticker: 'TNGX', companyName: 'Tango Therapeutics', tags: ['oncology', 'data catalyst'], status: 'researching', subsector: 'Synthetic Lethality Oncology', bucket: 'speculative', whatToWatch: ['PRMT5/RAS(ON) first clinical data'] },
  { id: '9', ticker: 'IDYA', companyName: 'IDEAYA Biosciences', tags: ['oncology', 'mid-cap'], status: 'researching', subsector: 'Precision Oncology', bucket: 'speculative', whatToWatch: ['OptimUM-02 full dataset at ASCO'] },

  { id: '10', ticker: 'EDIT', companyName: 'Editas Medicine', tags: ['gene editing', 'lottery'], status: 'watching', subsector: 'Gene Editing', bucket: 'lottery', paperTradeRating: 'High-risk turnaround', whatToWatch: ['EDIT-401 early human PoC by year-end 2026'] },
  { id: '11', ticker: 'ALT', companyName: 'Altimmune', tags: ['MASH', 'lottery'], status: 'researching', subsector: 'Liver/Metabolic', bucket: 'lottery', whatToWatch: ['PERFORMA Phase 3 MASH initiation H2 2026'] },
  { id: '12', ticker: 'IMRX', companyName: 'Immuneering', tags: ['oncology', 'lottery'], status: 'researching', subsector: 'Small-cap Oncology', bucket: 'lottery', whatToWatch: ['Catalyst timing and financing risk'] },
  { id: '13', ticker: 'CRSP', companyName: 'CRISPR Therapeutics', tags: ['gene editing', 'lottery'], status: 'paper-traded', subsector: 'Gene Editing', bucket: 'lottery', whatToWatch: ['CTX460 initiation mid-2026'] },
];

export const mockCatalysts: Catalyst[] = [
  { id: 'c1', ticker: 'BEAM', title: 'BEAM-301 initial clinical data window', catalystType: 'Phase 1 data', expectedDate: '2026-09-15', riskLevel: 'high', sourceUrl: 'https://investors.beamtx.com/' },
  { id: 'c2', ticker: 'VKTX', title: 'VK2735 maintenance dosing data', catalystType: 'Phase 3 data', expectedDate: '2026-08-10', riskLevel: 'high', sourceUrl: 'https://ir.vikingtherapeutics.com/' },
  { id: 'c3', ticker: 'NUVL', title: 'Zidesamtinib PDUFA decision date', catalystType: 'PDUFA', expectedDate: '2026-09-18', riskLevel: 'high', sourceUrl: 'https://investors.nuvalent.com/' },
  { id: 'c4', ticker: 'VRTX', title: 'Quarterly earnings and pipeline update', catalystType: 'earnings', expectedDate: '2026-07-31', riskLevel: 'low', sourceUrl: 'https://investors.vrtx.com/' },
  { id: 'c5', ticker: 'TNGX', title: 'PRMT5/RAS(ON) combo first clinical data', catalystType: 'Phase 1 data', expectedDate: '2026-11-01', riskLevel: 'high', sourceUrl: 'https://ir.tangotx.com/' },
];

export const mockThesis: BiotechThesis = {
  ticker: 'BEAM', company: 'Beam Therapeutics', drug: 'BEAM-301', indication: 'AATD', mechanism: 'Base editing', trial_phase: 'Phase 1/2', catalyst: 'Initial clinical data', expected_date: '2026-09-15',
  science_summary: 'Fact: base editing approach is biologically plausible and preclinical signals were encouraging. Interpretation: translational durability and safety in humans remain uncertain.',
  clinical_trial_design: 'Early-stage dose escalation with safety and biomarker focus.',
  primary_endpoint_analysis: 'Primary endpoint is safety/tolerability in first-in-human cohorts.',
  secondary_endpoint_analysis: 'Secondary endpoints include biomarker shifts suggesting target engagement.',
  safety_analysis: 'Main uncertainty is off-target editing and procedure-related toxicity.',
  standard_of_care: 'Supportive management and organ-specific interventions remain standard.', competitor_landscape: 'Gene editing and RNA modalities compete on efficacy, risk profile, and manufacturability.',
  regulatory_risk: 'Early-phase nature means high uncertainty and data-interpretation risk.', financial_risk: 'Trial cadence and R&D burn may require financing depending on timeline.', cash_runway: 'Use latest public filing to validate runway each quarter.', dilution_risk: 'Moderate-high for pre-commercial biotech if timelines extend.', market_expectation: 'Catalyst expectations may already reflect optimistic efficacy assumptions.',
  bull_case: 'Clear biological signal with manageable safety profile could improve confidence.', bear_case: 'Noisy biomarker data or adverse events could reset valuation lower.', base_case: 'Mixed early data leading to volatile but range-bound reaction.',
  possible_stock_reaction_scenarios: [{ scenario: 'Volatile mixed reaction', reasoning: 'Early data often partial and open to interpretation.', risk: 'High gap risk both ways.' }],
  paper_trade_idea: 'Paper-trade only: small, pre-defined risk around data release window.', invalidation_criteria: 'If safety signal is worse than peer tolerance or no target engagement, invalidate thesis.',
  what_to_watch_next: ['Cohort-by-cohort safety updates', 'Biomarker durability', 'Cash runway updates'],
  source_summary: [{ sourceId: 'src-beam-ir-001', sourceType: 'investor-relations', url: 'https://investors.beamtx.com/', note: 'Catalyst timing and company guidance.' }],
  confidence_label: 'low', warnings: ['Research and paper trading only.', 'Public information may be incomplete.', 'No guaranteed outcomes.'],
};
