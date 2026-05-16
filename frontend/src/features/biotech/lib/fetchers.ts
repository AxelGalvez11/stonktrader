export async function fetchPubMed(_query: string) { return { provider: 'pubmed', status: 'placeholder' as const }; }
export async function fetchClinicalTrials(_query: string) { return { provider: 'clinicaltrials', status: 'placeholder' as const }; }
export async function fetchSecEdgar(_ticker: string) { return { provider: 'sec-edgar', status: 'placeholder' as const }; }
export async function fetchFda(_query: string) { return { provider: 'fda', status: 'placeholder' as const }; }
export async function fetchInvestorRelations(_url: string) { return { provider: 'ir', status: 'placeholder' as const }; }
