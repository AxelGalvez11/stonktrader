import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/server/auth';
import { checkRateLimit } from '@/lib/server/rateLimit';
import { compressSources, generateStructuredThesisDraft } from '@/features/biotech/lib/ai/thesisDrafting';

export async function POST(req: NextRequest){
  try {
    const userId = await requireUserId(req);
    const rl = checkRateLimit(`${userId}:${req.nextUrl.pathname}`, 10, 60_000); if(!rl.ok) return NextResponse.json({ error:'Rate limit exceeded. Try again shortly.' }, { status:429 });
    const body = await req.json();
    if (!body?.selectedSources?.length) return NextResponse.json({ error:'Select at least one source before drafting.' }, { status: 400 });
    const compressed = compressSources(body.selectedSources);
    const result = await generateStructuredThesisDraft({ ...body, selectedSources: compressed });
    if (!result.validation.ok) return NextResponse.json(result, { status: 422 });
    return NextResponse.json(result);
  } catch (e:any){
    return NextResponse.json({ error: e.message || 'Draft generation failed. Manual builder remains available.' }, { status: 500 });
  }
}
