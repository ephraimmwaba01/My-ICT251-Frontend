import {recordService} from './data.js';
import {validated} from './validation.js';
import {API_BASE_URL} from './config.js';
const el=id=>document.getElementById(id);
const statuses=['Pending','In progress','Completed'];
let records=[], editing=null, ready=false, revision=0;
const form=el('ticket');
function element(tag,text,cls){const node=document.createElement(tag);node.textContent=text;if(cls)node.className=cls;return node;}
function message(text,error=false){el('feedback').textContent=text;el('feedback').classList.toggle('error',error);}
function checkInLabel(value) {
 if (!value) return 'Unscheduled';
 const [date, time] = value.split('T');
 return date + ' at ' + time + ' CAT';
}
function draw(){
 const filtered=records.filter(r=>r.title.toLowerCase().includes(el('search').value.toLowerCase().trim())&&(!el('filter').value||r.status===el('filter').value));
 el('stats').replaceChildren(...statuses.map(status=>{const box=element('div','','stat');box.append(element('strong',ready?records.filter(r=>r.status===status).length:'—'),element('span',status));return box;}));
 el('count').textContent=ready?filtered.length+' of '+records.length+' requests':'';
 const list=el('rows');list.replaceChildren();
 if(!ready)return;
 if(!filtered.length){list.append(element('p',records.length?'No matching requests. Try a different search or status.':'No requests yet. Choose New request to get started.','empty'));return;}
 for(const r of filtered){
  const row=element('article','','row'),title=element('div','','title');
  title.append(element('span','IT-'+String(r.id).padStart(3,'0'),'num'),element('strong',r.title));
  const service = element('small', 'Owner: ' + (r.owner || 'Unassigned') + ' · Next check-in: ' + checkInLabel(r.nextCheckIn), 'service-info');
  title.append(service);
  const actions=element('div','','actions');
  for(const name of ['View','Edit','Delete']){
   const button=element('button',name);button.setAttribute('aria-label',name+' '+r.title);
   button.onclick=()=>act(name,r,button);actions.append(button);
  }
  row.append(title,element('span',r.category),element('span',r.status,'badge '+({'In progress':'progress','Completed':'done'}[r.status]||'')),actions);list.append(row);
 }
}
async function refresh(notice=''){
 const token=++revision;message('Loading records…');
 try{const rows=await recordService.list();if(token!==revision)return;records=rows;ready=true;draw();message(notice);}
 catch(error){if(token!==revision)return;ready=false;records=[];draw();message((notice?notice+' ':'')+error.message+' Use Refresh to reload the queue.',true);}
}
function edit(row){
 editing=row?.id??null;form.reset();
 for(const key of ['title','category','description','status','owner','nextCheckIn'])if(row){
  const field=form.elements.namedItem(key);
  if(key==='category'&&!Array.from(field.options).some(o=>o.value===row[key]))field.add(new Option(row[key],row[key]));
  field.value=row[key] ?? '';
 }
 el('editTitle').textContent=row?'Edit request IT-'+row.id:'New request';el('cancel').textContent=row?'Cancel edit':'Cancel';
 el('formError').textContent='';el('editor').showModal();form.elements.title.focus();
}
async function act(name,row,button){
 button.disabled=true;
 try{
  if(name==='Delete'){if(confirm('Delete “'+row.title+'”? This removes the request.')){await recordService.remove(row.id);await refresh('Request deleted.');}return;}
  const full=await recordService.get(row.id);
  if(name==='Edit'){edit(full);return;}
  for(const field of ['Title','Description','Category','Status'])el('detail'+field).textContent=full[field.toLowerCase()];
  el('detailOwner').textContent = full.owner || 'Unassigned';
  el('detailCheckIn').textContent = checkInLabel(full.nextCheckIn);
  el('detailId').textContent='Request IT-'+full.id;el('details').showModal();
 }catch(error){message(error.message,true);}finally{button.disabled=false;}
}
form.onsubmit=async event=>{
 event.preventDefault();if(el('save').disabled)return;el('formError').textContent='';
 el('save').disabled=true;el('cancel').disabled=true;
 try{
  const body=validated(Object.fromEntries(new FormData(form)));
  const saved=editing===null?await recordService.create(body):await recordService.update(editing,body);
  el('editor').close();await refresh('Request IT-'+saved.id+' saved.');
 }catch(error){el('formError').textContent=error.message;}finally{el('save').disabled=false;el('cancel').disabled=false;}
};
el('editor').oncancel=e=>{if(el('save').disabled)e.preventDefault();};
el('add').onclick=()=>edit(null);el('close').onclick=()=>el('details').close();el('cancel').onclick=()=>el('editor').close();
el('reload').onclick=()=>refresh();el('search').oninput=draw;el('filter').onchange=draw;
if(el('guide')){el('guide').href=API_BASE_URL+'/';el('health').href=API_BASE_URL+'/health';}
draw();refresh();