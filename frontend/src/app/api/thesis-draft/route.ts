import { NextRequest, NextResponse } from 'next/server';
import { compressSources, generateStructuredThesisDraft } from '@/features/biotech/lib/ai/thesisDrafting';

export async function POST(req: NextRequest){
  try {
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
