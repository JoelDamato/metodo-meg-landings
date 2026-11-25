// /reservas (SOL-261125-16): funcionamiento de la maqueta de Walter con el calendario real.
// 1) WhatsApp + nombre; al empezar a escribir el nombre se despliegan las demás preguntas.
// 2) El calendario se ve siempre, apagado, con los días libres reales; Continuar guarda los datos y lo habilita.
// 3) Día → horarios (en la hora del visitante) → «Confirmar mi llamada» crea la cita → pantalla de listo.
(()=>{
 const $=id=>document.getElementById(id);
 const f=$('f'),more=$('more'),nom=$('nom'),tel=$('tel'),err=$('err'),err2=$('err2'),cal=$('cal'),grid=$('grid');
 const tz=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'America/Argentina/Buenos_Aires'}catch{return 'America/Argentina/Buenos_Aires'}})();
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
 let comprobante=null,chosen=null,sending=false;

 // Preguntas: mismas opciones que los campos de GHL.
 const box=$('preguntas');
 for(const q of window.MEG_RESERVA_PREGUNTAS||[]){
  const d=document.createElement('div');d.className='fld';
  const l=document.createElement('label');l.htmlFor='q_'+q.id;l.textContent=q.label+' ';const rq=document.createElement('span');rq.className='rq';rq.textContent='*';l.appendChild(rq);
  const s=document.createElement('select');s.id='q_'+q.id;s.name=q.id;s.required=true;
  s.appendChild(new Option('Seleccionar',''));for(const o of q.picklistOptions)s.appendChild(new Option(o,o));
  s.addEventListener('change',()=>s.classList.toggle('has',!!s.value));
  d.append(l,s);box.appendChild(d);
 }
 // Landing de origen: los botones de las landings mandan ?landing_path=/finanzas (attribution.js pondría /reservas).
 const lp=new URLSearchParams(location.search).get('landing_path');
 const setHidden=(n,v)=>{let i=f.querySelector('input[name="'+n+'"]');if(!i){i=document.createElement('input');i.type='hidden';i.name=n;f.appendChild(i)}i.value=v};
 setHidden('landing_path',['/','/finanzas','/costos','/rentabilidad','/metodo','/metodomeg'].includes(lp)?lp:'/');

 const open=()=>{if(nom.value.trim().length>=1)more.classList.add('open')};
 nom.addEventListener('input',open);tel.addEventListener('input',open);

 function validate(){
  if(tel.value.replace(/\D/g,'').length<6)return 'Ingresá tu número de WhatsApp.';
  if(nom.value.trim().length<2)return 'Ingresá tu nombre y apellido.';
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($('mail').value.trim()))return 'Ingresá un correo electrónico válido.';
  for(const s of box.querySelectorAll('select'))if(!s.value)return 'Completá todas las preguntas para continuar.';
  return '';
 }

 // ---- Calendario ----
 const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
 const today=new Date();let view={y:today.getFullYear(),m:today.getMonth()};const first={...view};
 const cache={};let selDay=null;
 const key=(y,m)=>y+'-'+String(m+1).padStart(2,'0');
 async function load(y,m){
  const k=key(y,m);if(cache[k])return cache[k];
  cache[k]=fetch('/api/reserva?accion=horarios&desde='+k+'-01&tz='+encodeURIComponent(tz)).then(r=>r.ok?r.json():Promise.reject()).then(d=>d.dias||{}).catch(()=>{delete cache[k];return null});
  return cache[k];
 }
 async function render(){
  const {y,m}=view;$('mes').textContent=months[m]+' '+y;
  $('prev').disabled=y===first.y&&m===first.m;$('next').disabled=(y*12+m)-(first.y*12+first.m)>=2;
  grid.innerHTML='';
  for(const d of ['DOM','LUN','MAR','MIÉ','JUE','VIE','SÁB']){const s=document.createElement('div');s.className='dw';s.textContent=d;grid.appendChild(s)}
  const start=new Date(y,m,1).getDay(),n=new Date(y,m+1,0).getDate();
  for(let i=0;i<start;i++)grid.appendChild(document.createElement('span'));
  const btns=[];for(let d=1;d<=n;d++){const b=document.createElement('button');b.type='button';b.textContent=d;b.disabled=true;b.dataset.day=key(y,m)+'-'+String(d).padStart(2,'0');grid.appendChild(b);btns.push(b)}
  $('calmsg').textContent='Buscando horarios disponibles…';
  const dias=await load(y,m);if(view.y!==y||view.m!==m)return;
  if(!dias){$('calmsg').textContent='No pudimos cargar los horarios. Recargá la página.';return}
  let any=false;for(const b of btns)if(dias[b.dataset.day]){any=true;b.classList.add('av');b.disabled=!comprobante;if(b.dataset.day===selDay)b.classList.add('sel')}
  $('calmsg').textContent=any?'':'No quedan horarios libres este mes.'+($('next').disabled?'':' Mirá el mes siguiente.');
  return any;
 }
 $('prev').onclick=()=>{view.m--;if(view.m<0){view.m=11;view.y--}render()};
 $('next').onclick=()=>{view.m++;if(view.m>11){view.m=0;view.y++}render()};
 render().then(any=>{if(any===false&&!$('next').disabled)$('next').click()});

 function showSlots(day,list){
  const box=$('slots');box.innerHTML='';chosen=null;$('book').style.display='none';err2.textContent='';
  for(const s of list){const b=document.createElement('button');b.type='button';b.textContent=s.slice(11,16);b.dataset.start=s;box.appendChild(b)}
  $('tzl').textContent='En tu hora local ('+tz.replace(/_/g,' ')+')';
  box.classList.add('show');$('slt').classList.add('show');
 }
 grid.addEventListener('click',async e=>{
  const b=e.target.closest('button.av');if(!b||!cal.classList.contains('on'))return;
  grid.querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');selDay=b.dataset.day;
  const dias=await load(view.y,view.m);showSlots(selDay,(dias&&dias[selDay])||[]);
 });
 $('slots').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  $('slots').querySelectorAll('.sel').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');chosen=b.dataset.start;
  $('book').style.display='flex';err2.textContent='';$('book').scrollIntoView({behavior:reduce,block:'nearest'});
 });

 // ---- Paso 1: Continuar ----
 f.addEventListener('submit',async e=>{
  e.preventDefault();if(sending)return;
  const m=validate();err.textContent=m;if(m){more.classList.add('open');return}
  const go=$('go');sending=true;go.disabled=true;go.textContent='Guardando tus datos…';
  try{
   const body=Object.fromEntries(new FormData(f));body.accion='registro';
   const r=await fetch('/api/reserva',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
   const d=await r.json().catch(()=>({}));if(!r.ok||!d.ok)throw Error(d.error||'No pudimos guardar tus datos. Intentá nuevamente.');
   $('step1').style.display='none';$('s1').classList.remove('on');$('s2').classList.add('on');
   if(!d.aplica){cal.style.display='none';const fin=$('final');fin.classList.add('show','no');$('fok').textContent='i';$('ftit').textContent='Gracias por completar tus datos';$('fmsg').textContent='Por las respuestas que indicaste, en este momento tu empresa no aplica a esta llamada.';fin.scrollIntoView({behavior:reduce,block:'center'});return}
   comprobante=d.comprobante;cal.classList.add('on');
   grid.querySelectorAll('button.av').forEach(b=>b.disabled=false);
   cal.scrollIntoView({behavior:reduce,block:'start'});
  }catch(x){err.textContent=x.message;go.disabled=false;go.innerHTML='Continuar <span aria-hidden="true">›</span>'}
  finally{sending=false}
 });

 // ---- Paso 2: Confirmar ----
 function pixel(r){if(typeof window.fbq!=='function'||!r.appointmentId)return;const rubro=(f.querySelector('[name="auI2TkFngL0NXTEDjMiy"]')||{}).value||'';
  window.fbq('trackCustom','LlamadaAgendada',{lead_calidad:r.quality?'si':'no',modelo_negocio:rubro},{eventID:'llamada_'+r.appointmentId});
  if(r.quality)window.fbq('track','Schedule',{modelo_negocio:rubro},{eventID:'schedule_'+r.appointmentId});}
 $('book').addEventListener('click',async()=>{
  if(!chosen||sending)return;const btn=$('book');sending=true;btn.disabled=true;btn.textContent='Reservando…';err2.textContent='';
  try{
   const r=await fetch('/api/reserva',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({accion:'reservar',comprobante,inicio:chosen,tz})});
   const d=await r.json().catch(()=>({}));
   if(!r.ok||!d.ok){if(d.ocupado){delete cache[key(view.y,view.m)];await render();const dias=await load(view.y,view.m);showSlots(selDay,(dias&&dias[selDay])||[])}throw Error(d.error||'No pudimos reservar ese horario. Intentá nuevamente.')}
   const when=new Date(chosen.slice(0,19)+'Z');
   const fecha=new Intl.DateTimeFormat('es',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).format(when).replace(',','');
   cal.style.display='none';$('final').classList.add('show');
   $('fmsg').textContent=d.yaReservada?'Ya tenías tu llamada reservada con estos datos. Te confirmamos por WhatsApp.':'Reservaste el '+fecha+' a las '+chosen.slice(11,16)+' hs. Te confirmamos por WhatsApp.';
   $('final').scrollIntoView({behavior:reduce,block:'center'});
   pixel(d);
   if(d.path&&d.path.startsWith('/gracias/'))setTimeout(()=>location.assign(d.path),5000);
  }catch(x){err2.textContent=x.message;btn.disabled=false;btn.textContent='Confirmar mi llamada'}
  finally{sending=false}
 });
})();
