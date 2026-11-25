# /reservas con el diseño y funcionamiento de la maqueta de Walter (SOL-261125-16, 25-11-2026):
# formulario que se despliega + calendario propio contra el calendario real de GHL (api/reserva.js).
# Reemplaza la /reservas que arma corta-release.py. Idempotente.
from pathlib import Path
import json,shutil
root=Path(__file__).resolve().parents[1];out=root/'dist'
q=json.loads((root/'server/reserva-questions.json').read_text())['fields']
preguntas=json.dumps([{'id':f['id'],'label':f['label'],'picklistOptions':f['picklistOptions']} for f in q],ensure_ascii=False)
(out/'reservas.html').write_text((root/'web/reservas.html').read_text().replace('__PREGUNTAS__',preguntas))
shutil.copyfile(root/'web/reservas.js',out/'reservas.js')
(out/'server').mkdir(exist_ok=True);(out/'api').mkdir(exist_ok=True)
for n in ['reserva.cjs','reserva-questions.json','thank-you-routing.cjs']:shutil.copyfile(root/'server'/n,out/'server'/n)
(out/'api/reserva.js').write_text((root/'server/reserva-handler.cjs').read_text().replace("require('./","require('../server/"))
print('/reservas: maqueta de Walter con el calendario real (api/reserva).')
