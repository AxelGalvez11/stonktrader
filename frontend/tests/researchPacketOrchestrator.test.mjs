import test from 'node:test';
import assert from 'node:assert/strict';
import { runCompanyResearchPacket, runFinancialModelStep, buildPubMedQuery, buildFdaQuery, createSourceSnapshotsStep, buildResearchPacketSummary, optionallyDraftThesisStep, optionallyRunSynthesisStep } from '../src/features/biotech/lib/researchPacket/orchestratorCore.js';

test('orchestrator partial if sec fails and continues', async ()=>{
  const old=global.fetch;
  global.fetch=async (u)=>{ if(String(u).includes('/sec/filings')) throw new Error('sec down'); return { json: async()=>({ trials:[{nct_id:'N1',interventions:['D'],conditions:['C']}], quote:{price:10}, articles:[{title:'a'}], records:[] }) }; };
  const r=await runCompanyResearchPacket({ ticker:'ABC', options:{createDraftThesis:false,runSynthesis:false} });
  global.fetch=old;
  assert.equal(r.status,'partial');
  assert.ok(r.steps.some(s=>s.step==='pubmed'));
});

test('financial model preserves user assumption required placeholders', ()=>{
  const s=runFinancialModelStep({ ticker:'A',fundamentals:{company_type:'clinical_stage_biotech',financial_snapshot:{}},marketData:{},trials:[{interventions:['X'],conditions:['Y'],phase:'phase 2'}]});
  assert.ok(JSON.stringify(s.data).includes('user assumption required'));
});

test('pubmed and fda query builders use trial context', ()=>{
  assert.ok(buildPubMedQuery('VKTX','Viking',[{interventions:['VK2735'],conditions:['obesity']}]).includes('VK2735'));
  assert.ok(buildFdaQuery('CRSP','CRISPR',[{interventions:['exa-cel'],conditions:['sickle cell']}]).includes('exa-cel'));
});

test('source snapshots include user id', async ()=>{
  const x=await createSourceSnapshotsStep({ ticker:'A', userId:'u-1', options:{limitPerSource:2}, secFilings:[{filingType:'10-K'}], trials:[], pubmed:[], fda:[] });
  assert.equal(x.data[0].user_id,'u-1');
});

test('summary structure and forbidden wording cleanup', ()=>{
  const s=buildResearchPacketSummary({ ticker:'A', fundamentals:{ company_type:'x', key_risks:['buy now certain'] }, financialModel:{ warnings:['will go up'] } });
  assert.ok(s.fundamental_context.includes('Facts:') && s.fundamental_context.includes('Interpretations:'));
  assert.ok(Array.isArray(s.missing_data) && Array.isArray(s.suggested_follow_up_questions));
  const txt=JSON.stringify(s).toLowerCase();
  assert.ok(!txt.includes('buy') && !txt.includes('sell') && !txt.includes('certain'));
});

test('optional draft and synthesis can be skipped', async ()=>{
  const d=await optionallyDraftThesisStep({ options:{createDraftThesis:false} });
  const s=optionallyRunSynthesisStep({ options:{runSynthesis:false} });
  assert.equal(d.status,'skipped'); assert.equal(s.status,'skipped');
});
