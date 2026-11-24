(()=>{const f=document.getElementById('f');if(!f)return;
 const system=f.querySelector('[data-role="system"]'),excel=f.querySelector('[data-role="excel"]');
 function conditional(){const show=/Excel/.test(system.value);excel.closest('.fld').hidden=!show;excel.required=show;if(!show)excel.value='';}
 system.addEventListener('change',conditional);conditional();
 // Pixel de Meta (SOL-261124-24): LlamadaAgendada en toda cita confirmada; Schedule sólo si es lead de calidad.
 // eventID con el id de la cita, para que Meta no cuente dos veces lo mismo.
 const fired=new Set();function pixel(r){const id=r.appointmentId;if(!id||fired.has(id)||typeof window.fbq!=='function')return;fired.add(id);const rubro=(f.querySelector('[name="auI2TkFngL0NXTEDjMiy"]')||{}).value||'';
 window.fbq('trackCustom','LlamadaAgendada',{lead_calidad:r.quality?'si':'no',modelo_negocio:rubro},{eventID:'llamada_'+id});
 if(r.quality)window.fbq('track','Schedule',{modelo_negocio:rubro},{eventID:'schedule_'+id});}
 f.addEventListener('submit',async e=>{e.preventDefault();if(!f.reportValidity())return;
 const button=f.querySelector('[type="submit"]');if(button.disabled)return;
 const target=document.getElementById('qualification-result');target.hidden=false;target.textContent='Guardando tus datos…';button.disabled=true;
 try{const response=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(f)))});const data=await response.json();if(!response.ok||!data.ok)throw Error(data.error||'No pudimos confirmar el registro. Intentá nuevamente.');
 target.dataset.result=data.qualification;target.textContent=data.qualification==='aplica'?'Recibimos tus datos. Elegí un día y horario para reservar tu llamada.':'Recibimos tus datos. Por las respuestas indicadas, tu empresa no aplica a esta llamada.';
 button.textContent='Datos enviados';
 if(data.bookingEnabled&&data.bookingUrl){const frame=document.createElement('iframe');frame.title='Elegí día y horario para tu llamada';frame.src=data.bookingUrl;frame.style.cssText='width:100%;min-height:850px;border:0;background:white;border-radius:16px;margin-top:24px';f.after(frame);const script=document.createElement('script');script.src='https://link.msgsndr.com/js/form_embed.js';script.async=true;document.body.appendChild(script);frame.scrollIntoView({behavior:'smooth',block:'start'});
 const started=Date.now();const timer=setInterval(async()=>{if(Date.now()-started>1800000){clearInterval(timer);return;}try{const check=await fetch('/api/booking-status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({receipt:data.receipt})});const result=await check.json();if(result.confirmed&&result.path?.startsWith('/gracias/')){clearInterval(timer);pixel(result);setTimeout(()=>location.assign(result.path),500);}}catch{}},10000);
 }
 }catch(error){target.textContent=error.message;button.disabled=false;}
 target.scrollIntoView({behavior:'smooth',block:'center'});
 });})();
