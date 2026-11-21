const questions=require('./questions.json').fields;
const {classify}=require('./qualification.cjs');
const LOCATION='WU2z8kl23Dr3IyBW1hv5';
const allowedPaths=['/','/finanzas','/costos','/rentabilidad','/metodo','/metodomeg'];
const utmFields={utm_source:'k96ikVbLB6JfxXSE2DG1',utm_medium:'sitlucva1eFh1SgpxWLq',utm_campaign:'rI1TDim3BRrjF5IoC7r2',utm_content:'8sD386EIim4vYYrwRMXd',utm_term:'5upv4d9nF42Q56X2jdP1',fbclid:'W9nmlqGjevDucBnlVQbq'};
function payload(b){
 if(!b||typeof b!=='object')throw Error('Datos inválidos.');
 const str=(v,n=500)=>typeof v==='string'?v.trim().slice(0,n):'';
 const email=str(b.email,254).toLowerCase();let phone=str(b.phone,30).replace(/[\s()-]/g,'');
 if(!/^\+\d{8,15}$/.test(phone))throw Error('Ingresá WhatsApp con código de país, por ejemplo +54.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!str(b.first_name,100)||!str(b.last_name,100))throw Error('Completá nombre, apellido y email válido.');
 const customFields=[];
 for(const f of questions){const value=str(b[f.id]);const excel=f.id==='DKxaXQRPf3AdTwIqAXJl';const needsExcel=/Excel/.test(b['2sg2SekJNPo7FQMGrGJS']||'');if(excel&&!needsExcel)continue;if(!f.picklistOptions.includes(value))throw Error('Completá las respuestas del formulario.');customFields.push({id:f.id,field_value:f.type==='multiple_options'?[value]:value});}
 const result=classify(b.PddCUxnULUR7V2KwinRk,b['2sg2SekJNPo7FQMGrGJS']);if(!result)throw Error('Respuestas inválidas.');
 const landing=allowedPaths.includes(b.landing_path)?b.landing_path:'/';
 const url=new URL('https://metodo.matirandazzook.com'+landing);
 for(const k of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','fbclid','gclid','wbraid','gbraid']){const v=str(b[k]);if(v)url.searchParams.set(k,v);}
 for(const [k,id] of Object.entries(utmFields))customFields.push({id,field_value:str(b[k])});
 customFields.push({id:'DC17cPmLtcRSKjQufUFa',field_value:result==='aplica'?'Aplica':'No aplica'});
 return {result,data:{locationId:LOCATION,firstName:str(b.first_name,100),lastName:str(b.last_name,100),email,phone,customFields,lastAttributionSource:{url:url.href,utmSource:str(b.utm_source)||'direct',utmMedium:str(b.utm_medium)||'none',campaign:str(b.utm_campaign),utmContent:str(b.utm_content),utmTerm:str(b.utm_term),fbclid:str(b.fbclid),gclid:str(b.gclid)}}};
}
module.exports={payload,LOCATION};
