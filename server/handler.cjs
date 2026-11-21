const {payload}=require('./register.cjs');
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
 return res.status(200).json({ok:true,qualification:p.result,bookingEnabled:false});
 }catch{console.error('GHL registration unavailable');return res.status(502).json({error:'No pudimos confirmar el registro. Intentá nuevamente.'});}
};
