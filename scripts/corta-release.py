# Landing corta (/ y /finanzas) según Walter, 24-11-2026 (SOL-261124-08):
# sin franja de números, sin formulario, sin «¿Te pasa alguna de estas?» ni preguntas frecuentes,
# y todos los botones de agendar llevan a /reservas, que pasa a ser una página aparte sólo con el formulario
# (para que la persona no se distraiga). Las largas (/metodo, /metodomeg) siguen con el formulario adentro.
from pathlib import Path
from bs4 import BeautifulSoup
import json
root=Path(__file__).resolve().parents[1];out=root/'dist'
base=BeautifulSoup((out/'finanzas.html').read_text(),'html.parser')

# /reservas: la misma cabecera, estilos y scripts de la corta, con el formulario como único contenido.
r=BeautifulSoup(str(base),'html.parser')
r.title.string='Aplicá a una llamada de diagnóstico | MEG'
nav=r.select_one('.nav')
for a in nav.select('a[href^="#"]'):a.decompose()
for el in nav.select('.live'):el.decompose()
keep={'nav','agendar','foot'}
for el in list(r.body.find_all(recursive=False)):
 if el.name=='script':
  if not el.get('src') or 'converteai' in el.get('src',''):el.decompose()
  continue
 if el.name in ('meta','link','style'):continue
 if el.get('id') in keep or set(el.get('class') or [])&keep:continue
 el.decompose()
section=r.select_one('#agendar');section['style']='padding-top:120px;min-height:80vh'
r.head.append(BeautifulSoup('<style>#agendar>h2,#agendar>p{max-width:720px;margin-left:auto;margin-right:auto}</style>','html.parser'))
# El registro guarda desde qué landing llegó (?landing_path=/finanzas); attribution.js pondría /reservas.
r.body.append(BeautifulSoup("""<script>(()=>{const p=new URLSearchParams(location.search).get('landing_path');if(!['/','/finanzas'].includes(p))return;const f=document.getElementById('f');if(!f)return;let i=f.querySelector('input[name="landing_path"]');if(!i){i=document.createElement('input');i.type='hidden';i.name='landing_path';f.appendChild(i)}i.value=p;})();</script>""",'html.parser'))
(out/'reservas.html').write_text(str(r))

for route,landing in [('finanzas','/finanzas'),('index','/')]:
 p=out/(route+'.html');s=BeautifulSoup(p.read_text(),'html.parser')
 for el in s.select('.meg-metrics, #agendar, #preguntas'):el.decompose()
 for sec in s.select('section.meg-extra'):
  if sec.find('h2') and '¿Te pasa alguna de estas?' in sec.find('h2').get_text():sec.decompose()
 for a in s.select('a[href="#agendar"]'):a['href']='/reservas?landing_path='+landing
 for sc in s.select('script[src="/qualification.js"], script[src="/native-form.js"]'):sc.decompose()
 p.write_text(str(s))

v=json.loads((out/'vercel.json').read_text())
v['redirects']=[x for x in v.get('redirects',[]) if x.get('source')!='/reservas']
if not v['redirects']:v.pop('redirects')
(out/'vercel.json').write_text(json.dumps(v))
print('Corta sin formulario; /reservas es una página aparte con el formulario.')
