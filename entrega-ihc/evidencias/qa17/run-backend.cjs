// Local integration QA. Writes only sanitized outcomes, never credentials/tokens.
const fs=require('node:fs'),path=require('node:path');
const OUT=__dirname,base='http://localhost:54321';
const key=fs.readFileSync(path.resolve(OUT,'../../../study-pulse-app/.env.example'),'utf8').match(/^EXPO_PUBLIC_SUPABASE_ANON_KEY=(.+)$/m)[1].trim();
const out=[];
function log(id,step,status,detail){out.push({id,step,status,detail});console.log(id,step,status,JSON.stringify(detail));fs.writeFileSync(path.join(OUT,'backend-results.json'),JSON.stringify(out,null,2));}
async function req(route,method='GET',body,token=key){const r=await fetch(base+route,{method,headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json',Prefer:'return=representation'},body:body===undefined?undefined:JSON.stringify(body)});const t=await r.text();let d;try{d=JSON.parse(t)}catch{d=null}return {status:r.status,data:d};}
async function auth(email,password){const r=await req('/auth/v1/token?grant_type=password','POST',{email,password});if(!r.data?.access_token)throw Error('Fixture login failed');return r.data;}
async function main(){
 const a=await auth('qa.run17a@studypulse.local','StudyPulseP1!2026'),b=await auth('qa.run17b@studypulse.local','StudyPulseP2!2026');
 const m=await req('/rest/v1/squad_members?select=squad_id&user_id=eq.'+a.user.id,'GET',undefined,a.access_token),id=m.data[0].squad_id;
 const squad=(await req('/rest/v1/squads?select=*&id=eq.'+id,'GET',undefined,a.access_token)).data[0];
 const rpcArgs={target_squad:id,squad_name:'QA17 grupo validado',squad_subtitle:'Descricao tecnica QA17'};
 let r=await req('/rest/v1/rpc/rpc_update_squad','POST',rpcArgs,a.access_token);log('CT09','owner-update',r.status===200?'PASS':'FAIL',{http:r.status,code:r.data?.code});
 r=await req('/rest/v1/rpc/rpc_update_squad','POST',{...rpcArgs,squad_name:'Member unauthorized'},b.access_token);log('CT09','member-update-denied',[400,401,403].includes(r.status)?'PASS':'FAIL',{http:r.status,code:r.data?.code});
 r=await req('/rest/v1/rpc/rpc_update_squad','POST',{...rpcArgs,squad_name:''},a.access_token);log('CT09','empty-name-denied',r.status===400?'PASS':'FAIL',{http:r.status,code:r.data?.code});
 r=await req('/rest/v1/rpc/rpc_update_squad','POST',{...rpcArgs,squad_subtitle:'x'.repeat(161)},a.access_token);log('CT09','long-description-denied',r.status===400?'PASS':'FAIL',{http:r.status,code:r.data?.code});
 r=await req('/rest/v1/rpc/rpc_leave_squad','POST',{target_squad:id},b.access_token);log('CT09','member-leave-api',r.status<300?'PASS':'FAIL',{http:r.status,code:r.data?.code});
 r=await req('/rest/v1/rpc/rpc_join_squad','POST',{code:squad.invite_code},b.access_token);log('CT09','member-rejoin-api',r.status<300?'PASS':'FAIL',{http:r.status});
 const group=(await req('/rest/v1/squads?select=created_by&id=eq.'+id,'GET',undefined,a.access_token)).data[0];log('CT09','creator-preserved',group?.created_by===a.user.id?'PASS':'FAIL','Creator unchanged after member leave/rejoin');
 const title='QA17 API history '+Date.now();r=await req('/rest/v1/goals','POST',{user_id:a.user.id,title,category:'IHC',due_date:'2026-11-24'},a.access_token);if(r.status>=300)throw Error('goal fixture create failed HTTP '+r.status);const goal=r.data[0];
 r=await req('/rest/v1/rpc/rpc_update_goal_progress','POST',{goal_id:goal.id,new_progress:.5},a.access_token);log('CT10','progress-setup',r.status<300?'PASS':'FAIL',{http:r.status});
 r=await req('/rest/v1/rpc/rpc_archive_goal','POST',{goal_id:goal.id,archived:true},a.access_token);log('CT10','archive-api',r.status<300?'PASS':'FAIL',{http:r.status});
 r=await req('/rest/v1/goals?select=*&id=eq.'+goal.id,'GET',undefined,a.access_token);const archived=r.data[0];log('CT10','archive-persist',!!archived?.archived_at?'PASS':'FAIL',{id:goal.id,archived:!!archived?.archived_at,progress:archived?.progress,due:archived?.due_date});
 r=await req('/rest/v1/rpc/rpc_archive_goal','POST',{goal_id:goal.id,archived:false},a.access_token);const restored=(await req('/rest/v1/goals?select=*&id=eq.'+goal.id,'GET',undefined,a.access_token)).data[0];log('CT10','restore-preserves',!restored?.archived_at&&restored?.progress===.5&&restored?.due_date===goal.due_date?'PASS':'FAIL',{id:goal.id,progress:restored?.progress,due:restored?.due_date});
 // Never substitute admin deletion for testing the real application endpoint.
 const deleteEmail='delete.qa17@studypulse.local',deletePass='DeleteFixture!2026';
 await req('/auth/v1/signup','POST',{email:deleteEmail,password:deletePass,data:{name:'QA descartavel'}});
 const disposable=await auth(deleteEmail,deletePass);
 r=await req('/functions/v1/delete-account','POST',{},disposable.access_token);
 log('CT13','real-function-endpoint',r.status===404?'BLOCKED':r.status<300?'PASS':'FAIL',{http:r.status,detail:r.status===404?'Compose gateway has no /functions/v1 route; real Edge Function unavailable':'Function response; verify cascade separately'});
 r=await req('/functions/v1/delete-account','POST',{});log('CT13','unauthenticated-endpoint',r.status===404?'BLOCKED':r.status===401?'PASS':'FAIL',{http:r.status});
 const still=await auth('qa.run17a@studypulse.local','StudyPulseP1!2026');log('CT13','unrelated-fixture-intact',!!still.user.id?'PASS':'FAIL','QA owner still authenticates; no administrative deletion performed');
}
main().catch(e=>{log('HARNESS','exception','FAIL',e.message);process.exitCode=1;});
