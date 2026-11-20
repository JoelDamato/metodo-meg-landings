(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MEGThankYou=api;})(typeof window!=='undefined'?window:this,function(){
 'use strict';
 const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 const routes={fabricante:'/gracias/fabricante',fabricacion:'/gracias/fabricante',gastronomico:'/gracias/gastronomia',gastronomia:'/gracias/gastronomia','reventa minorista':'/gracias/reventa','reventa mayorista / distribucion':'/gracias/reventa',reventa:'/gracias/reventa',importador:'/gracias/reventa','servicios logisticos':'/gracias/servicios','servicios esteticos':'/gracias/servicios',servicios:'/gracias/servicios','servicios digitales':'/gracias/servicios','servicios (otros)':'/gracias/servicios'};
 function resolve(value){return routes[normalize(value)]||null;}
 function confirmedDestination(booking,rubro){if(!booking||booking.confirmed!==true||typeof booking.appointmentId!=='string'||!booking.appointmentId.trim())return null;return resolve(rubro);}
 return {resolve,confirmedDestination};
});
