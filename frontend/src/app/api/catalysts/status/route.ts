import { NextRequest, NextResponse } from 'next/server';
import { sb } from '@/lib/supabase/rest';

export async function POST(req: NextRequest) {
  try { const b=await req.json(); await sb(`catalysts?id=eq.${b.id}`, { method:'PATCH', body: JSON.stringify({ status:b.status, updated_at:new Date().toISOString() }), headers:{Prefer:'return=minimal'} }); return NextResponse.json({ ok:true }); }
  catch(e:any){ return NextResponse.json({ error:e.message },{status:500}); }
}
