import { NextRequest, NextResponse } from 'next/server';
import { searchTrialsByCompany } from '@/features/biotech/lib/clinical/clinicalTrials';

export async function GET(req: NextRequest) {
  try {
    const ticker = req.nextUrl.searchParams.get('ticker') || undefined;
    const company = req.nextUrl.searchParams.get('company') || undefined;
    if (!ticker && !company) return NextResponse.json({ error: 'ticker or company required' }, { status: 400 });
    const trials = await searchTrialsByCompany(company || ticker || '', ticker);
    return NextResponse.json({ trials });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
