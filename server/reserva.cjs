// /reservas nueva (SOL-261125-16, maqueta de Walter del 25-11-2026): formulario corto que se despliega
// y calendario propio contra el calendario real de GHL (horarios libres y cita creados por API, sin salir de la página).
// Preguntas confirmadas por Walter el 25-11 13:17/13:24: nombre y apellido en un campo, WhatsApp, email,
// modelo de negocio, facturación, urgencia («¿Cuándo te gustaría empezar…?»), capital y decisor.
const crypto=require('node:crypto');
const LOCATION='WU2z8kl23Dr3IyBW1hv5';
const CALENDAR=process.env.MEG_RESERVAS_CALENDAR_ID||'lPdipJGxlyfyyZFPH7wq';
const allowedPaths=['/','/finanzas','/costos','/rentabilidad','/metodo','/metodomeg'];
const utmFields={utm_source:'k96ikVbLB6JfxXSE2DG1',utm_medium:'sitlucva1eFh1SgpxWLq',utm_campaign:'rI1TDim3BRrjF5IoC7r2',utm_content:'8sD386EIim4vYYrwRMXd',utm_term:'5upv4d9nF42Q56X2jdP1',fbclid:'W9nmlqGjevDucBnlVQbq'};
const questions=require('./reserva-questions.json').fields;
const REVENUE='PddCUxnULUR7V2KwinRk',CAPITAL='s1ftWyoSj9TTkKdJNNhF',MODEL='auI2TkFngL0NXTEDjMiy';
const str=(v,n=500)=>typeof v==='string'?v.trim().slice(0,n):'';

// Regla de aplica de Walter (24-11, SOL-261124-24) sin la pregunta de cómo registra las finanzas, que ya no está:
// no aplica si factura menos de 10.000 USD al mes; el resto aplica. «Aplica +» (lead de calidad) = aplica y tiene capital.
function classify(answers){
 const revenue=questions.find(f=>f.id===REVENUE).picklistOptions;
 const capital=questions.find(f=>f.id===CAPITAL).picklistOptions;
 const result=answers[REVENUE]===revenue[revenue.length-1]?'no_aplica':'aplica';
 return {result,quality:result==='aplica'&&capital.slice(1).includes(answers[CAPITAL])};
}

function payload(b){
 if(!b||typeof b!=='object')throw Error('Datos inválidos.');
 const email=str(b.email,254).toLowerCase();
 const country=str(b.country,6).replace(/\D/g,'');let local=str(b.phone,30).replace(/\D/g,'').replace(/^0+/,'');
 // Celulares de Argentina: WhatsApp los necesita con 9 después del 54 (+54 9 351…); si lo pegan con 54 adelante, no se duplica.
 if(country==='54'){local=local.replace(/^549?(?=\d{10}$)/,'');if(local.length===12)for(const a of [4,3,2])if(local.substr(a,2)==='15'){local=local.slice(0,a)+local.slice(a+2);break;}if(!local.startsWith('9'))local='9'+local;}
 else if(country&&local.startsWith(country)&&local.length>country.length+7)local=local.slice(country.length);
 const phone=country+local;
 if(!/^\d{8,15}$/.test(phone))throw Error('Ingresá tu WhatsApp completo, con el código de área.');
 const name=str(b.name,200).replace(/\s+/g,' ');
 if(name.length<2)throw Error('Ingresá tu nombre y apellido.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Ingresá un correo electrónico válido.');
 const [firstName,...rest]=name.split(' ');
 const answers={},customFields=[];
 for(const f of questions){const value=str(b[f.id]);if(!f.picklistOptions.includes(value))throw Error('Completá todas las preguntas para continuar.');answers[f.id]=value;customFields.push({id:f.id,field_value:f.type==='multiple_options'?[value]:value});}
 const {result,quality}=classify(answers);
 const landing=allowedPaths.includes(b.landing_path)?b.landing_path:'/';
 const url=new URL('https://metodo.matirandazzook.com'+landing);
 for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','fbclid','gclid','wbraid','gbraid']){const v=str(b[k]);if(v)url.searchParams.set(k,v);}
 for(const [k,id] of Object.entries(utmFields))customFields.push({id,field_value:str(b[k])});
 customFields.push({id:'DC17cPmLtcRSKjQufUFa',field_value:result==='aplica'?'Aplica':'No aplica'});
 return {result,quality,rubro:answers[MODEL],data:{locationId:LOCATION,firstName,lastName:rest.join(' '),name,email,phone:'+'+phone,customFields,lastAttributionSource:{url:url.href,utmSource:str(b.utm_source)||'direct',utmMedium:str(b.utm_medium)||'none',campaign:str(b.utm_campaign),utmContent:str(b.utm_content),utmTerm:str(b.utm_term),fbclid:str(b.fbclid),gclid:str(b.gclid)}}};
}

// Comprobante firmado: el navegador no puede reservar para otro contacto ni saltear el formulario.
function sign(data,key){const raw=Buffer.from(JSON.stringify(data)).toString('base64url');return raw+'.'+crypto.createHmac('sha256',key).update(raw).digest('base64url');}
function verify(receipt,key,maxAge=7200000){
 const [raw,sig]=String(receipt||'').split('.');if(!raw||!sig)return null;
 const expected=crypto.createHmac('sha256',key).update(raw).digest('base64url');
 if(sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;
 const r=JSON.parse(Buffer.from(raw,'base64url'));return Date.now()-r.at>maxAge?null:r;
}
function validTimezone(tz){try{new Intl.DateTimeFormat('es',{timeZone:tz});return tz;}catch{return 'America/Argentina/Buenos_Aires';}}

module.exports={payload,classify,sign,verify,validTimezone,LOCATION,CALENDAR,MODEL};
