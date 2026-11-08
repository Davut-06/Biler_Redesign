import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import emailjs from '@emailjs/browser';

const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText).toString('base64');
const validationUrl=moduleUrl(fs.readFileSync(new URL('../src/utils/distributorEnquiry.ts',import.meta.url),'utf8'));
const source=fs.readFileSync(new URL('../src/utils/emailjsEnquiry.ts',import.meta.url),'utf8')
  .replace('"@emailjs/browser"',JSON.stringify(import.meta.resolve('@emailjs/browser')))
  .replace('"./distributorEnquiry"',JSON.stringify(validationUrl));
const {sendDistributorEnquiry}=await import(moduleUrl(source));
const values={company:'  Biler Partners  ',taxId:' DE123456789 ',name:' Jose\u0301 ',phone:' +49 (176) 123-4567 ',email:' test@example.com '};
const config={serviceId:'service_test',templateId:'template_test',publicKey:'public_test'};

test('valid submit maps every normalized field and timestamp to EmailJS',async context=>{
 const requests=[];
 context.mock.method(emailjs,'send',async(...args)=>{requests.push(args);return {status:200,text:'OK'};});
 const start=Date.now();await sendDistributorEnquiry(values,config);
 assert.equal(requests.length,1);
 const [service,template,payload,options]=requests[0];
 assert.equal(service,config.serviceId);assert.equal(template,config.templateId);
 assert.deepEqual(options,{publicKey:config.publicKey});
 const {time,...fields}=payload;
 assert.deepEqual(fields,{company_name:'Biler Partners',inn:'DE123456789',name:'José',phone_number:'+49 (176) 123-4567',email:'test@example.com'});
 assert(Date.parse(time)>=start&&Date.parse(time)<=Date.now());
});
test('EmailJS rejection and unconfirmed success are failures',async context=>{
 const mock=context.mock.method(emailjs,'send',async()=>{throw new Error('Provider failure');});
 await assert.rejects(sendDistributorEnquiry(values,config),/Provider failure/);
 mock.mock.mockImplementation(async()=>({status:202,text:'Unconfirmed'}));
 await assert.rejects(sendDistributorEnquiry(values,config),/did not confirm/);
});
test('missing or blank configuration never calls EmailJS',async context=>{
 const mock=context.mock.method(emailjs,'send',async()=>({status:200,text:'OK'}));
 const placeholders={serviceId:'your_service_id',templateId:'your_template_id',publicKey:'your_public_key'};
 for(const field of Object.keys(config))for(const value of [undefined,'','   ',placeholders[field]]){
  await assert.rejects(sendDistributorEnquiry(values,{...config,[field]:value}),/Missing EmailJS configuration/);
 }
 assert.equal(mock.mock.callCount(),0);
});
test('invalid data is rejected before EmailJS and input values are not mutated',async context=>{
 const mock=context.mock.method(emailjs,'send',async()=>({status:200,text:'OK'}));
 const input={...values,phone:'invalid'};const original={...input};
 await assert.rejects(sendDistributorEnquiry(input,config),/Invalid distributor enquiry/);
 assert.deepEqual(input,original);assert.equal(mock.mock.callCount(),0);
});
