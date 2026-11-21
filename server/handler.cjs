const {payload}=require('./register.cjs');
const crypto=require('node:crypto');
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Método no permitido.'});
 const origin=req.headers.origin;
 if(!['https://metodo.matirandazzook.com','https://meg-landings-wally.vercel.app'].includes(origin))return res.status(403).json({error:'Origen inválido.'});
 let b=req.body;try{if(typeof b==='string')b=JSON.parse(b);if(JSON.stringify(b).length>16000)throw Error();}catch{return res.status(400).json({error:'Datos inválidos.'});}
 if(b?.website)return res.status(400).json({error:'No se pudo enviar el formulario.'});
 let p;try{p=payload(b)}catch(e){return res.status(400).json({error:e.message});}
 if(!process.env.MEG_GHL_API_KEY)return res.status(503).json({error:'El registro no está disponible. Intentá nuevamente en unos minutos.'});
 try{
 const r=await fetch('https://services.leadconnectorhq.com/contacts/upsert',{method:'POST',headers:{Authorization:'Bearer '+process.env.MEG_GHL_API_KEY,Version:'2021-07-28','Content-Type':'application/json'},body:JSON.stringify(p.data),signal:AbortSignal.timeout(20000)});
 const d=await r.json();if(!r.ok||!d.contact?.id){console.error('GHL registration rejected',r.status);return res.status(502).json({error:'No pudimos guardar el registro. Revisá tus datos e intentá nuevamente.'});}
 const enabled=p.result==='aplica';
 const url=new URL('https://api.leadconnectorhq.com/widget/booking/lPdipJGxlyfyyZFPH7wq');
 for(const [key,value] of Object.entries({first_name:p.data.firstName,last_name:p.data.lastName,email:p.data.email,phone:p.data.phone,contact_id:d.contact.id}))url.searchParams.set(key,value);
 for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','fbclid','gclid'])if(typeof b[key]==='string'&&b[key])url.searchParams.set(key,b[key].slice(0,500));
 const receipt=Buffer.from(JSON.stringify({id:d.contact.id,rubro:b.auI2TkFngL0NXTEDjMiy,at:Date.now()})).toString('base64url');
 const signature=crypto.createHmac('sha256',process.env.MEG_GHL_API_KEY).update(receipt).digest('base64url');
 return res.status(200).json({ok:true,qualification:p.result,bookingEnabled:enabled,bookingUrl:enabled?url.href:null,receipt:enabled?receipt+'.'+signature:null});
 }catch{console.error('GHL registration unavailable');return res.status(502).json({error:'No pudimos confirmar el registro. Intentá nuevamente.'});}
};
