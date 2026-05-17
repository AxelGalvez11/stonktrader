import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeTicker, calculatePreCatalystRunup, calculatePostCatalystMove, calculateLiquidityFlags, calculateVolatilitySummary, getMarketDataProvider } from '../src/features/biotech/lib/market/marketData.js';

test('ticker normalization', ()=>{ assert.equal(normalizeTicker(' vktx '), 'VKTX'); });

test('pre-catalyst run-up calculation', ()=>{
  const bars = []; for(let i=1;i<=70;i++) bars.push({ date:`2026-01-${String(i).padStart(2,'0')}`, close:i });
  const r=calculatePreCatalystRunup(bars,'2026-01-65',[30,60]);
  assert.equal(typeof r.runup_30d_percent,'number');
});

test('post-catalyst move calculation', ()=>{
  const bars=[]; for(let i=1;i<=20;i++) bars.push({ date:`2026-02-${String(i).padStart(2,'0')}`, close:100+i });
  const r=calculatePostCatalystMove(bars,'2026-02-05',[1,3,5,10]);
  assert.equal(typeof r.move_1d_percent,'number');
});

test('liquidity flag detection and stale/delayed warning', ()=>{
  const f=calculateLiquidityFlags({ price:2, volume:1000, average_volume:1000, market_cap:100000000, delayed:true });
  assert.ok(f.some(x=>x.includes('delayed')));
});

test('volatility summary', ()=>{
  const bars=[]; for(let i=1;i<=40;i++) bars.push({ date:`2026-03-${String(i).padStart(2,'0')}`, close:100+Math.sin(i)*5 });
  const v=calculateVolatilitySummary(bars);
  assert.equal(v.approximate,true);
});

test('missing provider fails gracefully', ()=>{
  const old=process.env.MARKET_DATA_PROVIDER; const oldk=process.env.MARKET_DATA_API_KEY;
  process.env.MARKET_DATA_PROVIDER='finnhub'; delete process.env.MARKET_DATA_API_KEY;
  assert.throws(()=>getMarketDataProvider());
  process.env.MARKET_DATA_PROVIDER=old; process.env.MARKET_DATA_API_KEY=oldk;
});
