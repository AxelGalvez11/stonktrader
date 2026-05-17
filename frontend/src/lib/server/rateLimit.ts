const buckets = new Map<string, { count:number; reset:number }>();
export function checkRateLimit(key:string, limit=20, windowMs=60_000){ const now=Date.now(); const v=buckets.get(key); if(!v||v.reset<now){ buckets.set(key,{count:1,reset:now+windowMs}); return { ok:true }; } if(v.count>=limit) return { ok:false, retryAfterMs:v.reset-now }; v.count++; return { ok:true }; }
