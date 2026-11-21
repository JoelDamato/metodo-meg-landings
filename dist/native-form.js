(()=>{const f=document.getElementById('f');if(!f)return;
 const system=f.querySelector('[data-role="system"]'),excel=f.querySelector('[data-role="excel"]');
 function conditional(){const show=/Excel/.test(system.value);excel.closest('.fld').hidden=!show;excel.required=show;if(!show)excel.value='';}
 system.addEventListener('change',conditional);conditional();
 f.addEventListener('submit',async e=>{e.preventDefault();if(!f.reportValidity())return;
 const button=f.querySelector('[type="submit"]');if(button.disabled)return;
 const target=document.getElementById('qualification-result');target.hidden=false;target.textContent='Guardando tus datos…';button.disabled=true;
 try{const response=await fetch('/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(f)))});const data=await response.json();if(!response.ok||!data.ok)throw Error(data.error||'No pudimos confirmar el registro. Intentá nuevamente.');
 target.dataset.result=data.qualification;target.textContent=data.qualification==='aplica'?'Recibimos tus datos. Tu empresa aplica. La agenda todavía no está disponible; aún no tenés una cita reservada.':'Recibimos tus datos. Por las respuestas indicadas, tu empresa no aplica a esta llamada.';
 button.textContent='Datos enviados';
 }catch(error){target.textContent=error.message;button.disabled=false;}
 target.scrollIntoView({behavior:'smooth',block:'center'});
 });})();
