const SEC_BASE = 'https://data.sec.gov';
const SUBMISSIONS = 'https://data.sec.gov/submissions';

function getHeaders() {
  const ua = process.env.SEC_USER_AGENT;
  if (!ua) throw new Error('SEC_USER_AGENT missing. Set SEC_USER_AGENT="AppName contact@example.com"');
  return { 'User-Agent': ua, 'Accept': 'application/json, text/plain;q=0.9,*/*;q=0.8' };
}

export function normalizeCik(input) {
  const digits = String(input || '').replace(/\D/g, '');
  return digits.padStart(10, '0');
}

export async function lookupCompanyByTicker(ticker) {
  const res = await fetch('https://www.sec.gov/files/company_tickers.json', { headers: getHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`SEC ticker lookup failed (${res.status})`);
  const data = await res.json();
  const t = String(ticker || '').toUpperCase();
  const match = Object.values(data).find((x) => x.ticker === t);
  if (!match) throw new Error(`Ticker not found in SEC mapping: ${t}`);
  const cik = normalizeCik(match.cik_str);
  return { cik, companyName: match.title, submissionsUrl: `${SUBMISSIONS}/CIK${cik}.json` };
}

export async function fetchCompanySubmissions(cik) {
  const c = normalizeCik(cik);
  const res = await fetch(`${SUBMISSIONS}/CIK${c}.json`, { headers: getHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`SEC submissions fetch failed (${res.status})`);
  return res.json();
}

export async function listRecentFilings(cik, filters = {}) {
  const sub = await fetchCompanySubmissions(cik);
  const recent = sub.filings?.recent || {};
  const rows = (recent.accessionNumber || []).map((acc, i) => ({
    accessionNumber: acc,
    filingType: recent.form?.[i],
    filingDate: recent.filingDate?.[i],
    reportDate: recent.reportDate?.[i],
    primaryDocument: recent.primaryDocument?.[i],
    cik: normalizeCik(cik),
  }));
  const allowed = filters.filingTypes?.length ? new Set(filters.filingTypes) : null;
  let out = rows.filter(r => !allowed || allowed.has(r.filingType));
  out = out.slice(0, filters.limit || 10);
  return out;
}

export async function fetchFilingText(cik, accessionNumber, primaryDocument) {
  const c = normalizeCik(cik);
  const accNoDash = String(accessionNumber).replace(/-/g, '');
  const url = `https://www.sec.gov/Archives/edgar/data/${Number(c)}/${accNoDash}/${primaryDocument}`;
  const res = await fetch(url, { headers: getHeaders(), cache: 'no-store' });
  if (!res.ok) throw new Error(`SEC filing text fetch failed (${res.status})`);
  return { url, text: await res.text() };
}

export function extractRelevantFilingSections(text) {
  const lc = String(text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const patterns = {
    cash_mentions: [/cash and cash equivalents.{0,220}/ig,/short-term investments.{0,220}/ig,/liquidity.{0,220}/ig],
    burn_mentions: [/cash used in operating activities.{0,240}/ig,/net loss.{0,220}/ig,/operating expenses.{0,220}/ig,/accumulated deficit.{0,220}/ig],
    runway_mentions: [/require additional capital.{0,220}/ig,/runway.{0,160}/ig],
    dilution_mentions: [/dilution.{0,220}/ig,/common stock offering.{0,220}/ig,/warrants?.{0,220}/ig],
    offering_mentions: [/shelf registration.{0,240}/ig,/at-the-market offering.{0,240}/ig,/sales agreement.{0,220}/ig,/424b5.{0,100}/ig,/424b3.{0,100}/ig],
    going_concern_mentions: [/going concern.{0,220}/ig,/substantial doubt.{0,220}/ig],
    debt_mentions: [/debt.{0,220}/ig,/notes payable.{0,220}/ig],
    risk_factor_mentions: [/risk factors?.{0,220}/ig],
  };
  const out = {};
  for (const [k, regs] of Object.entries(patterns)) {
    const m = [];
    for (const re of regs) {
      const found = lc.match(re) || [];
      m.push(...found.slice(0, 3));
    }
    out[k] = Array.from(new Set(m)).slice(0, 10);
  }
  out.missing_fields = Object.entries(out).filter(([k,v]) => k !== 'missing_fields' && Array.isArray(v) && v.length === 0).map(([k]) => k);
  return out;
}

export function estimateRunwayQuarters({ cash, quarterlyBurn, source }) {
  if (!(cash > 0) || !(quarterlyBurn < 0)) return { runway_quarters: 'missing', formula: 'missing', warning: 'missing', source: source || 'missing' };
  const runway = cash / Math.abs(quarterlyBurn);
  return {
    runway_quarters: Number(runway.toFixed(2)),
    formula: `${cash} / ${Math.abs(quarterlyBurn)}`,
    warning: 'Approximate only. Public filing values may differ by period and accounting presentation.',
    source: source || 'missing',
  };
}
