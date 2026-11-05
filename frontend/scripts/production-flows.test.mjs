import test from 'node:test';
import assert from 'node:assert/strict';
import { createServiceAvailability } from '../src/utils/serviceAvailability.js';
import { authReturnTo } from '../src/utils/authReturnTo.js';
import { AUTH_EMAIL_TIMEOUT_MS } from '../src/config/apiPolicy.js';

const tick = () => new Promise(resolve => setImmediate(resolve));

test('concurrent callers share readiness; one cancellation does not cancel another submission', async () => {
  let release; let checks=0;
  const availability=createServiceAvailability({check:()=>{checks++;return new Promise(resolve=>{release=resolve;});}});
  const cancelled=new AbortController();
  const first=availability.ensure(cancelled.signal);
  const firstRejected=assert.rejects(first,{name:'AbortError'});
  const second=availability.ensure();
  await tick(); cancelled.abort(); await firstRejected;
  assert.equal(checks,1);release();await second;
  await availability.ensure();assert.equal(checks,1);
});

test('failed readiness can be retried and cached readiness expires', async () => {
  let checks=0;let now=100;
  const availability=createServiceAvailability({now:()=>now,freshForMs:100,check:async()=>{if(++checks===1)throw Error('Starting');}});
  await assert.rejects(availability.ensure(),/Starting/);
  await availability.ensure();await availability.ensure();assert.equal(checks,2);
  now=201;await availability.ensure();assert.equal(checks,3);
  availability.invalidate();await availability.ensure();assert.equal(checks,4);
  const controller=new AbortController();controller.abort();
  await assert.rejects(availability.ensure(controller.signal),{name:'AbortError'});assert.equal(checks,4);
});

test('admin and client login keep deep links, filters and fragments', () => {
  assert.equal(authReturnTo({search:'?from='+encodeURIComponent('/admin/invoices?status=paid#recent')}),'/admin/invoices?status=paid#recent');
  assert.equal(authReturnTo({state:{from:{pathname:'/portal/invoices',search:'?status=due',hash:'#balance'}}},'portal'),'/portal/invoices?status=due#balance');
  assert.equal(authReturnTo({state:{from:'/admin/tasks'}}),'/admin/tasks');
});

test('login return addresses reject external destinations and cross-area navigation', () => {
  for(const from of ['https://bad.example/admin','//bad.example/admin','/admin/../../outside','/portal/invoices','/admin\\bad','/admin/\ninvalid']) {
    assert.equal(authReturnTo({search:'?from='+encodeURIComponent(from)}),'/admin',from);
  }
  assert.equal(authReturnTo({search:'?from=/admin/invoices'},'portal'),'/portal');
  assert.equal(authReturnTo({state:{from:{pathname:'/portal/login'}}},'portal'),'/portal');
});

let moduleNumber=0;
async function client(t,handler) {
  const events=[];const keys=['fetch','localStorage','window','CustomEvent'];
  const descriptors=Object.fromEntries(keys.map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
  const values={
    fetch:handler,
    localStorage:{getItem:key=>({admin_token:'test-admin',client_token:'test-client'})[key]||null},
    window:{dispatchEvent:event=>events.push(event)},
    CustomEvent:class extends Event {constructor(type,options){super(type);this.detail=options.detail;}},
  };
  for(const key of keys)Object.defineProperty(globalThis,key,{configurable:true,writable:true,value:values[key]});
  t.after(()=>{for(const key of keys){if(descriptors[key])Object.defineProperty(globalThis,key,descriptors[key]);else delete globalThis[key];}});
  t.mock.method(console,'error',()=>{});
  const {api}=await import(`../src/services/api.js?test=${++moduleNumber}`);
  return {api,events};
}
const healthy = () => Response.json({status:'ok'});

test('a submission waits for readiness and is sent once with its original body', async t => {
  let release;const calls=[];
  const {api}=await client(t,async(url,options)=>{calls.push({url,options});if(url==='/api/health')return new Promise(resolve=>{release=()=>resolve(healthy());});return Response.json({id:'saved'},{status:201});});
  const pending=api.post('/contact',{message:'My project'}, {}, 'none');
  await tick();assert.deepEqual(calls.map(c=>c.url),['/api/health']);release();
  const result=await pending;assert.equal(result.status,201);assert.equal(calls.length,2);
  assert.equal(calls[1].options.body,JSON.stringify({message:'My project'}));
  assert.equal(calls[1].options.headers.Authorization,undefined);
});

test('failed readiness prevents a write and an explicit retry can submit later', async t => {
  let checks=0;let writes=0;
  const {api}=await client(t,async url=>{if(url==='/api/health')return ++checks===1?Response.json({error:'Starting'},{status:503}):healthy();writes++;return Response.json({saved:true});});
  assert.equal((await api.post('/contact',{message:'Keep this'})).ok,false);assert.equal(writes,0);
  assert.equal((await api.post('/contact',{message:'Keep this'})).ok,true);assert.equal(writes,1);
});

test('the API preserves query filters, authentication scopes and 401 notifications', async t => {
  const calls=[];
  const {api,events}=await client(t,async(url,options)=>{calls.push({url,options});return url==='/api/health'?healthy():Response.json({error:'Unauthorized'},{status:401});});
  await api.get('/tasks',{params:{division:'DRONE',q:'A&B'}},'client');
  assert.equal(calls[1].url,'/api/tasks?division=DRONE&q=A%26B');
  assert.equal(calls[1].options.headers.Authorization,'Bearer test-client');
  assert.equal(events[0].detail.auth,'client');
  await api.post('/auth/login',{email:'fake@isolated.test'}, {}, 'none');
  assert.equal(events.length,1);
  assert.equal(calls.at(-1).options.headers.Authorization,undefined);
});

test('request timeout remains active while reading the response body', {timeout:2000}, async t => {
  const {api}=await client(t,async(url,options)=>url==='/api/health'?healthy():{
    ok:true,status:200,text:()=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true})),
  });
  const result=await api.get('/invoices',{timeout:5});
  assert.equal(result.ok,false);assert.equal(result.status,0);assert.equal(result.error,'Request timed out');
});

test('multipart upload retains its boundary and has a working timeout', {timeout:2000}, async t => {
  let upload;
  const {api}=await client(t,async(url,options)=>{
    if(url==='/api/health')return healthy();upload=options;
    return new Promise((_,reject)=>options.signal.addEventListener('abort',()=>reject(options.signal.reason),{once:true}));
  });
  const result=await api.upload('/upload',new Blob(['abc'],{type:'image/png'}),{timeout:5});
  assert.equal(result.ok,false);assert.equal(result.error,'Request timed out');
  assert.equal(upload.headers['Content-Type'],undefined);assert.equal(upload.headers.Authorization,'Bearer test-admin');
  assert.equal(upload.body.get('image').size,3);
});

test('invalid HTML responses are not treated as successful data; failed writes are not replayed', async t => {
  let writes=0;
  const {api}=await client(t,async(url,options)=>{
    if(url==='/api/health')return healthy();
    if(options.method==='POST'){writes++;return Response.json({error:'Please retry'},{status:503});}
    return new Response('<html>Unavailable</html>',{status:200});
  });
  assert.equal((await api.get('/clients')).ok,false);
  const result=await api.post('/invoices',{amount:100,currency:'USD'});
  assert.equal(result.status,503);assert.equal(result.error,'Please retry');assert.equal(writes,1);
  assert.ok(AUTH_EMAIL_TIMEOUT_MS>20_000);
});
