# Pixel de Meta 871683891257529 en todas las páginas (SOL-261124-24, pedido de Walter del 24-11-2026).
# PageView en cada página (sólo si la página no está dentro de un iframe, para no contar doble).
# Los eventos de cita (LlamadaAgendada y Schedule) los dispara native-form.js recién cuando el servidor
# confirma una cita real en GHL (/api/booking-status). Idempotente: se puede correr más de una vez.
from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1];out=root/'dist'
PIXEL='871683891257529'
snippet=f"""<!-- Meta Pixel --><script id="meg-meta-pixel">!function(f,b,e,v,n,t,s){{if(f.fbq)return;n=f.fbq=function(){{n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)}};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','{PIXEL}');if(window.top===window.self)fbq('track','PageView');</script><noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id={PIXEL}&ev=PageView&noscript=1"/></noscript><!-- /Meta Pixel -->"""
n=0
for page in sorted(out.glob('*.html')):
 html=page.read_text()
 if 'id="meg-meta-pixel"' in html:continue
 i=html.find('<head>')
 if i<0:raise SystemExit(f'{page.name}: sin <head>')
 i+=len('<head>');page.write_text(html[:i]+snippet+html[i:]);n+=1
for name in ['qualification.js','native-form.js']:shutil.copyfile(root/'web'/name,out/name)
for name in ['qualification.cjs','register.cjs']:shutil.copyfile(root/'server'/name,out/'server'/name)
for src,dst,dep in [('handler.cjs','register.js','register.cjs'),('booking-status.cjs','booking-status.js','thank-you-routing.cjs')]:
 (out/'api'/dst).write_text((root/'server'/src).read_text().replace(f"require('./{dep}')",f"require('../server/{dep}')"))
print(f'Pixel {PIXEL} agregado en {n} páginas.')
