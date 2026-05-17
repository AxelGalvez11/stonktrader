export async function handleResearchPacketCore(req, deps){
  try{
    const userId = await deps.requireUserId(req);
    const rl = deps.checkRateLimit(`${userId}:${req.nextUrl.pathname}`, 5, 60_000);
    if(!rl.ok) return deps.json({ error:'Rate limit exceeded. Try again shortly.' }, 429);
    const body = await req.json();
    const ticker = String(body?.ticker||'').toUpperCase();
    if(!ticker) return deps.json({ error:'ticker required' }, 400);
    const packet = await deps.runCompanyResearchPacket({ ...body, ticker, userId, base:req.nextUrl.origin });
    if ((packet.sources_created||[]).length) {
      await deps.sb('sources', { method:'POST', body: JSON.stringify((packet.sources_created||[]).map((s)=>({ source_type:s.source_type,title:s.title,url:s.source_url,retrieved_at:new Date().toISOString(),raw_text:String(s.raw_text||'').slice(0,120000),summary:'research packet snapshot',metadata:{ ticker:packet.ticker, user_id:userId } }))) });
    }
    return deps.json(packet, 200);
  }catch(e){ return deps.json({ error:e.message||'Research packet failed' }, e?.message==='Unauthorized'?401:500); }
}
