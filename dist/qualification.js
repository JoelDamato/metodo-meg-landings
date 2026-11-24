(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MEGQualification=api;})(typeof window!=='undefined'?window:this,function(){
 const revenues=['Más de 500.000 USD al mes','Entre 200.000 y 500.000 USD al mes','Entre 50.000 y 200.000 USD al mes','Entre 30.000 y 50.000 USD al mes','Entre 10.000 y 30.000 USD al mes','Menos de 10.000 USD al mes'];
 const systems=['Solamente con sistema de gestión','Con sistema de gestión y planillas Excel','Solamente con planillas Excel','Tenemos sistema de gestión pero casi no lo usamos','Registro todo en un cuaderno / no tengo nada sistematizado'];
 const excelAnswers=['Sí','No'];
 // Regla de Walter (24-11-2026): NO aplica si lleva las finanzas en cuaderno / nada sistematizado,
 // si factura menos de 10.000 USD/mes, o si usa solamente Excel y en el Excel no tiene los datos cargados.
 // Todo lo demás aplica. El capital no filtra.
 function classify(revenue,system,excel){
  if(!revenues.includes(revenue)||!systems.includes(system))return null;
  const onlyExcel=system===systems[2];
  if(onlyExcel&&!excelAnswers.includes(excel))return null;
  if(system===systems[4]||revenue===revenues[5]||(onlyExcel&&excel==='No'))return 'no_aplica';
  return 'aplica';
 }
 return {classify,revenues,systems,excelAnswers};
});
