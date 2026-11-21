(()=>{const f=document.getElementById('f');if(!f)return;
 const system=f.querySelector('[data-role="system"]'),excel=f.querySelector('[data-role="excel"]');
 function conditional(){const show=/Excel/.test(system.value);excel.closest('.fld').hidden=!show;excel.required=show;if(!show)excel.value='';}
 system.addEventListener('change',conditional);conditional();
 f.addEventListener('submit',e=>{e.preventDefault();if(!f.reportValidity())return;
 const result=window.MEGQualification.classify(f.querySelector('[data-role="revenue"]').value,system.value);
 const target=document.getElementById('qualification-result');target.dataset.result=result||'';
 target.textContent=result==='aplica'?'Tu empresa cumple los criterios para aplicar. La agenda todavía no está habilitada en esta nueva página. No se creó una reserva ni se enviaron tus datos.':'Por las respuestas indicadas, tu empresa no cumple los criterios de esta llamada. No se enviaron tus datos.';
 target.hidden=false;target.scrollIntoView({behavior:'smooth',block:'center'});
 });})();
