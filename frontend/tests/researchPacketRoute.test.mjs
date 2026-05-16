import test from 'node:test';
import assert from 'node:assert/strict';
import { handleResearchPacketCore } from '../src/features/biotech/lib/researchPacket/routeHandler.js';

const req = (body={})=>({ nextUrl:{ pathname:'/api/research-packet', origin:'http://localhost:3000' }, json: async()=>body });
const depsBase = { json:(body,status=200)=>({status,body}), sb:async()=>[] };

test('unauthenticated request rejected', async()=>{
  const r=await handleResearchPacketCore(req({ticker:'A'}), { ...depsBase, requireUserId:async()=>{throw new Error('Unauthorized');}, checkRateLimit:()=>({ok:true}), runCompanyResearchPacket:async()=>({}) });
  assert.equal(r.status,401);
});

test('rate limit returns 429', async()=>{
  const r=await handleResearchPacketCore(req({ticker:'A'}), { ...depsBase, requireUserId:async()=> 'u1', checkRateLimit:()=>({ok:false}), runCompanyResearchPacket:async()=>({}) });
  assert.equal(r.status,429);
});

test('invalid ticker validation', async()=>{
  const r=await handleResearchPacketCore(req({}), { ...depsBase, requireUserId:async()=> 'u1', checkRateLimit:()=>({ok:true}), runCompanyResearchPacket:async()=>({}) });
  assert.equal(r.status,400);
});

test('authenticated success and partial response shape', async()=>{
  const r=await handleResearchPacketCore(req({ticker:'A'}), { ...depsBase, requireUserId:async()=> 'u1', checkRateLimit:()=>({ok:true}), runCompanyResearchPacket:async()=>({ticker:'A',status:'partial',sources_created:[],warnings:['w']}) });
  assert.equal(r.status,200);
  assert.equal(r.body.status,'partial');
  assert.ok(!JSON.stringify(r.body).toLowerCase().includes('api_key'));
});
