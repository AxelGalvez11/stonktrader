const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseEnv() {
  return Boolean(base && key);
}

export async function sb(path: string, init: RequestInit = {}) {
  if (!base || !key) throw new Error('Missing Supabase env');
  const res = await fetch(`${base}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Supabase REST error: ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}
