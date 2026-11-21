function bookingCreatedAt(value){if(!value)return NaN;const normalized=String(value).replace(' ','T');return Date.parse(/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)?normalized:normalized+'-03:00');}
const crypto=require('node:crypto');
const routing=require('../server/thank-you-routing.cjs');
module.exports=async function(req,res){res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({error:'Método inválido'});
 try{const b=typeof req.body==='string'?JSON.parse(req.body):req.body;const [raw,sig]=String(b.receipt||'').split('.');const expected=crypto.createHmac('sha256',process.env.MEG_GHL_API_KEY).update(raw).digest('base64url');if(!sig||sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return res.status(403).json({error:'Inválido'});const r=JSON.parse(Buffer.from(raw,'base64url'));if(Date.now()-r.at>3600000)return res.status(410).json({error:'Venció la sesión'});
 const response=await fetch('https://services.leadconnectorhq.com/contacts/'+encodeURIComponent(r.id)+'/appointments',{headers:{Authorization:'Bearer '+process.env.MEG_GHL_API_KEY,Version:'2021-07-28'},signal:AbortSignal.timeout(15000)});if(!response.ok)return res.status(502).json({confirmed:false});const data=await response.json();const found=(data.events||data.appointments||[]).find(e=>e.calendarId==='lPdipJGxlyfyyZFPH7wq'&&!['cancelled','invalid'].includes(e.appointmentStatus)&&bookingCreatedAt(e.dateAdded||e.createdAt)>r.at-5000);
 return res.json({confirmed:!!found,path:found?(routing.resolve(r.rubro)||'/gracias/general'):null});
 }catch{return res.status(400).json({confirmed:false});}
};
module.exports.bookingCreatedAt=bookingCreatedAt;
