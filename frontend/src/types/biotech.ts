export type RiskLevel = 'low' | 'medium' | 'high' | 'unknown';
export type WatchStatus = 'researching' | 'watching' | 'paper-traded' | 'archived';

export interface WatchlistItem {
  id: string;
  ticker: string;
  companyName: string;
  tags: string[];
  status: WatchStatus;
  subsector: string;
}

export interface Catalyst {
  id: string;
  ticker: string;
  title: string;
  catalystType: string;
  expectedDate: string;
  riskLevel: RiskLevel;
  sourceUrl: string;
}

export interface ThesisScenario {
  scenario: string;
  reasoning: string;
  risk: string;
}

export interface SourceSummaryItem {
  sourceId: string;
  sourceType: string;
  url: string;
  note: string;
}

export interface BiotechThesis {
  ticker: string;
  company: string;
  drug: string;
  indication: string;
  mechanism: string;
  trial_phase: string;
  catalyst: string;
  expected_date: string;
  science_summary: string;
  clinical_trial_design: string;
  primary_endpoint_analysis: string;
  secondary_endpoint_analysis: string;
  safety_analysis: string;
  standard_of_care: string;
  competitor_landscape: string;
  regulatory_risk: string;
  financial_risk: string;
  cash_runway: string;
  dilution_risk: string;
  market_expectation: string;
  bull_case: string;
  bear_case: string;
  base_case: string;
  possible_stock_reaction_scenarios: ThesisScenario[];
  paper_trade_idea: string;
  invalidation_criteria: string;
  what_to_watch_next: string[];
  source_summary: SourceSummaryItem[];
  confidence_label: 'low' | 'moderate' | 'high';
  warnings: string[];
}
