import { NextRequest, NextResponse } from 'next/server';
import { compressSources, generateStructuredThesisDraft, validateAiThesisDraft } from '@/features/biotech/lib/ai/thesisDrafting';

export async function POST(req: NextRequest){
  try {
    const body = await req.json();
    if (!body?.selectedSources?.length) return NextResponse.json({ error:'Select at least one source before drafting.' }, { status: 400 });
    const prepared = { ...body, selectedSources: compressSources(body.selectedSources) };
    const draft = await generateStructuredThesisDraft(prepared);
    const validation = validateAiThesisDraft(draft);
    return NextResponse.json({ draft, validation });
  } catch (e:any){
    return NextResponse.json({ error: e.message || 'Draft generation failed. Manual builder remains available.' }, { status: 500 });
  }
}
