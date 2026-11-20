from pathlib import Path
import re, base64, hashlib, json, copy
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1]
out=root/'dist'; (out/'assets').mkdir(parents=True,exist_ok=True)
def asset(m):
 data=base64.b64decode(m[2]); name=hashlib.sha256(data).hexdigest()[:20]+'.'+{'jpeg':'jpg','png':'png','webp':'webp'}[m[1]]
 (out/'assets'/name).write_bytes(data); return '/assets/'+name
v4=BeautifulSoup((root/'maquetas/Pagina_completa_v4.html').read_text(),'html.parser')
css='''html{scroll-behavior:smooth}body{margin:0}img{max-width:100%}*,*:before,*:after{box-sizing:border-box}.review-note{background:#fff3cd;color:#463800;padding:12px 18px;text-align:center;font:14px/1.5 sans-serif}.meg-extra{padding:64px 24px;background:#f4f7fc;color:#14213b;font-family:Arial,sans-serif}.meg-extra>div{max-width:1000px;margin:auto}.meg-extra h2{font-size:clamp(26px,4vw,38px)}.meg-extra details{padding:18px 0;border-bottom:1px solid #cad3e1}.meg-extra summary{font-weight:bold;cursor:pointer}.meg-extra p,.meg-extra li{line-height:1.7}.meg-metrics{display:flex;flex-wrap:wrap;justify-content:center;gap:24px;padding:24px 0}.stats .lt>.meg-metrics{grid-column:1/-1;width:100%}.meg-metrics b{display:block;font-size:30px}.meg-metrics div{flex:1;min-width:140px}.stats .lt{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important}.meg-booking iframe{width:100%;height:1080px;border:0;border-radius:16px;background:white}.meg-booking a{color:#1551c9}@media(max-width:600px){.stats .lt{grid-template-columns:1fr!important}.meg-booking iframe{height:1200px}input,select,textarea{font-size:16px!important}.meg-extra{padding:40px 20px}}'''
faq='<section class="meg-extra" id="preguntas"><div><h2>Preguntas antes de agendar</h2>'+''.join(str(x) for x in v4.select('.faq details')[:3])+'</div></section>'
pains='<section class="meg-extra"><div><h2>¿Te pasa alguna de estas?</h2><ul>'+''.join('<li>'+x.get_text(' ',strip=True)[1:]+'</li>' for x in v4.select('.pain'))+'</ul></div></section>'
metrics='<div class="meg-metrics"><div><b>+400</b>empresas y pymes</div><div><b>5 a 15%</b>más rentables</div><div><b>30</b>casos en video</div></div>'
for source,target,title in [('paquete/html_finales/Landing_corta.html','finanzas','MEG | Finanzas'),('paquete/html_finales/Pagina_completa.html','metodo','MEG | Método completo'),('maquetas/Pagina_completa_v4.html','metodomeg','MEG | Método completo V2'),('paquete/html_finales/Reservas.html','reservas','MEG | Reservas de prueba')]:
 raw=(root/source).read_text();raw=re.sub(r'data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)',asset,raw)
 raw=raw.replace('https://claude.ai/artifact/7vN2RA1CftugirTo6N2dp4','/metodo').replace('https://claude.ai/artifact/1Pp1MDEv2NeoFtGUz5VAEh','/reservas')
 raw=raw.replace('+394','+400').replace('450 empresas','400 empresas')
 if '<html' not in raw:raw='<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body>'+raw+'</body></html>'
 s=BeautifulSoup(raw,'html.parser')
 for el in s.select('meta[name=viewport],title'):el.decompose()
 s.head.append(BeautifulSoup('<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+title+'</title><style>'+css+'</style>','html.parser'))
 for script in s.select('script'):
  if '/* Contador:' in script.text:script.decompose()
 for el in list(s.select('.tbd')):
  if '$___' in el.text:el.parent.decompose()
  elif 'asesorías por semana' in el.text:el.parent.decompose()
  elif '__%' in el.text:el.parent.string='El problema de fondo suele ser el mismo: no saber cuánto ganás realmente.'
  elif 'primera semana' in el.text:el.parent.decompose()
 if target=='finanzas':
  s.select_one('.hero').append(BeautifulSoup(metrics,'html.parser'))
  close=s.select_one('#cierre');close.insert_before(BeautifulSoup(pains+faq,'html.parser'))
  cases=s.select_one('#casos')
  cases.insert_after(BeautifulSoup('<section class="meg-extra meg-booking" id="agendar"><div><h2>Conocé cómo reservar tu asesoría</h2><p>Vista de prueba: este formulario no crea citas ni envía tus datos.</p><iframe title="Formulario de reserva de prueba" src="/reservas" loading="lazy"></iframe><p>¿No ves el formulario? <a href="/reservas">Abrilo acá</a>.</p></div></section>','html.parser'))
  for a in s.select('a[href="/reservas"]'):
   if a.get_text(strip=True)!='Abrilo acá':a['href']='#agendar'
 if target=='metodo':
  stats=s.select_one('.hero .stats .lt')
  if stats:stats.clear();stats.append(BeautifulSoup(metrics,'html.parser'))
  existing=s.select_one('.faq')
  if existing:existing.insert_before(BeautifulSoup(faq,'html.parser'))
 if target!='finanzas':
  form=s.select_one('form')
  if form:form.insert_before(BeautifulSoup('<aside class="review-note">Vista de prueba: horarios de ejemplo. No crea reservas ni envía datos.</aside>','html.parser'))
  for t in list(s.find_all(string=True)):
   if t.parent.name not in ['style','script'] and 'Conectate desde una computadora' in t:
    t.replace_with(str(t).replace('Conectate desde una computadora, en un lugar tranquilo.',''))
  for script in s.select('script'):
   if 'Reservaste el ' in script.text:
    script.string=script.text.replace('Reservaste el ','Simulación: elegiste el ').replace('Te confirmamos por WhatsApp. (Maqueta: no se envió nada)','No se creó ninguna cita ni se enviaron datos.')
  for t in list(s.find_all(string=True)):
   if '¡Listo! Tu asesoría quedó agendada' in t:t.replace_with(str(t).replace('¡Listo! Tu asesoría quedó agendada','Prueba completada — no se creó una cita'))
 (out/(target+'.html')).write_text(str(s))
(out/'index.html').write_text((out/'finanzas.html').read_text())
(out/'vercel.json').write_text(json.dumps({'cleanUrls':True,'headers':[{'source':'/(.*)','headers':[{'key':'X-Robots-Tag','value':'noindex, nofollow'}]}]}))
print('Built /finanzas, /metodo, /metodomeg, /reservas and / alias')

import runpy
runpy.run_path(str(root/"scripts/refine-release.py"))
