"""Mensajes y audios de alumnos (capturas con datos tapados) en cada página de gracias, por rubro.

Fuente: config/testimonios-prints.json + web/testimonios/*.jpg (SOL-261119-62, rubro tomado del
modelo de negocio de cada alumno en GHL; SOL-261124-138). Nivel 1 = resultados concretos,
2 = muy buenos, 3 = extras (van detrás de «Ver más»). /gracias/general muestra los alumnos
sin rubro identificado más los de nivel 1 de todos los rubros.
"""
from pathlib import Path
from bs4 import BeautifulSoup
import json, shutil, html

root = Path(__file__).resolve().parents[1]
out = root / 'dist'
prints = json.loads((root / 'config/testimonios-prints.json').read_text())
dest = out / 'assets/testimonios'
dest.mkdir(parents=True, exist_ok=True)
for p in prints:
    shutil.copyfile(root / 'web/testimonios' / p['archivo'], dest / p['archivo'])

CSS = ('<style>.ty-msgs{columns:3 260px;column-gap:16px;margin-top:28px}'
       '.ty-msg{display:block;break-inside:avoid;margin:0 0 16px;padding:0;border:1px solid #3d587a;border-radius:16px;'
       'overflow:hidden;background:#fff;cursor:zoom-in;width:100%}'
       '.ty-msg img{display:block;width:100%;height:auto}.ty-msg:hover{border-color:#98b8ff}'
       '.ty-msg:focus-visible{outline:3px solid #abc7ff;outline-offset:4px}'
       '.ty-more{display:block;margin:8px auto 0;padding:14px 22px;border:1px solid #98b8ff;border-radius:999px;'
       'background:transparent;color:#fff;font:inherit;font-weight:600;cursor:pointer}'
       '.ty-msgs-extra[hidden]{display:none}'
       '.ty-zoom{position:fixed;inset:0;z-index:99;display:grid;place-items:center;padding:20px;background:#0b1220e6;cursor:zoom-out}'
       '.ty-zoom[hidden]{display:none}.ty-zoom img{max-width:min(560px,100%);max-height:100%;border-radius:12px;overflow:auto}'
       '</style>')

JS = ('<script>(function(){var z=document.getElementById("tyZoom");if(!z)return;var i=z.querySelector("img");'
      'document.querySelectorAll(".ty-msg").forEach(function(b){b.addEventListener("click",function(){'
      'i.src=b.querySelector("img").src;i.alt=b.querySelector("img").alt;z.hidden=false})});'
      'z.addEventListener("click",function(){z.hidden=true;i.removeAttribute("src")});'
      'document.addEventListener("keydown",function(e){if(e.key==="Escape")z.hidden=true});'
      'var m=document.getElementById("tyMore");if(m)m.addEventListener("click",function(){'
      'document.getElementById("tyMsgsExtra").hidden=false;m.remove()})})();</script>')


def card(p):
    alt = 'Mensaje de un alumno' + (' (audio transcripto)' if p['tipo'] == 'audio' else '')
    if p.get('frase'):
        alt += ': ' + p['frase']
    return ('<button type="button" class="ty-msg"><img src="/assets/testimonios/' + p['archivo'] + '" alt="'
            + html.escape(alt, quote=True) + '" loading="lazy" width="' + str(p['ancho']) + '" height="'
            + str(p['alto']) + '"></button>')


def section(sel, titulo):
    sel = sorted(sel, key=lambda p: (p['nivel'], p['tipo'] != 'texto', p['archivo']))
    first = [p for p in sel if p['nivel'] < 3] or sel[:6]
    rest = [p for p in sel if p not in first]
    h = '<h2>' + titulo + '</h2><p>Mensajes y audios reales que nos mandaron alumnos. Tapamos nombres y datos de contacto.</p>'
    h += '<div class="ty-msgs">' + ''.join(card(p) for p in first) + '</div>'
    if rest:
        h += ('<div class="ty-msgs ty-msgs-extra" id="tyMsgsExtra" hidden>' + ''.join(card(p) for p in rest) + '</div>'
              '<button type="button" class="ty-more" id="tyMore">Ver ' + str(len(rest)) + ' mensajes más</button>')
    h += '<div class="ty-zoom" id="tyZoom" hidden role="dialog" aria-label="Mensaje ampliado"><img alt=""></div>'
    return h


RUBROS = {'fabricante': 'fab', 'reventa': 'rev', 'gastronomia': 'gas', 'servicios': 'ser'}
for slug, code in list(RUBROS.items()) + [('general', None)]:
    page = out / ('gracias-' + slug + '.html')
    s = BeautifulSoup(page.read_text(), 'html.parser')
    if code:
        sel = [p for p in prints if p['rubro'] == code]
        titulo = 'Lo que nos escriben alumnos de tu rubro'
    else:
        sel = [p for p in prints if p['rubro'] == 'general' or p['nivel'] == 1]
        titulo = 'Lo que nos escriben los alumnos'
    anchor = next(p for p in s.main.find_all('p', recursive=False) if 'Para la llamada' in p.get_text())
    anchor.insert_before(BeautifulSoup(section(sel, titulo), 'html.parser'))
    s.head.append(BeautifulSoup(CSS, 'html.parser'))
    s.body.append(BeautifulSoup(JS, 'html.parser'))
    page.write_text(str(s))
print('Mensajes de alumnos por rubro en /gracias: ' + ', '.join(
    slug + ' ' + str(len([p for p in prints if (p['rubro'] == c if c else (p['rubro'] == 'general' or p['nivel'] == 1))]))
    for slug, c in list(RUBROS.items()) + [('general', None)]))
