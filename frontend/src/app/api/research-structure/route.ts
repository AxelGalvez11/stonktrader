import { NextRequest, NextResponse } from 'next/server';
import { structureResearchNote } from '@/features/biotech/lib/researchStructurer';

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json(structureResearchNote(body));
}
