const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require(path.join(os.tmpdir(),'studypulse-qa-tools/node_modules/playwright'));
(async()=>{
 const b=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});const p=await b.newPage({reducedMotion:'no-preference'});await p.goto('http://localhost:8092/comparacao-motion.html');
 const results=[];
 for(const kind of ['check','bar']){
  await p.waitForFunction(id=>!document.getElementById(id).disabled,kind);
  const r=await p.evaluate(async kind=>{
   const fast=document.getElementById(kind==='check'?'checkFast':'barFast'),slow=document.getElementById(kind==='check'?'checkSlow':'barSlow');
   const value=e=>kind==='check'?parseFloat(e.style.opacity||'1'):parseFloat(e.style.width||'0');const final=kind==='check'?1:75;const started={fast:false,slow:false},done={},begin=performance.now(),samples=[];
   document.getElementById(kind).click();
   await new Promise(resolve=>{function frame(){const elapsed=performance.now()-begin;for(const [name,el]of[['fast',fast],['slow',slow]]){const v=value(el);if(v<final)started[name]=true;if(started[name]&&v===final&&done[name]===undefined)done[name]=elapsed;}samples.push({t:elapsed,fast:value(fast),slow:value(slow)});if(done.fast!==undefined&&done.slow!==undefined||elapsed>2000)resolve();else requestAnimationFrame(frame)}requestAnimationFrame(frame)});
   return {kind,completionMs:done,frames:samples.length,fastBeforeSlow:done.fast<done.slow};
  },kind);results.push(r);
 }
 fs.writeFileSync(path.join(__dirname,'comparator-timing.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));await b.close();
})().catch(e=>{console.error(e.message);process.exitCode=1});
