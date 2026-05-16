const TICKERS = ['VRTX','REGN','GILD','AMGN','VKTX','BEAM','CRSP','ALT','NUVL','IDYA'];
const base = process.env.BASE_URL || 'http://localhost:3000';

for (const ticker of TICKERS) {
  const payload = { ticker, name: ticker, bucket: 'speculative', notes: 'Seeded for workflow QA', biotech_focus: true };
  try {
    const r = await fetch(`${base}/api/watchlist`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(payload) });
    const j = await r.json().catch(()=>({}));
    console.log(ticker, r.status, j.error ? `error:${j.error}` : 'ok');
  } catch (e) {
    console.log(ticker, 'failed', String(e.message||e));
  }
}
