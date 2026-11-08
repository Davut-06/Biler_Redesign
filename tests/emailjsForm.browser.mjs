// Run against local Vite with Chrome --headless=new --remote-debugging-port=9345.
// All EmailJS traffic is intercepted; no real email is sent.
import assert from 'node:assert/strict';
const base=process.env.FORM_TEST_URL??'http://127.0.0.1:5186';
const pages=await(await fetch('http://127.0.0.1:9345/json')).json();
const ws=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.onopen=r);let id=0;const pending=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id)}};
const call=(method,params={})=>new Promise(r=>{pending.set(++id,r);ws.send(JSON.stringify({id,method,params}))});
const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.error||r.result.exceptionDetails)throw Error(JSON.stringify(r));return r.result.result.value};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const until=async predicate=>{for(let i=0;i<100;i++){if(await predicate())return;await wait(50)}throw Error('Timed out waiting for form state')};
const requests=[];let held;let missingConfig=false;
ws.addEventListener('message',async e=>{const m=JSON.parse(e.data);if(m.method!=='Fetch.requestPaused')return;const p=m.params;
 if(p.request.url.includes('api.emailjs.com')){
  if(p.request.method==='OPTIONS')await call('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:204,responseHeaders:[{name:'Access-Control-Allow-Origin',value:'*'},{name:'Access-Control-Allow-Headers',value:'content-type'}]});
  else{requests.push(JSON.parse(p.request.postData));held=p.requestId;}
 }else{
  const result=await call('Fetch.getResponseBody',{requestId:p.requestId});
  let body=result.result.base64Encoded?Buffer.from(result.result.body,'base64').toString():result.result.body;
  if(missingConfig)body=body.replace(/VITE_EMAILJS_(?:SERVICE_ID|TEMPLATE_ID|PUBLIC_KEY)"\s*:\s*"[^"]*"/g,match=>match.replace(/:\s*"[^"]*"$/,':""'));
  await call('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:200,body:Buffer.from(body).toString('base64'),responseHeaders:[{name:'Content-Type',value:'text/javascript'}]});
 }
});
await call('Runtime.enable');await call('Network.enable');await call('Network.setCacheDisabled',{cacheDisabled:true});
await call('Fetch.enable',{patterns:[{urlPattern:'*api.emailjs.com/*',requestStage:'Request'},{urlPattern:'*/src/components/DistributorSection/DistributorSection.tsx*',requestStage:'Response'}]});
await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
const submit=()=>ev(`document.querySelector('#partners form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}))`);
const fill=()=>ev(`(()=>{const values={company:' Test Company ',taxId:' DE123456789 ',name:' Test Person ',phone:' +49 176 1234567 ',email:' test@example.com '};for(const [key,value] of Object.entries(values)){const i=document.querySelector('#partners [name="'+key+'"]');i.value=value;i.dispatchEvent(new Event('input',{bubbles:true}));}return values})()`);
const read=()=>ev(`Object.fromEntries([...document.querySelectorAll('#partners input')].map(i=>[i.name,i.value]))`);
const finish=async status=>{const requestId=held;held=undefined;await call('Fetch.fulfillRequest',{requestId,responseCode:status,body:Buffer.from(status===200?'OK':'Mock provider failure').toString('base64'),responseHeaders:[{name:'Access-Control-Allow-Origin',value:'*'},{name:'Content-Type',value:'text/plain'}]});await until(()=>ev(`!document.querySelector('#partners button[type="submit"]').disabled`));};
try{
 for(const lang of ['ru','en'])for(const width of [1440,390]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
  await call('Page.navigate',{url:base});await until(()=>ev(`!!document.querySelector('#partners form')`));
  await ev(`localStorage.setItem('biler-language','${lang}')`);await call('Page.reload',{ignoreCache:true});await wait(500);
  await until(()=>ev(`document.documentElement.lang==='${lang}'&&!!document.querySelector('#partners form')`));
  const count=requests.length;await submit();await wait(50);assert.equal(requests.length,count);
  assert.equal(await ev(`document.querySelectorAll('#partners [aria-invalid="true"]').length`),5);
  await fill();const values=await read();await submit();await until(()=>Boolean(held));
  assert(await ev(`document.querySelector('#partners button[type="submit"]').disabled`));
  assert.equal(await ev(`document.querySelector('#partners button[type="submit"]').textContent.trim()`),lang==='ru'?'Отправка...':'Sending...');
  await submit();await submit();await wait(100);assert.equal(requests.length,count+1);
  assert.equal(requests.at(-1).template_params.name,'Test Person');
  await finish(500);assert.deepEqual(await read(),values);
  assert.equal(await ev(`document.querySelector('#partners [role="status"]').textContent.trim()`),lang==='ru'?'Не удалось отправить заявку. Попробуйте ещё раз.':"We couldn't send your enquiry. Please try again.");
  await submit();await until(()=>Boolean(held));await finish(200);
  assert(Object.values(await read()).every(v=>v===''));
  assert.equal(await ev(`document.querySelector('#partners [role="status"]').textContent.trim()`),lang==='ru'?'Заявка успешно отправлена.':'Enquiry sent successfully.');
  assert.equal(await ev(`document.querySelector('#partners [role="status"]').getAttribute('aria-live')`),'polite');
  console.log('PASS mocked browser states',lang,width);
 }
 missingConfig=true;await call('Page.reload',{ignoreCache:true});await wait(500);await until(()=>ev(`!!document.querySelector('#partners form')`));
 await fill();const values=await read();const count=requests.length;await submit();
 await until(()=>ev(`document.querySelector('#partners [role="status"]').textContent.includes("couldn't")`));
 assert.equal(requests.length,count);assert.deepEqual(await read(),values);
 console.log('PASS missing configuration: localized error, values preserved, no request');
}finally{await call('Fetch.disable');ws.close();}
