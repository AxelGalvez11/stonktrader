import { NextRequest } from 'next/server';

function isDevFallbackAllowed() {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_AUTH === 'true';
}

export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export async function getAuthenticatedUser(req: NextRequest): Promise<{ id: string } | null> {
  const supabase = createServerSupabaseClient();
  const authHeader = req.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const cookieToken = req.cookies.get('sb-access-token')?.value || null;
  const token = bearer || cookieToken;

  if (supabase && token) {
    const r = await fetch(`${supabase.url}/auth/v1/user`, { headers: { apikey: supabase.key, Authorization: `Bearer ${token}` } });
    if (r.ok) {
      const u = await r.json();
      if (u?.id) return { id: u.id };
    }
  }

  if (isDevFallbackAllowed()) {
    const devId = process.env.DEV_USER_ID || req.headers.get('x-user-id');
    if (devId) return { id: devId };
  }
  return null;
}

export async function requireAuthenticatedUser(req: NextRequest): Promise<{ id: string }> {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    if (process.env.NODE_ENV === 'production') throw new Error('Authentication required via Supabase session.');
    throw new Error('Authentication required. For local dev set ALLOW_DEV_AUTH=true with DEV_USER_ID.');
  }
  return user;
}

export async function requireUserId(req: NextRequest): Promise<string> {
  const user = await requireAuthenticatedUser(req);
  return user.id;
}
