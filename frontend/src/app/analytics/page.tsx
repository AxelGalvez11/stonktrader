'use client';
import { useEffect, useState } from 'react';
import AnalyticsOverviewCards from '@/features/biotech/components/analytics/AnalyticsOverviewCards';
import MistakePatternTable from '@/features/biotech/components/analytics/MistakePatternTable';
import RiskBlindSpotPanel from '@/features/biotech/components/analytics/RiskBlindSpotPanel';
import ThesisQualityPanel from '@/features/biotech/components/analytics/ThesisQualityPanel';
import CatalystTypePerformanceTable from '@/features/biotech/components/analytics/CatalystTypePerformanceTable';
import AlertReviewAssociationsPanel from '@/features/biotech/components/analytics/AlertReviewAssociationsPanel';
import LearningRecommendationsPanel from '@/features/biotech/components/analytics/LearningRecommendationsPanel';

export default function AnalyticsPage(){
  const [data,setData]=useState<any>(null);
  useEffect(()=>{ fetch('/api/analytics/learning').then(r=>r.json()).then(setData).catch(()=>setData({})); },[]);
  if(!data) return <div className='p-6'>Loading analytics...</div>;
  return <div className='p-6 space-y-4'>
    <h1 className='text-2xl font-semibold'>Learning Analytics Dashboard</h1>
    <p className='text-sm text-zinc-400'>Observed patterns in your paper-trade history for learning only; not predictive and not buy/sell advice.</p>
    <AnalyticsOverviewCards overview={data.overview||{}} />
    <MistakePatternTable data={data.mistake_patterns||{}} />
    <RiskBlindSpotPanel data={data.risk_blind_spots||{}} />
    <ThesisQualityPanel data={data.thesis_quality||{}} />
    <CatalystTypePerformanceTable data={data.catalyst_type_analysis||{}} />
    <AlertReviewAssociationsPanel data={data.alert_review_associations||{}} />
    <LearningRecommendationsPanel data={data.recommendations||[]} />
    {data.missing_data?.length>0 && <div className='bg-amber-950/30 border border-amber-800 rounded p-3 text-xs'>Missing data warnings: {data.missing_data.slice(0,8).map((m:any,i:number)=><span key={i} className='mr-2'>{m.code||m.type}</span>)}</div>}
  </div>
}
