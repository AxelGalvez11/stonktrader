import { NextRequest, NextResponse } from 'next/server';
import { fetchTrialByNctId } from '@/features/biotech/lib/clinical/clinicalTrials';

export async function GET(_req: NextRequest, { params }: { params: { nctId: string } }) {
  try {
    const trial = await fetchTrialByNctId(params.nctId);
    return NextResponse.json(trial);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
