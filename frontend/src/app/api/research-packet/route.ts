import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { checkRateLimit } from '@/lib/server/rateLimit';
import { sb } from '@/lib/supabase/rest';
import { runCompanyResearchPacket } from '@/features/biotech/lib/researchPacket/orchestrator';
import { handleResearchPacketCore } from '@/features/biotech/lib/researchPacket/routeHandler';

export async function handleResearchPacket(req: any, deps={ requireUserId, checkRateLimit, sb, runCompanyResearchPacket }){
  return handleResearchPacketCore(req, { ...deps, json: (body:any, status=200)=>NextResponse.json(body,{status}) });
}

export async function POST(req: NextRequest){ return handleResearchPacket(req); }
