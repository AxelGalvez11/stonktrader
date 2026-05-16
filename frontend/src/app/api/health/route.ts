import { NextResponse } from 'next/server';
import { envStatus } from '@/lib/server/env';

export async function GET(){
  const e = envStatus();
  const auth_mode = process.env.NODE_ENV === 'production'
    ? 'supabase'
    : (process.env.ALLOW_DEV_AUTH === 'true' ? 'dev_fallback_enabled' : 'supabase');
  return NextResponse.json({
    status:'ok',
    app:'biotech-paper-trading',
    auth_mode,
    dev_warning: process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_AUTH === 'true' ? 'Dev auth fallback enabled.' : null,
    required:e.required,
    optional:e.optional,
    note:'No secret values exposed.'
  });
}
