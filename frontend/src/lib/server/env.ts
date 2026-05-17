export function envStatus() {
  const req = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];
  const opt = ['SEC_USER_AGENT','NCBI_TOOL','NCBI_EMAIL','AI_PROVIDER','AI_API_KEY','AI_MODEL','MARKET_DATA_PROVIDER','MARKET_DATA_API_KEY'];
  const required = Object.fromEntries(req.map((k)=>[k, Boolean(process.env[k])]));
  const optional = Object.fromEntries(opt.map((k)=>[k, Boolean(process.env[k])]));
  return { required, optional };
}
export function safeSetupMessage(name:string){ return `${name} is not configured. Configure environment variables and retry.`; }
