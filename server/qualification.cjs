(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MEGQualification=api;})(typeof window!=='undefined'?window:this,function(){
 const revenues=['Más de 500.000 USD al mes','Entre 200.000 y 500.000 USD al mes','Entre 50.000 y 200.000 USD al mes','Entre 30.000 y 50.000 USD al mes','Entre 10.000 y 30.000 USD al mes','Menos de 10.000 USD al mes'];
 const systems=['Solamente con sistema de gestión','Con sistema de gestión y planillas Excel','Solamente con planillas Excel','Tenemos sistema de gestión pero casi no lo usamos','Registro todo en un cuaderno / no tengo nada sistematizado'];
 function classify(revenue,system){if(!revenues.includes(revenue)||!systems.includes(system))return null;return revenues.indexOf(revenue)<4&&[systems[0],systems[1],systems[3]].includes(system)?'aplica':'no_aplica';}
 return {classify,revenues,systems};
});
