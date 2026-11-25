const {test}=require('node:test');const assert=require('node:assert/strict');
const {payload,classify,sign,verify}=require('../server/reserva.cjs');const q=require('../server/reserva-questions.json').fields;
function input(){const b={name:'  Prueba   Claude QA ',country:'54',phone:'11 5555-1234',email:'QA@Example.com',landing_path:'/finanzas',utm_source:'meta',utm_campaign:'c1',fbclid:'x'};for(const f of q)b[f.id]=f.picklistOptions[0];return b;}
test('ocho preguntas: nombre y apellido en un campo, WhatsApp con país, email y las 5 de GHL',()=>{
 const p=payload(input());assert.equal(p.data.firstName,'Prueba');assert.equal(p.data.lastName,'Claude QA');assert.equal(p.data.phone,'+5491155551234');assert.equal(p.data.email,'qa@example.com');
 assert.deepEqual(p.data.customFields.find(f=>f.id==='auI2TkFngL0NXTEDjMiy').field_value,['Reventa minorista']);
 assert.equal(p.data.customFields.find(f=>f.id==='a2H1LZ5GVQGhfqr34ZbI').field_value,'Es una prioridad, quiero arrancar ahora.');
 assert.equal(p.data.customFields.find(f=>f.id==='DC17cPmLtcRSKjQufUFa').field_value,'Aplica');
 assert.ok(p.data.lastAttributionSource.url.startsWith('https://metodo.matirandazzook.com/finanzas?'));assert.equal(p.data.lastAttributionSource.fbclid,'x');
 assert.equal(q.length,5);assert.ok(!q.some(f=>['2sg2SekJNPo7FQMGrGJS','DKxaXQRPf3AdTwIqAXJl','UEEQfDnRFOW78au7KUkV','EAA7ulVA29hb0LeAKQYg','0xbzKxaNJNPvr5xMHmlY'].includes(f.id)));});
test('no aplica sólo con menos de 10.000 USD; aplica + con capital',()=>{
 const b=input();b.PddCUxnULUR7V2KwinRk='Menos de 10.000 USD al mes';assert.equal(payload(b).result,'no_aplica');
 b.PddCUxnULUR7V2KwinRk='Entre 10.000 y 30.000 USD al mes';assert.equal(payload(b).result,'aplica');assert.equal(payload(b).quality,false);
 b.s1ftWyoSj9TTkKdJNNhF='Entre USD 3.500 y 4.500.';assert.equal(payload(b).quality,true);});
test('rechaza opciones inventadas, sin teléfono o sin nombre',()=>{
 const b=input();b.a2H1LZ5GVQGhfqr34ZbI='mañana';assert.throws(()=>payload(b));
 const c=input();c.phone='12';assert.throws(()=>payload(c));const d=input();d.name='';assert.throws(()=>payload(d));});
test('comprobante firmado: no se puede falsificar ni usar vencido',()=>{
 const r=sign({id:'abc',at:Date.now()},'k');assert.equal(verify(r,'k').id,'abc');assert.equal(verify(r,'otra'),null);assert.equal(verify(r.replace(/^./,'x'),'k'),null);
 assert.equal(verify(sign({id:'a',at:Date.now()-3*3600000},'k'),'k'),null);});
test('teléfono: 9 de celular en Argentina y sin duplicar el código de país',()=>{
 const b=input();for(const [c,ph,exp] of [['54','0351 15 512-3456','+5493515123456'],['54','011 15 5555-1234','+5491155551234'],['54','+54 9 351 000 0125','+5493510000125'],['54','5493510000125','+5493510000125'],['598','99 123 456','+59899123456'],['52','55 1234 5678','+525512345678']]){b.country=c;b.phone=ph;assert.equal(payload(b).data.phone,exp,ph);}});
