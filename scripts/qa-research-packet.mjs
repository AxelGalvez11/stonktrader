#!/usr/bin/env node
const base = process.env.QA_BASE_URL || 'http://localhost:3001';
const tickers = (process.env.QA_TICKERS || 'VRTX,REGN,GILD,VKTX,CRSP').split(',').map(x=>x.trim()).filter(Boolean);
const options = { createSourceSnapshots:false, createDraftThesis:true, runSynthesis:true };

async function runTicker(ticker){
  const res = await fetch(`${base}/api/research-packet`, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ ticker, options }) });
  const json = await res.json();
  return { ticker, http_status: res.status, packet: json };
}

const out=[];
for(const t of tickers){
  try{ out.push(await runTicker(t)); }
  catch(e){ out.push({ ticker:t, http_status:0, packet:{ error:String(e.message||e) } }); }
}
console.log(JSON.stringify({ base, tickers, generated_at: new Date().toISOString(), results: out }, null, 2));
