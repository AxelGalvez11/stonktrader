'use client';
import { useEffect, useMemo, useState } from 'react';
import CatalystAlertsPanel from '@/features/biotech/components/CatalystAlertsPanel';

export default function CatalystsPage(){
  const [items,setItems]=useState<any[]>([]); const [alerts,setAlerts]=useState<any[]>([]);
  const [f,setF]=useState({ ticker:'', risk:'', status:'', window:'all', view:'list' });
  const [outcome,setOutcome]=useState<any>({ id:'', outcome:'', actual_event_date:'', outcome_summary:'', source_url:'', notes:'', paper_trade_id:'' });
  async function load(){ const c=await fetch('/api/catalysts'); if(c.ok){ const j=await c.json(); setItems(j);} const a=await fetch('/api/catalyst-alerts'); if(a.ok){ setAlerts((await a.json()).alerts||[]);} }
  useEffect(()=>{load();},[]);
  const filtered=useMemo(()=>items.filter(c=>!f.ticker||c.ticker===f.ticker.toUpperCase()).filter(c=>!f.risk||c.risk_level===f.risk).filter(c=>!f.status||c.status===f.status).filter(c=>{ if(f.window==='week'){const d=new Date(c.expected_date); const now=new Date(); return (d.getTime()-now.getTime())/86400000<=7;} if(f.window==='month'){const d=new Date(c.expected_date); const now=new Date(); return (d.getTime()-now.getTime())/86400000<=30;} return true;}),[items,f]);
  const groups=useMemo(()=>filtered.reduce((m,c)=>{const k=(c.expected_date||'missing').slice(0,7); (m[k]=m[k]||[]).push(c); return m;},{} as any),[filtered]);
  async function saveOutcome(e:any){ e.preventDefault(); await fetch('/api/catalysts/outcome',{method:'POST',body:JSON.stringify(outcome)}); setOutcome({ id:'', outcome:'', actual_event_date:'', outcome_summary:'', source_url:'', notes:'', paper_trade_id:''}); await load(); }
  const now=Date.now();
  const upcomingCount=filtered.filter(c=>c.expected_date&&new Date(c.expected_date).getTime()>=now).length;
  const overdueCount=filtered.filter(c=>c.expected_date&&new Date(c.expected_date).getTime()<now&&!c.outcome).length;
  const openTradeCount=filtered.filter(c=>c.status==='paper_trade_open').length;
  const missingThesisCount=filtered.filter(c=>!c.thesis_id||c.status==='thesis_needed').length;
  const missingSynthesisCount=filtered.filter(c=>c.status==='synthesis_needed').length;
  const reviewNeededCount=filtered.filter(c=>c.status==='event_passed_review_needed').length;
  return <div className='p-6 space-y-4'>
    <h1 className='text-2xl font-semibold'>Catalyst Calendar</h1><p className='text-sm text-zinc-400'>Research alerts only. Possible catalyst windows do not guarantee data release. Paper-trading only; no buy/sell alerts.</p>
    <div className='grid grid-cols-6 gap-2 text-xs'>
      <div className='bg-zinc-900 border border-zinc-800 rounded p-2'>Upcoming: {upcomingCount}</div><div className='bg-zinc-900 border border-zinc-800 rounded p-2'>Overdue: {overdueCount}</div><div className='bg-zinc-900 border border-zinc-800 rounded p-2'>Open paper trades: {openTradeCount}</div><div className='bg-zinc-900 border border-zinc-800 rounded p-2'>Missing thesis: {missingThesisCount}</div><div className='bg-zinc-900 border border-zinc-800 rounded p-2'>Missing synthesis: {missingSynthesisCount}</div><div className='bg-zinc-900 border border-zinc-800 rounded p-2'>Review needed: {reviewNeededCount}</div>
    </div>
    <div className='grid grid-cols-6 gap-2 text-sm'>
      <input className='bg-zinc-800 p-2 rounded' placeholder='Ticker' value={f.ticker} onChange={e=>setF({...f,ticker:e.target.value})}/>
      <select className='bg-zinc-800 p-2 rounded' value={f.risk} onChange={e=>setF({...f,risk:e.target.value})}><option value=''>All risk</option><option>low</option><option>medium</option><option>high</option></select>
      <select className='bg-zinc-800 p-2 rounded' value={f.status} onChange={e=>setF({...f,status:e.target.value})}><option value=''>All status</option>{['upcoming','thesis_needed','synthesis_needed','paper_trade_open','event_passed_review_needed','reviewed','archived'].map(s=><option key={s}>{s}</option>)}</select>
      <select className='bg-zinc-800 p-2 rounded' value={f.window} onChange={e=>setF({...f,window:e.target.value})}><option value='all'>All</option><option value='week'>This week</option><option value='month'>This month</option></select>
      <select className='bg-zinc-800 p-2 rounded' value={f.view} onChange={e=>setF({...f,view:e.target.value})}><option value='list'>List</option><option value='month'>By month</option></select>
      <button className='bg-zinc-700 rounded px-3' onClick={load}>Refresh</button>
    </div>
    {f.view==='list'?<div className='space-y-2'>{filtered.map(c=><div key={c.id} className='bg-zinc-900 border border-zinc-800 rounded p-3 text-sm'><div><b>{c.ticker}</b> {c.title}</div><div>{c.expected_date} • {c.risk_level} • {c.status} • {c.catalyst_type||'other'}</div></div>)}</div>:<div className='space-y-2'>{Object.entries(groups).map(([m,arr]:any)=><div key={m} className='bg-zinc-900 border border-zinc-800 rounded p-3'><div className='font-semibold'>{m}</div>{arr.map((c:any)=><div key={c.id} className='text-sm'>{c.ticker} {c.title} ({c.expected_date})</div>)}</div>)}</div>}
    <div className='bg-zinc-900 border border-zinc-800 rounded p-4 space-y-2'><h2 className='font-semibold'>Research Alerts</h2><CatalystAlertsPanel alerts={alerts.slice(0,20)} /></div>
    <form onSubmit={saveOutcome} className='bg-zinc-900 border border-zinc-800 rounded p-4 grid grid-cols-2 gap-2'>
      <input className='bg-zinc-800 p-2 rounded' placeholder='Catalyst ID' value={outcome.id} onChange={e=>setOutcome({...outcome,id:e.target.value})} required/>
      <input className='bg-zinc-800 p-2 rounded' placeholder='Linked paper_trade_id (optional)' value={outcome.paper_trade_id} onChange={e=>setOutcome({...outcome,paper_trade_id:e.target.value})}/>
      <input className='bg-zinc-800 p-2 rounded' placeholder='Catalyst outcome' value={outcome.outcome} onChange={e=>setOutcome({...outcome,outcome:e.target.value})} required/>
      <input className='bg-zinc-800 p-2 rounded' type='date' value={outcome.actual_event_date} onChange={e=>setOutcome({...outcome,actual_event_date:e.target.value})}/>
      <input className='bg-zinc-800 p-2 rounded col-span-2' placeholder='Outcome summary' value={outcome.outcome_summary} onChange={e=>setOutcome({...outcome,outcome_summary:e.target.value})}/>
      <input className='bg-zinc-800 p-2 rounded' placeholder='Source URL' value={outcome.source_url} onChange={e=>setOutcome({...outcome,source_url:e.target.value})}/>
      <input className='bg-zinc-800 p-2 rounded' placeholder='Notes' value={outcome.notes} onChange={e=>setOutcome({...outcome,notes:e.target.value})}/>
      <button className='bg-blue-600 rounded px-3 py-2 col-span-2'>Save outcome</button>
    </form>
  </div>
}
