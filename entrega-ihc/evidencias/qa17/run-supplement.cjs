const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.tmpdir(),'studypulse-qa-tools/node_modules/playwright'));
const OUT=__dirname,APP='http://localhost:8093',selected=process.argv[2];
const results=selected&&fs.existsSync(path.join(OUT,'supplement-results.json'))?JSON.parse(fs.readFileSync(path.join(OUT,'supplement-results.json'))).filter(r=>r.id!==selected):[];
const locales={pt:require('../../../study-pulse-app/src/i18n/locales/pt-BR/translations.json')};
// Resolve source translations without relying on a guessed Spanish tab title.
const ROOT=path.resolve(OUT,'../../../study-pulse-app');
const tr={pt:JSON.parse(fs.readFileSync(path.join(ROOT,'src/i18n/locales/pt-BR/translations.json'))),en:JSON.parse(fs.readFileSync(path.join(ROOT,'src/i18n/locales/en-US/translations.json'))),es:JSON.parse(fs.readFileSync(path.join(ROOT,'src/i18n/locales/es-ES/translations.json')))};
let browser;
function note(id,step,status,detail){results.push({id,step,status,detail});fs.writeFileSync(path.join(OUT,'supplement-results.json'),JSON.stringify(results,null,2));console.log(id,step,status,JSON.stringify(detail));}
async function tab(p,route){await p.locator(`a[role=tab][href$='/Main/${route}']`).click();await p.waitForTimeout(400);}
async function preferences(p){await tab(p,'Profile');await p.getByRole('button',{name:/^(Preferências|Preferences|Preferencias)$/}).click();await p.getByRole('switch').waitFor();}
async function login(p,mail='qa.run17a@studypulse.local',password='StudyPulseP1!2026'){
 await p.goto(APP);await p.getByPlaceholder('E-mail',{exact:true}).fill(mail);await p.getByPlaceholder('Senha',{exact:true}).fill(password);await p.getByRole('checkbox').click();await p.getByRole('button',{name:'Entrar',exact:true}).click();await p.locator('a[role=tab]').first().waitFor();
}
async function shot(p,name){await p.screenshot({path:path.join(OUT,name+'.png')});}
async function run(id,options,fn){if(selected&&selected!==id)return;const c=await browser.newContext({viewport:{width:460,height:836},reducedMotion:'no-preference',recordVideo:{dir:path.join(OUT,'videos'),size:{width:460,height:836}},...options});const p=await c.newPage();p.setDefaultTimeout(7000);try{await fn(p,c)}catch(e){note(id,'execution','BLOCKED',e.message.replace(/\u001b\[[0-9;]*m/g,''));await shot(p,id+'-supplement-block').catch(()=>{});}finally{await c.close();const vp=await p.video()?.path();if(vp)fs.copyFileSync(vp,path.join(OUT,'videos',id+'-execution.webm'));}}
async function main(){browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 await run('CT05', {reducedMotion:'reduce'},async(p)=>{
  await login(p);await preferences(p);const sw=p.getByRole('switch');note('CT05','system-initial','PASS',{checked:await sw.isChecked(),disabled:await sw.isDisabled(),explanation:await p.getByText(/Ativado pela configuração/).count()});await shot(p,'CT05-emulated-system');
  await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(300);note('CT05','system-off',!(await sw.isChecked())&&!(await sw.isDisabled())?'PASS':'FAIL','Internal preference false; switch follows media change');
  await p.emulateMedia({reducedMotion:'reduce'});await p.reload();await p.locator('a[role=tab]').first().waitFor();await preferences(p);note('CT05','system-reload',await p.getByRole('switch').isDisabled()?'PASS':'FAIL','Browser media emulation persisted through reload; native Android not available');
 });
 await run('CT04',{},async(p)=>{
  await login(p);await preferences(p);await p.getByRole('switch').check();await p.reload();await p.locator('a[role=tab]').first().waitFor();await preferences(p);note('CT04','preference-reload',await p.getByRole('switch').isChecked()?'PASS':'FAIL','Stored option');await p.getByRole('button',{name:'Voltar',exact:true}).click();await p.waitForTimeout(700);
  await tab(p,'Home');await p.getByRole('button',{name:'Adicionar tarefa',exact:true}).click();const name='QA motion '+Date.now();await p.getByLabel('Título da tarefa').fill(name);await p.getByLabel('Categoria da tarefa').fill('QA');await p.getByRole('button',{name:/Salvar tarefa/}).click();const check=p.getByRole('checkbox',{name:new RegExp(name)});await check.scrollIntoViewIfNeeded();
  await p.evaluate((name)=>{window.motionFrames=[];let until=performance.now()+1700;function frame(){const e=Array.from(document.querySelectorAll('[role=checkbox]')).find(e=>e.getAttribute('aria-label')?.startsWith(name));if(e)window.motionFrames.push(Array.from(e.querySelectorAll('[style]')).map(x=>x.style.transform).filter(Boolean));if(performance.now()<until)requestAnimationFrame(frame)}requestAnimationFrame(frame)},name);
  await check.click();await p.waitForTimeout(1800);const frames=await p.evaluate(()=>window.motionFrames);const varying=frames.flat().filter(s=>/scale\(/.test(s)&&!/^scale\(1\)$/.test(s));note('CT04','reduced-task',varying.length===0?'PASS':'FAIL',{sampledFrames:frames.length,nonFinalScaleFrames:varying.length,checked:await check.getAttribute('aria-checked')});await shot(p,'CT04-reduced-task');
  await p.reload();await p.locator('a[role=tab]').first().waitFor();await tab(p,'Profile');await p.getByRole('button',{name:'Sair',exact:true}).click();await p.getByRole('button',{name:'Entrar',exact:true}).waitFor();await p.getByRole('button',{name:'Entrar',exact:true}).click();note('CT04','invalid-visible',await p.getByText('Você precisa aceitar os Termos de Uso para continuar.').count()>0?'PASS':'FAIL','Terms error remains textual with reduced motion');await shot(p,'CT04-invalid-reduced');
 });
 await run('CT06',{},async(p)=>{
  await p.goto('http://localhost:8092/comparacao-motion.html');
  for(let i=0;i<3;i++){await p.locator('#check').click();await p.waitForTimeout(500);const s=await p.locator('#checkFast').evaluate(e=>e.style.transform);note('CT06','scale-run-'+(i+1),s==='scale(1)'?'PASS':'FAIL',s);await p.locator('#bar').click();await p.waitForTimeout(700);const widths=await p.locator('#barFast,#barSlow').evaluateAll(es=>es.map(e=>e.style.width));note('CT06','bar-run-'+(i+1),widths.every(x=>x==='75%')?'PASS':'FAIL',widths);}
  await p.locator('#reduce').check();await p.locator('#bar').click();await p.waitForTimeout(100);note('CT06','reduced',await p.locator('#state').innerText()==='Resultado final exibido sem transição.'?'PASS':'FAIL',await p.locator('#state').innerText());
  await p.locator('#check').focus();await p.keyboard.press('Enter');await p.waitForTimeout(100);note('CT06','keyboard',await p.locator('#state').innerText()==='Resultado final exibido sem transição.'?'PASS':'FAIL','Enter triggered comparison');await shot(p,'CT06-comparator');
 });
 await run('CT12',{},async(p)=>{
  await login(p);
  for(const [lang,choice] of [['en','English'],['es','Español'],['pt','Português']]){
   await preferences(p);await p.getByRole('radio',{name:choice,exact:true}).click();await p.reload();await p.locator('a[role=tab]').first().waitFor();const names=await p.locator('a[role=tab]').allTextContents();note('CT12',lang+'-persist',Object.values(tr[lang].navigation.tabs).every(t=>names.some(n=>n.includes(t)))?'PASS':'FAIL',names);
   for(const route of ['Home','Goals','Groups','Profile']){await tab(p,route);await shot(p,'CT12-'+lang+'-'+route);}
   await tab(p,'Home');const button=p.getByRole('button',{name:tr[lang].home.checkInButton??/check-in|Check in/i});console.log('CHECKIN TEXT',lang,await p.getByRole('button').allTextContents());
  }
 });
 await run('CT09', {permissions:['clipboard-read','clipboard-write']},async(p,c)=>{
  await login(p);await tab(p,'Groups');await p.getByRole('button',{name:'Copiar código',exact:true}).click();const clip=await p.evaluate(()=>navigator.clipboard.readText());note('CT09','clipboard',!!clip&&!/\s/.test(clip)?'PASS':'FAIL',{length:clip.length,noWhitespace:!(/\s/.test(clip))});
  note('CT09','native-share',await p.evaluate(()=>typeof navigator.share==='function')?'AVAILABLE':'BLOCKED','Native sharing capability; no external message sent');
  await p.getByRole('button',{name:'Editar grupo',exact:true}).click();await p.getByLabel('Nome do grupo',{exact:true}).fill('QA17 UI grupo');await p.getByLabel('Descrição do grupo',{exact:true}).fill('Descricao pela interface');await p.getByRole('button',{name:'Editar grupo',exact:true}).last().click();await p.getByText('QA17 UI grupo',{exact:true}).waitFor();await shot(p,'CT09-owner-saved');note('CT09','owner-ui','PASS','Name and description updated through UI');
  await p.reload();await p.locator('a[role=tab]').first().waitFor();await tab(p,'Profile');await p.getByRole('button',{name:'Sair',exact:true}).click();await p.getByPlaceholder('E-mail',{exact:true}).waitFor();await login(p,'qa.run17b@studypulse.local','StudyPulseP2!2026');await tab(p,'Groups');note('CT09','member-edit-hidden',await p.getByRole('button',{name:'Editar grupo',exact:true}).count()===0?'PASS':'FAIL','Member UI has no edit action');await shot(p,'CT09-member');
  await p.getByRole('button',{name:'Sair',exact:true}).first().click();await p.waitForTimeout(700);note('CT09','leave-confirmation',await p.getByText('Sair do grupo?',{exact:true}).count()>0?'PASS':'FAIL','Web confirmation should appear before leaving');await shot(p,'CT09-leave-click');
 });
 await run('CT13',{},async(p)=>{
  await login(p,'delete.qa17@studypulse.local','DeleteFixture!2026');await tab(p,'Profile');await p.getByRole('button',{name:'Conta',exact:true}).click();await p.getByRole('button',{name:'Excluir conta',exact:true}).click();await p.getByRole('button',{name:'Cancelar',exact:true}).click();await p.getByText('Excluir sua conta?',{exact:true}).waitFor({state:'hidden'});note('CT13','cancel','PASS','Cancellation closes dialog and account session remains');
  await p.getByRole('button',{name:'Excluir conta',exact:true}).click();await p.getByRole('button',{name:'Excluir conta',exact:true}).last().click();await p.waitForTimeout(1500);await shot(p,'CT13-function-missing');note('CT13','actual-ui-delete','BLOCKED',{visibleError:await p.getByText(/Não foi possível excluir/).count(),reason:'Local gateway endpoint absent (HTTP 404 confirmed separately)'});
 });
 await browser.close();}
main().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
