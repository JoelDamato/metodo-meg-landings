from pathlib import Path
from bs4 import BeautifulSoup
import json
root=Path(__file__).resolve().parents[1];out=root/'dist'
config=json.loads((root/'config/site.json').read_text())
v4=BeautifulSoup((out/'metodomeg.html').read_text(),'html.parser')
styles=''.join(str(x) for x in v4.select('style'))
font='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">'
extra='<style>body,input,select,button,.meg-extra{font-family:Inter,Arial,sans-serif}.meg-metrics{font-family:inherit}.vsl-inline{width:100%;aspect-ratio:16/9;border:0;display:block}.visual-instagram{font-size:14px;opacity:.8;margin-top:20px}.hero{padding-bottom:36px!important}.hero .meg-metrics{margin-top:12px}.case-static{pointer-events:none}.case-static img:not(.clg){border-radius:12px}.case-static{margin:0}.ty-cases{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}.ty-case{padding:20px;border:1px solid #3d587a;border-radius:16px;background:#122540;color:white;text-align:left;cursor:pointer}.ty-player{margin:24px 0}.pending-booking{padding:24px;border:1px solid #62738a;border-radius:14px;background:#132742;color:#fff}.stats .lt>.meg-metrics{grid-column:1/-1}</style>'
tracking=r'''(()=>{const keys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','fbclid','gclid','wbraid','gbraid'];const q=new URLSearchParams(location.search);let current={};try{const old=JSON.parse(sessionStorage.getItem('meg_attribution')||'null');if(old&&Date.now()-old.at<1800000)current=old.data||{};}catch{}if(keys.some(k=>q.has(k))){current={};keys.forEach(k=>{const v=q.get(k);if(v)current[k]=v.slice(0,500)});current.landing_path=location.pathname;try{sessionStorage.setItem('meg_attribution',JSON.stringify({at:Date.now(),data:current}))}catch{}}document.querySelectorAll('a[href]').forEach(a=>{const u=new URL(a.href,location.href);if(u.origin!==location.origin)return;Object.entries(current).forEach(([k,v])=>u.searchParams.set(k,v));a.href=u.href});document.querySelectorAll('form').forEach(f=>{Object.entries(current).forEach(([k,v])=>{let i=f.querySelector('input[name="'+k+'"]');if(!i){i=document.createElement('input');i.type='hidden';i.name=k;f.appendChild(i)}i.value=v})});})();'''
(out/'attribution.js').write_text(tracking)
for route in ['finanzas','metodo','metodomeg','reservas']:
 p=out/(route+'.html');s=BeautifulSoup(p.read_text(),'html.parser');s.head.append(BeautifulSoup(font+extra,'html.parser'))
 if route=='finanzas':
  metrics=s.select_one('.hero .meg-metrics')
  if metrics:s.select_one('#video').insert_after(metrics.extract())
  player=s.select_one('#vsl')
  if player:player.replace_with(BeautifulSoup('<iframe class="vsl-inline" title="Conocé el Método Acelerador de Ganancias" src="https://www.youtube-nocookie.com/embed/'+config['vslYoutubeId']+'" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>','html.parser'))
 if route=='metodo':
  # Original long page is the image variant. Preserve photos and actual testimonials.
  for b in list(s.select('#casos button[data-id], #casos button[data-v]')):
   b.name='figure';b['class']=['cimg','case-static'];b.attrs={k:v for k,v in b.attrs.items() if not k.startswith('data-') and k not in ['type','aria-label']}
   for overlay in b.select('.cplay'):overlay.decompose()
   for t in list(b.find_all(string=True)):
    if 'Ver fragmento' in t or 'Ver testimonio' in t:t.extract()
 for f in s.select('form'):
  f.insert_before(BeautifulSoup('<p class="review-note">La agenda real está pendiente de conexión. Esta vista no guarda registros ni confirma citas.</p>','html.parser'))
 s.body.append(BeautifulSoup('<script src="/attribution.js?v=20261120"></script>','html.parser'))
 p.write_text(str(s))
(out/'index.html').write_text((out/'finanzas.html').read_text())
for slug,label,code in [('fabricante','Fabricación','fab'),('reventa','Reventa y distribución','rev'),('gastronomia','Gastronomía','gas'),('servicios','Servicios','ser')]:
 cards=v4.select('.rc[data-r="'+code+'"]')
 if not cards:
  # Exact source category is retained; no inferred video attribution.
  codes=sorted({c.get('data-r') for c in v4.select('.rc')});raise ValueError((slug,codes))
 buttons=''.join('<button class="ty-case" data-player="'+c['data-v']+'">'+c.get_text(' ',strip=True)+'</button>' for c in cards)
 page='<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Próximos pasos | '+label+' · MEG</title>'+font+styles+extra+'</head><body><header><div class="wrap">Matías Randazzo · MEG</div></header><main class="wrap" style="padding-top:70px;padding-bottom:70px"><p class="pill">'+label+'</p><h1>Prepará tu conversación con el equipo</h1><p>Revisá la confirmación de tu cita en tu correo. Si todavía no elegiste un horario, completá la reserva cuando la agenda esté disponible.</p><h2>Conocé experiencias de tu rubro</h2><div class="ty-cases">'+buttons+'</div><div class="ty-player" id="tyPlayer"></div><p>Para la llamada, buscá un lugar tranquilo y tené a mano los números de tu empresa.</p></main><script>document.querySelectorAll("[data-player]").forEach(b=>b.addEventListener("click",()=>{const p=document.getElementById("tyPlayer");p.replaceChildren();const v=document.createElement("vturb-smartplayer");v.id="vid-"+b.dataset.player;p.appendChild(v);const s=document.createElement("script");s.src="https://scripts.converteai.net/'+config['vturbAccountId']+'/players/"+b.dataset.player+"/v4/player.js";s.async=true;p.appendChild(s);p.scrollIntoView({behavior:"smooth",block:"center"})}));</script></body></html>'
 (out/('gracias-'+slug+'.html')).write_text(page)
v=json.loads((out/'vercel.json').read_text());v['rewrites']=[{'source':'/gracias/'+x,'destination':'/gracias-'+x+'.html'} for x in ['fabricante','reventa','gastronomia','servicios']];(out/'vercel.json').write_text(json.dumps(v))
print('Refined visual variants, attribution and thank-you routes. Booking remains disabled pending calendar selection.')
