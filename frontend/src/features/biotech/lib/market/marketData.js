export function normalizeTicker(ticker) { return String(ticker || '').trim().toUpperCase().replace(/[^A-Z.]/g, ''); }

export function getMarketDataProvider() {
  const provider = process.env.MARKET_DATA_PROVIDER || 'stooq';
  const key = process.env.MARKET_DATA_API_KEY;
  if (provider !== 'stooq' && !key) throw new Error('MARKET_DATA_API_KEY missing for selected provider');
  return { provider, key };
}

function parseNum(v) { const n = Number(v); return Number.isFinite(n) ? n : null; }

export async function fetchQuote(ticker) {
  const { provider } = getMarketDataProvider();
  const t = normalizeTicker(ticker);
  if (!t) throw new Error('ticker required');
  if (provider === 'stooq') {
    const url = `https://stooq.com/q/l/?s=${t.toLowerCase()}.us&i=d`;
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`market quote fetch failed (${r.status})`);
    const txt = await r.text();
    const lines = txt.trim().split('\n');
    const cols = lines[1]?.split(',') || [];
    const close = parseNum(cols[6]); const open = parseNum(cols[4]); const vol = parseNum(cols[7]);
    const q = { ticker: t, price: close, previous_close: open, change: (close && open) ? close-open : null, change_percent: (close&&open&&open!==0)?((close-open)/open*100):null, volume: vol, average_volume: null, market_cap: null, currency: 'USD', exchange: 'US', delayed: true, provider, retrieved_at: new Date().toISOString(), missing_fields: [] };
    q.missing_fields = Object.entries(q).filter(([k,v])=>!['missing_fields'].includes(k)&&(v===null||v===undefined||v==='')).map(([k])=>k);
    return q;
  }
  throw new Error('provider not implemented');
}

export async function fetchDailyBars(ticker, options = {}) {
  const { provider } = getMarketDataProvider();
  const t = normalizeTicker(ticker);
  const range = options.range || '6mo';
  if (provider === 'stooq') {
    const url = `https://stooq.com/q/d/l/?s=${t.toLowerCase()}.us&i=d`;
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`market bars fetch failed (${r.status})`);
    const txt = await r.text();
    const rows = txt.trim().split('\n').slice(1).map(line => line.split(','));
    const bars = rows.map(c => ({ ticker: t, date: c[0], open: parseNum(c[1]), high: parseNum(c[2]), low: parseNum(c[3]), close: parseNum(c[4]), adjusted_close: parseNum(c[4]), volume: parseNum(c[5]), provider })).filter(b=>b.date&&b.close!==null);
    return bars.slice(-130);
  }
  throw new Error('provider not implemented');
}

export async function fetchCompanySnapshot(ticker) { const q = await fetchQuote(ticker); return { ticker: q.ticker, market_cap: q.market_cap, exchange: q.exchange, provider: q.provider, retrieved_at: q.retrieved_at }; }
export async function getMarketCap(ticker) { return (await fetchQuote(ticker)).market_cap; }
export async function getVolumeStats(ticker) { const q = await fetchQuote(ticker); return { volume: q.volume, average_volume: q.average_volume, provider: q.provider, retrieved_at: q.retrieved_at }; }

function byDate(bars){ return [...bars].sort((a,b)=>a.date.localeCompare(b.date)); }
export function calculatePreCatalystRunup(bars, catalystDate, lookbackDays=[30,60]) {
  const s = byDate(bars); const idx = s.findIndex(b=>b.date>=catalystDate); if (idx<=0) return { approximate: true, missing: 'missing' };
  const dayBefore = s[idx-1]; const out = { approximate: true };
  for (const d of lookbackDays) { const from = s[Math.max(0, idx-1-d)]; out[`runup_${d}d_percent`] = (from?.close && dayBefore.close) ? ((dayBefore.close-from.close)/from.close*100) : 'missing'; }
  const r = out.runup_30d_percent; out.label = typeof r === 'number' ? (r>35?'high':r>15?'moderate':'low') : 'missing'; return out;
}

export function calculatePostCatalystMove(bars, eventDate, windows=[1,3,5,10]) {
  const s = byDate(bars); const idx = s.findIndex(b=>b.date>=eventDate); if (idx<0) return { approximate: true, missing: 'missing' };
  const base = s[idx]; const out = { approximate: true };
  for (const w of windows) { const t = s[idx+w]; out[`move_${w}d_percent`] = (base?.close && t?.close) ? ((t.close-base.close)/base.close*100) : 'missing'; }
  return out;
}

export function calculateLiquidityFlags(q) {
  const flags = [];
  if ((q.average_volume ?? q.volume ?? 0) < 200000) flags.push('low average volume (approximate)');
  if ((q.price ?? 999) < 5) flags.push('penny-stock warning (approximate)');
  if ((q.market_cap ?? 1e12) < 300000000) flags.push('microcap warning (approximate)');
  if (q.delayed) flags.push('market data may be delayed');
  return flags;
}

export function calculateVolatilitySummary(bars) {
  const s = byDate(bars); if (s.length < 22) return { approximate: true, missing: 'missing' };
  const rets = []; for (let i=1;i<s.length;i++) if (s[i-1].close && s[i].close) rets.push((s[i].close-s[i-1].close)/s[i-1].close);
  const avg = rets.reduce((a,b)=>a+b,0)/rets.length;
  const vol = Math.sqrt(rets.reduce((a,b)=>a+Math.pow(b-avg,2),0)/(rets.length||1))*Math.sqrt(252);
  let peak=-Infinity, mdd=0; for (const b of s){ if ((b.close??0)>peak) peak=b.close??0; if (peak>0) mdd=Math.min(mdd, ((b.close??0)-peak)/peak); }
  return { approximate: true, realized_vol_20d: Number(vol.toFixed(4)), max_drawdown: Number(mdd.toFixed(4)), avg_daily_move: Number((avg*100).toFixed(2)) };
}
