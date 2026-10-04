import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createProjectHandler } from '../api/project-page.js';
const config = JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
const app = await readFile(new URL('../src/App.jsx',import.meta.url),'utf8');
const rules=config.rewrites;
const matches=(pattern,path)=>new RegExp('^'+pattern.replace(/:[a-z]+\*/gi,'.*').replace(/:[a-z]+/gi,'[^/]+')+'/?$').test(path);
const match=path=>rules.find(r=>matches(r.source,path));
test('Every declared React route retains a direct-link rewrite',()=>{
  let parent='';
  for(const line of app.split('\n')) {
    const path=line.match(/<Route path="([^"]+)"/);
    if(path){
      const p=path[1]; if(p==='*')continue;
      if(p==='/admin'||p==='/portal')parent=p;
      else if(p.startsWith('/'))parent='';
      const full=p.startsWith('/')?p:parent+'/'+p;
      if(full==='/')continue;
      const sample=full.replace(/:[a-zA-Z]+/g,'example');
      assert.ok(match(sample),`Missing routing for ${full}`);
    }
    if(line.includes('</Route>'))parent='';
  }
});
test('Unknown pages have no SPA fallback; private routes use noindex shell',async()=>{
  for(const path of ['/missing-page','/about/extra','/admin/not-a-page','/portal/not-a-page','/projects/a/extra'])assert.equal(match(path),undefined,path);
  for(const path of ['/admin','/portal/onboarding','/pay/test','/sign/test','/contracts/sign/test','/track/payment-success'])assert.equal(match(path).destination,'/app.html',path);
  assert.ok((await readFile(new URL('../public/404.html',import.meta.url),'utf8')).includes('noindex, nofollow'));
  assert.equal(match('/api/health').destination,'https://buildwithlami-jb12.onrender.com/api/:path*');
  assert.equal(match('/projects/vonnex2x-enterprise-erp').destination,'/seo/projects/vonnex2x-enterprise-erp.html');
});
const shell='<!-- SEO:START --><meta name="robots" content="noindex"><!-- SEO:END --><div id="root"></div>';
async function run({id='test-project',division='SOFTWARE',method='GET',status=200,project={title:'Test project',status:'PUBLISHED',division:'SOFTWARE'},throws=false}={}){
 const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},send(body){this.body=body;return this;},end(){return this;}};
 let requested;
 const handler=createProjectHandler({readShell:async()=>shell,fetchImpl:async url=>{requested=url;if(throws)throw Error('network');return {status,ok:status===200,json:async()=>project};}});
 await handler({method,query:{id,division}},res);
 return {...res,requested};
}
test('Published projects return indexable HTML and use the slug endpoint',async()=>{
 const r=await run();assert.equal(r.code,200);assert.ok(r.requested.includes('/slug/test-project'));assert.ok(r.body.includes('https://www.buildwithlami.com/projects/test-project'));assert.ok(!r.body.includes('content="noindex"'));assert.ok(r.body.includes('id="initial-page"'));
});
test('Missing, draft and wrong-division projects return real 404',async()=>{
 for(const input of [{status:404},{project:{title:'Draft',status:'DRAFT',division:'SOFTWARE'}},{division:'DRONE'},{id:'../bad'},{id:['a','b']}]){const r=await run(input);assert.equal(r.code,404);assert.equal(r.headers['X-Robots-Tag'],'noindex, nofollow');}
});
test('Backend failure returns retryable 503, not false 404',async()=>{
 for(const input of [{status:500},{throws:true}]){const r=await run(input);assert.equal(r.code,503);assert.equal(r.headers['Retry-After'],'60');}
});
test('Legacy IDs redirect to canonical local case studies',async()=>{
 const r=await run({id:'1'});assert.equal(r.code,308);assert.equal(r.headers.Location,'/projects/vonnex2x-enterprise-erp');assert.equal(r.requested,undefined);
});
test('Unsafe methods cannot trigger project rendering',async()=>assert.equal((await run({method:'POST'})).code,405));
test('Project titles cannot inject executable HTML',async()=>{
 const r=await run({project:{title:'<script>alert(1)</script>',status:'PUBLISHED',division:'SOFTWARE'}});assert.equal(r.code,200);assert.ok(!r.body.includes('<script>alert(1)</script>'));
});
