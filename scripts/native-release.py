from pathlib import Path
from bs4 import BeautifulSoup
import json,html,re,shutil
root=Path(__file__).resolve().parents[1];out=root/'dist'
fields=json.loads((root/'config/ghl-questions.json').read_text())['fields']
roles={'auI2TkFngL0NXTEDjMiy':('mod','business'),'2sg2SekJNPo7FQMGrGJS':('system','system'),'DKxaXQRPf3AdTwIqAXJl':('excel','excel'),'PddCUxnULUR7V2KwinRk':('revenue','revenue')}
parts=[]
for key,label,typ,auto in [('first_name','Nombre','text','given-name'),('last_name','Apellidos','text','family-name'),('phone','Número de WhatsApp (Verifica que sea correcto. Sino, no podremos contactarte)','tel','tel'),('email','Email (Verifica que sea correcto. Sino, no podremos contactarte)','email','email')]:
 parts.append(f'<div class="fld"><label for="{key}">{label}</label><input class="inp" id="{key}" name="{key}" type="{typ}" autocomplete="{auto}" required></div>')
for f in fields:
 id,role=roles.get(f['id'],(f['id'],'question'))
 options=''.join('<option>'+html.escape(o)+'</option>' for o in f['picklistOptions'])
 parts.append(f'<div class="fld"><label for="{id}">{html.escape(f["label"])}</label><select id="{id}" name="{f["id"]}" data-role="{role}" required><option value="">Seleccionar</option>{options}</select></div>')
form='<form id="f">'+''.join(parts)+'<button type="submit" class="btn">Ver si mi empresa aplica</button><p id="qualification-result" role="status" hidden></p></form>'
for route in ['metodo','metodomeg','reservas']:
 p=out/(route+'.html');s=BeautifulSoup(p.read_text(),'html.parser')
 for script in s.select('script:not([src])'):
  text=script.text
  if "var tel=$('tel')" in text:
   start=text.index("var tel=$('tel')")
   script.string=text[:start]+'})();'
 for textnode in list(s.find_all(string=True)):
  if textnode.parent.name in ['script','style']:continue
  replacements={'Agenda abierta':'Aplicación MEG','Elegí día y horario':'Conocé si tu empresa aplica','agenda.matirandazzook.com':'Método Acelerador de Ganancias','Vista de prueba: horarios de ejemplo. No crea reservas ni envía datos.':'Formulario en preparación. No crea reservas ni envía datos.'}
  value=str(textnode)
  for before,after in replacements.items():value=value.replace(before,after)
  if value!=str(textnode):textnode.replace_with(value)
 old=s.find('form');old.replace_with(BeautifulSoup(form,'html.parser'))
 for ident in ['cal','final']:
  el=s.find(id=ident)
  if el:el.decompose()
 for script in s.select('script[src="/form-routing.js"]'):
  script.insert_before(BeautifulSoup('<script src="/qualification.js"></script><script src="/native-form.js"></script>','html.parser'))
 s.head.append(BeautifulSoup('<style>#f .fld{margin-bottom:20px}#f label{display:block;margin-bottom:8px;line-height:1.5}#f select,#f input{width:100%;max-width:100%;min-height:48px}#f select{white-space:normal}#qualification-result{padding:20px;line-height:1.6}.fld[hidden]{display:none!important}</style>','html.parser'))
 p.write_text(str(s))
for name in ['qualification.js','native-form.js']:shutil.copyfile(root/'web'/name,out/name)
# Keep each campaign's message and attribution distinct.
base=(out/'finanzas.html').read_text()
variants={
 'finanzas':('Ordená las finanzas de tu empresa y tomá decisiones con números claros','Conocé dónde ganás, dónde perdés y cuánto dinero queda realmente en tu negocio.'),
 'costos':('Conocé tus costos reales y dejá de perder margen sin verlo','Identificá qué productos y gastos se llevan tu rentabilidad para decidir con información.'),
 'rentabilidad':('Encontrá oportunidades para mejorar la rentabilidad sin vender más','Revisá tus precios, costos y márgenes con el Método Acelerador de Ganancias.')}
for route,(title,subtitle) in variants.items():
 s=BeautifulSoup(base,'html.parser');s.h1.string=title;s.title.string=title+' | MEG'
 hero=s.select_one('.hero');p=hero.find('p') if hero else None
 if p:p.string=subtitle
 for a in s.select('a[href]'):
  if '/reservas' in a['href']:a['href']='/reservas?landing_path=/'+route
 (out/(route+'.html')).write_text(str(s))
(out/'index.html').write_text((out/'finanzas.html').read_text())
p=out/'attribution.js';p.write_text(p.read_text().replace("'/metodomeg']","'/metodomeg','/costos','/rentabilidad']"))
# Follow the original thank-you structure, keeping niche-specific testimonial cards.
for p in out.glob('gracias-*.html'):
 s=BeautifulSoup(p.read_text(),'html.parser');main=s.main
 main.h1.string='Tu llamada todavía debe confirmarse'
 intro=main.h1.find_next_sibling('p');intro.string='Si ya reservaste tu horario, mirá este video y confirmá tu llamada cuando el equipo te contacte por WhatsApp.'
 intro.insert_after(BeautifulSoup('<h2>Mirá este video antes de tu llamada</h2><p>Menos de 2 minutos</p><vturb-smartplayer id="vid-69160265ce805234276f65b0" style="display:block;width:100%;margin:24px auto"></vturb-smartplayer><script async src="https://scripts.converteai.net/f2731136-98ca-448a-966f-e779f8cf0481/players/69160265ce805234276f65b0/v4/player.js"></script><p><strong>Paso final:</strong> confirmá tu llamada por WhatsApp con el equipo.</p>','html.parser'))
 main.append(BeautifulSoup('<h2>Seguí aprendiendo sobre administración, costos y gestión</h2><div class="ty-cases">'+''.join('<iframe class="vsl-inline" loading="lazy" title="Clase práctica para PYMES '+str(i+1)+'" src="https://www.youtube-nocookie.com/embed/'+v+'" allowfullscreen></iframe>' for i,v in enumerate(['Dfv6N-ZXtJM','8qNd-u_4zTA']))+'</div>','html.parser'))
 p.write_text(str(s))
print('Exact GHL survey options, binary qualification and ad variants prepared. Booking remains disconnected.')
import runpy
runpy.run_path(str(root/'scripts/connect-release.py'))
