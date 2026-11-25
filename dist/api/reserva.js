// /api/reserva — registro, horarios libres y cita del calendario real de GHL (SOL-261125-16).
//   POST {accion:'registro', …respuestas}  → guarda el contacto en GHL y devuelve un comprobante firmado
//   GET  ?accion=horarios&desde=AAAA-MM-DD&tz=… → días y horarios libres del mes (en la hora del visitante)
//   POST {accion:'reservar', comprobante, inicio, tz} → crea la cita para ese contacto
const {payload,sign,verify,validTimezone,LOCATION,CALENDAR}=require('../server/reserva.cjs');
const routing=require('../server/thank-you-routing.cjs');
const GHL='https://services.leadconnectorhq.com';
const origins=['https://metodo.matirandazzook.com','https://meg-landings-wally.vercel.app',...String(process.env.MEG_EXTRA_ORIGINS||'').split(',').filter(Boolean)];
const key=()=>process.env.MEG_GHL_API_KEY;
const ghl=(path,opt={})=>fetch(GHL+path,{...opt,headers:{Authorization:'Bearer '+key(),Version:opt.version||'2021-04-15','Content-Type':'application/json'},signal:AbortSignal.timeout(20000)});

async function freeSlots(from,to,tz){
 const r=await ghl(`/calendars/${CALENDAR}/free-slots?startDate=${from}&endDate=${to}&timezone=${encodeURIComponent(tz)}`);
 if(!r.ok)throw Error('slots '+r.status);
 const d=await r.json();const days={};
 for(const [day,v] of Object.entries(d))if(/^\d{4}-\d{2}-\d{2}$/.test(day)&&v?.slots?.length)days[day]=v.slots;
 return days;
}

async function registro(b,res){
 let p;try{p=payload(b)}catch(e){return res.status(400).json({error:e.message});}
 const r=await ghl('/contacts/upsert',{method:'POST',version:'2021-07-28',body:JSON.stringify(p.data)});
 const d=await r.json().catch(()=>({}));
 if(!r.ok||!d.contact?.id){console.error('GHL registration rejected',r.status);return res.status(502).json({error:'No pudimos guardar tus datos. Revisá que estén bien e intentá nuevamente.'});}
 const aplica=p.result==='aplica';
 return res.status(200).json({ok:true,aplica,comprobante:aplica?sign({id:d.contact.id,rubro:p.rubro,q:p.quality?1:0,at:Date.now()},key()):null});
}

async function horarios(q,res){
 const tz=validTimezone(String(q.tz||''));
 const desde=/^\d{4}-\d{2}-\d{2}$/.test(q.desde||'')?Date.parse(q.desde+'T00:00:00Z'):Date.now();
 const from=Math.max(Date.now(),desde-86400000),to=desde+33*86400000;
 if(to<=from)return res.json({dias:{}});
 res.setHeader('Cache-Control','public, max-age=30');
 return res.json({dias:await freeSlots(from,to,tz)});
}

async function reservar(b,res){
 const r=verify(b.comprobante,key());
 if(!r)return res.status(403).json({error:'Pasó mucho tiempo desde que completaste el formulario. Recargá la página y volvé a completarlo.'});
 const inicio=String(b.inicio||''),tz=validTimezone(String(b.tz||''));
 const t=Date.parse(inicio);if(!t)return res.status(400).json({error:'Elegí un horario.'});
 // Si ya reservó con este formulario, no se crea otra cita.
 const prev=await ghl(`/contacts/${encodeURIComponent(r.id)}/appointments`,{version:'2021-07-28'}).then(x=>x.ok?x.json():{}).catch(()=>({}));
 const done=(prev.events||[]).find(e=>e.calendarId===CALENDAR&&!['cancelled','invalid'].includes(e.appointmentStatus)&&Date.parse(String(e.dateAdded||'').replace(' ','T'))>r.at-5000);
 if(done)return res.json({ok:true,yaReservada:true,path:routing.resolve(r.rubro)||'/gracias/general',appointmentId:done.id,quality:r.q===1});
 // El horario tiene que seguir libre (otra persona pudo tomarlo mientras completaba).
 const day=new Date(t);const slots=await freeSlots(t-86400000,t+86400000,tz);
 if(!Object.values(slots).flat().some(s=>Date.parse(s)===t))return res.status(409).json({error:'Ese horario se acaba de ocupar. Elegí otro, por favor.',ocupado:true});
 const c=await ghl('/calendars/events/appointments',{method:'POST',body:JSON.stringify({calendarId:CALENDAR,locationId:LOCATION,contactId:r.id,startTime:new Date(t).toISOString(),appointmentStatus:'confirmed',toNotify:true})});
 const a=await c.json().catch(()=>({}));
 if(!c.ok||!a.id){console.error('GHL appointment rejected',c.status,JSON.stringify(a).slice(0,300));return res.status(502).json({error:'No pudimos reservar ese horario. Probá con otro o intentá nuevamente.'});}
 return res.json({ok:true,inicio:a.startTime||day.toISOString(),path:routing.resolve(r.rubro)||'/gracias/general',appointmentId:a.id,quality:r.q===1});
}

module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!key())return res.status(503).json({error:'La agenda no está disponible en este momento. Intentá nuevamente en unos minutos.'});
 try{
  if(req.method==='GET'&&req.query?.accion==='horarios')return await horarios(req.query,res);
  if(req.method!=='POST')return res.status(405).json({error:'Método no permitido.'});
  if(!origins.includes(req.headers.origin))return res.status(403).json({error:'Origen inválido.'});
  let b=req.body;try{if(typeof b==='string')b=JSON.parse(b);if(JSON.stringify(b).length>16000)throw Error();}catch{return res.status(400).json({error:'Datos inválidos.'});}
  if(b?.website)return res.status(400).json({error:'No se pudo enviar el formulario.'});
  if(b?.accion==='registro')return await registro(b,res);
  if(b?.accion==='reservar')return await reservar(b,res);
  return res.status(400).json({error:'Acción inválida.'});
 }catch(e){console.error('reserva error',e?.message);return res.status(502).json({error:'Hubo un problema de conexión. Intentá nuevamente.'});}
};
