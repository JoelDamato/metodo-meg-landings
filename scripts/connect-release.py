from pathlib import Path
from bs4 import BeautifulSoup
import shutil,json
root=Path(__file__).resolve().parents[1];out=root/'dist'
# Inline the already reviewed form in every landing; remove standalone registration.
reference=BeautifulSoup((out/'metodomeg.html').read_text(),'html.parser')
form=reference.find('form')
form.find('button',type='submit').string='Enviar mi solicitud'
phone=form.find(id='phone');phone['placeholder']='+54 9 11 1234 5678';phone['pattern']=r'\+[0-9 ()-]{8,22}'
trap=BeautifulSoup('<div hidden aria-hidden="true"><label>Sitio web<input name="website" tabindex="-1" autocomplete="off"></label></div>','html.parser');form.append(trap)
css='<style>#agendar form{max-width:720px;margin:24px auto;text-align:left}#f .fld{margin-bottom:20px}#f label{display:block;line-height:1.5;margin-bottom:8px;color:inherit}#f input,#f select{display:block;width:100%;box-sizing:border-box;min-height:48px;padding:12px;background:#fff;color:#14243d;border:1px solid #a3b5cc;border-radius:8px;font:inherit}#f button{padding:16px;background:#2463e8;color:white;border:0;border-radius:10px;cursor:pointer}#f [hidden]{display:none!important}#qualification-result{padding:16px;line-height:1.6}#f button:disabled{opacity:.7}</style>'
for route in ['index','finanzas','costos','rentabilidad','metodo','metodomeg']:
 p=out/(route+'.html');s=BeautifulSoup(p.read_text(),'html.parser')
 if s.find('form'):s.find('form').replace_with(BeautifulSoup(str(form),'html.parser'))
 else:
  section=s.find(id='agendar');section.clear();section.append(BeautifulSoup('<h2>Aplicá a una llamada de diagnóstico</h2><p>Contanos sobre tu empresa.</p>'+str(form),'html.parser'))
  s.body.append(BeautifulSoup('<script src="/qualification.js"></script><script src="/native-form.js"></script>','html.parser'))
 for note in s.select('.review-note'):note.decompose()
 for a in s.select('a[href]'):
  if '/reservas' in a['href']:a['href']='#agendar'
 for iframe in s.select('iframe[src]'):
  if '/reservas' in iframe['src']:iframe.decompose()
 s.head.append(BeautifulSoup(css,'html.parser'));p.write_text(str(s))
(out/'reservas.html').unlink(missing_ok=True)
v=json.loads((out/'vercel.json').read_text());v['redirects']=[{'source':'/reservas','destination':'/metodomeg#agendar','permanent':False}];(out/'vercel.json').write_text(json.dumps(v))
for n in ['attribution.js','native-form.js']:shutil.copyfile(root/'web'/n,out/n)
(out/'api').mkdir(exist_ok=True);(out/'server').mkdir(exist_ok=True)
shutil.copyfile(root/'server/handler.cjs',out/'api/register.js')
p=out/'api/register.js';p.write_text(p.read_text().replace("require('./register.cjs')","require('../server/register.cjs')"))
for n in ['register.cjs','questions.json','qualification.cjs']:shutil.copyfile(root/'server'/n,out/'server'/n)

shutil.copyfile(root/'server/booking-status.cjs',out/'api/booking-status.js')
p=out/'api/booking-status.js';p.write_text(p.read_text().replace("require('./thank-you-routing.cjs')","require('../server/thank-you-routing.cjs')"))
shutil.copyfile(root/'server/thank-you-routing.cjs',out/'server/thank-you-routing.cjs')
s=BeautifulSoup((out/'gracias-servicios.html').read_text(),'html.parser');s.select_one('.ty-cases').decompose();s.title.string='Próximos pasos | MEG';pill=s.select_one('.pill');pill.string='Tu próxima llamada';(out/'gracias-general.html').write_text(str(s))
v=json.loads((out/'vercel.json').read_text());v['rewrites'].append({'source':'/gracias/general','destination':'/gracias-general'});(out/'vercel.json').write_text(json.dumps(v))

import runpy
runpy.run_path(str(root/"scripts/testimonios-release.py"))
