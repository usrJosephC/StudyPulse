// Technical QA, synthetic local accounts only. No secrets are written to evidence.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(path.join(os.tmpdir(), 'studypulse-qa-tools/node_modules/playwright'));
const OUT = __dirname;
const APP = 'http://localhost:8093';
const API = 'http://localhost:54321';
const env = fs.readFileSync(path.resolve(__dirname, '../../../study-pulse-app/.env.example'), 'utf8');
const key = env.match(/^EXPO_PUBLIC_SUPABASE_ANON_KEY=(.+)$/m)[1].trim();
const email = 'qa.run17a@studypulse.local', password = 'StudyPulseP1!2026';
const results = [];
let browser, context, page, token, uid;
async function api(route, method='GET', body, bearer=token) {
  const r = await fetch(API+route,{method,headers:{apikey:key,Authorization:`Bearer ${bearer||key}`,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await r.text(); let data;try{data=JSON.parse(text)}catch{data=text.slice(0,80)}return {status:r.status,data};
}
function record(id, step, pass, detail) { results.push({id,step,status:pass?'PASS':'FAIL',detail}); fs.writeFileSync(path.join(OUT,'ui-results.json'),JSON.stringify(results,null,2)); console.log(id,step,pass?'PASS':'FAIL',detail); }
async function shot(name) { await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:false}); }
async function step(id, name, work) { try{await work()}catch(e){record(id,name,false,String(e.message));await shot(id+'-'+name.replace(/[^a-z0-9]/gi,'_')+'-failure').catch(()=>{});} }
async function login(p=page, mail=email, pass=password) {
  await p.goto(APP); await p.getByPlaceholder('E-mail',{exact:true}).fill(mail);await p.getByPlaceholder('Senha',{exact:true}).fill(pass);
  await p.getByRole('checkbox').click();await p.getByRole('button',{name:'Entrar',exact:true}).click();
  await p.getByRole('tab',{name:/Início/}).waitFor({timeout:15000});
}
async function tab(name){await page.getByRole('tab',{name:new RegExp(name)}).click();await page.waitForTimeout(350);}
async function prefs(){await tab('Perfil');await page.getByRole('button',{name:'Preferências',exact:true}).click();await page.getByRole('switch').waitFor();}
async function closePrefs(){await page.getByRole('button',{name:'Voltar',exact:true}).last().click();}
async function goalCreate(name){await tab('Metas');await page.getByRole('button',{name:'Adicionar nova meta',exact:true}).click();await page.getByLabel('Categoria',{exact:true}).fill('IHC');await page.getByLabel('Título',{exact:true}).fill(name);await page.getByLabel('Duração da meta em dias').fill('7');await page.getByRole('button',{name:'Salvar',exact:true}).click();await page.getByText(name,{exact:true}).waitFor();}
async function goalRow(name){return (await api('/rest/v1/goals?select=*&user_id=eq.'+uid+'&title=eq.'+encodeURIComponent(name))).data[0];}
async function run(){
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 context=await browser.newContext({viewport:{width:460,height:836},reducedMotion:'no-preference',recordVideo:{dir:path.join(OUT,'videos'),size:{width:460,height:836}}});
 page=await context.newPage();page.setDefaultTimeout(8000);
 page.on('pageerror',e=>record('runtime','pageerror',false,e.message));
 const auth=await api('/auth/v1/token?grant_type=password','POST',{email,password});token=auth.data.access_token;uid=auth.data.user?.id;if(!uid)throw Error('Local auth fixture unavailable');
 await login();record('CT08','valid-login',true,'Real UI login to local API; protected tabs visible');await shot('CT08-login');
 await page.reload();await page.getByRole('tab',{name:/Início/}).waitFor();record('CT08','session-reload',true,'Session persisted across reload');
 await step('CT03','goal-cycle',async()=>{
  const name='QA17 PW meta '+Date.now();await goalCreate(name);let row=await goalRow(name);const due=row.due_date;await shot('CT03-PW-created');
  await page.getByRole('button',{name:'Editar meta',exact:true}).first().click();await page.getByLabel('Título',{exact:true}).fill(name+' editada');await page.getByRole('button',{name:'Atualizar meta',exact:true}).click();await page.waitForTimeout(400);
  row=await goalRow(name+' editada');record('CT03','duration-preserved',row?.due_date===due,JSON.stringify({id:row?.id,due,after:row?.due_date}));
  for(let i=0;i<4;i++){await page.getByRole('button',{name:/^(Iniciar meta|Continuar estudando|Concluir meta)/}).first().click();await page.waitForTimeout(500);}
  row=await goalRow(name+' editada');record('CT03','completed',!!row?.completed_at,JSON.stringify({id:row?.id,progress:row?.progress,completed:!!row?.completed_at}));
  await page.reload();await page.getByRole('tab',{name:/Metas/}).waitFor();await tab('Metas');await page.getByRole('button',{name:'Abrir histórico de metas arquivadas'}).click();
  await page.getByText(name+' editada',{exact:true}).waitFor();await shot('CT03-history');record('CT03','history-reload',true,'Completed goal present in history after reload');await page.getByRole('button',{name:'Fechar histórico'}).click();
 });
 await step('CT10','archive-ui',async()=>{
  const name='QA17 PW arquivo '+Date.now();await page.reload();await page.getByRole('tab',{name:/Metas/}).waitFor();await goalCreate(name);const before=await goalRow(name);
  await page.getByRole('button',{name:'Arquivar meta',exact:true}).first().click();await page.waitForTimeout(700);const after=await goalRow(name);
  record('CT10','archive-ui',!!after?.archived_at,JSON.stringify({id:before.id,archived:after?.archived_at??null,dialogCount:await page.getByRole('dialog').count()}));await shot('CT10-archive-click');
 });
 await step('CT04','preference-persistence',async()=>{
  await prefs();const sw=page.getByRole('switch');await sw.check();await page.reload();await page.getByRole('tab',{name:/Perfil/}).waitFor();await prefs();
  record('CT04','persisted',await page.getByRole('switch').isChecked(),'Internal switch remained checked after reload');await shot('CT04-persisted');await closePrefs();
 });
 await step('CT05','system-precedence',async()=>{
  await page.reload();await page.getByRole('tab',{name:/Perfil/}).waitFor();
  await prefs();await page.getByRole('switch').uncheck();await closePrefs();await page.emulateMedia({reducedMotion:'reduce'});await prefs();
  record('CT05','emulated-system',await page.getByRole('switch').isDisabled(),'Browser prefers-reduced-motion emulation; NOT native Android');await shot('CT05-system-reduced');await closePrefs();await page.emulateMedia({reducedMotion:'no-preference'});
 });
 await step('CT07','focus-and-zoom',async()=>{
  await page.reload();await page.getByRole('tab',{name:/Perfil/}).waitFor();
  await prefs();await page.keyboard.press('Tab');const focus=await page.evaluate(()=>({tag:document.activeElement.tagName,outline:getComputedStyle(document.activeElement).outline,hasFocus:document.hasFocus()}));record('CT07','keyboard-focus',!focus.outline.includes('none'),JSON.stringify(focus));await shot('CT07-focus');
  await page.evaluate(()=>document.documentElement.style.zoom='200%');await shot('CT07-zoom200');record('CT07','zoom-overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Document horizontal overflow check at CSS zoom 200%; screen-reader audio not tested');await page.evaluate(()=>document.documentElement.style.zoom='');await closePrefs();
 });
 await step('CT12','languages',async()=>{
  await page.reload();await page.getByRole('tab',{name:/Perfil/}).waitFor();
  for(const [choice,home,goals,groups,profile] of [['English','Home','Goals','Groups','Profile'],['Español','Inicio','Metas','Grupos','Perfil'],['Português','Início','Metas','Grupos','Perfil']]){
   await prefs();await page.getByRole('radio',{name:choice,exact:true}).click();await page.reload();await page.getByRole('tab',{name:new RegExp(home)}).waitFor();
   record('CT12',choice+'-persist',true,'Tab language persisted after reload');for(const n of [home,goals,groups,profile]){await tab(n);await shot('CT12-'+choice+'-'+n);}
   // Return to PT through localized preferences label before next iteration.
   await page.getByRole('button',{name:/^(Preferences|Preferencias|Preferências)$/}).click();await page.getByRole('radio',{name:'Português',exact:true}).click();await closePrefs();
  }
 });
 await step('CT09','group-owner-edit',async()=>{
  await page.reload();await page.getByRole('tab',{name:/Grupos/}).waitFor();
  await tab('Grupos');await page.getByRole('button',{name:'Editar grupo',exact:true}).click();await shot('CT09-edit-dialog');console.log('GROUP INPUTS',await page.locator('input,textarea').evaluateAll(es=>es.map(e=>({label:e.getAttribute('aria-label'),placeholder:e.getAttribute('placeholder')}))));
 });
 await page.reload();await page.getByRole('tab',{name:/Perfil/}).waitFor();await tab('Perfil');
 await page.getByRole('button',{name:'Sair',exact:true}).click();await page.getByPlaceholder('E-mail',{exact:true}).waitFor();record('CT08','logout',true,'Login restored after logout');await page.reload();await page.getByPlaceholder('E-mail',{exact:true}).waitFor();record('CT08','logout-reload',true,'Session remained cleared');
 await step('CT08','invalid-password',async()=>{
  await page.getByPlaceholder('E-mail',{exact:true}).fill(email);await page.getByPlaceholder('Senha',{exact:true}).fill('IncorrectFixture!');await page.getByRole('checkbox').click();
  const responsePromise=page.waitForResponse(r=>r.url().includes('/auth/v1/token'));await page.getByRole('button',{name:'Entrar',exact:true}).click();const response=await responsePromise;await page.waitForTimeout(700);
  const txt=await page.locator('body').innerText();record('CT08','invalid-password',response.status()===400 && /incorret|inválid|confira/i.test(txt),JSON.stringify({http:response.status(),visibleError:/incorret|inválid|confira/i.test(txt),stillLogin:await page.getByRole('button',{name:'Entrar',exact:true}).count()>0}));await shot('CT08-invalid');
 });
 await context.close();await browser.close();
}
run().catch(async e=>{console.error('HARNESS',e.message);fs.writeFileSync(path.join(OUT,'harness-error.txt'),e.message);await context?.close().catch(()=>{});await browser?.close().catch(()=>{});process.exitCode=1;});
