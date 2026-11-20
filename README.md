# MEG · Landings de Walter

Sitio público de Matías Randazzo. Repositorio de trabajo para Joel, Walter y Marucho17 / Scalito.

## Rutas
- `/` y `/finanzas`: corta, video destacado y métricas después del video.
- `/metodo`: larga con imágenes de casos.
- `/metodomeg`: larga V2 con casos en video y filtros por rubro.
- `/reservas`: **demostración**, no crea citas ni envía datos.
- `/gracias/fabricante`, `/gracias/reventa`, `/gracias/gastronomia`, `/gracias/servicios`: contenido por rubro preparado. Aún no conectado al evento de reserva real.

## Desarrollo y publicación
Instalar `scripts/requirements.txt` en un entorno Python y ejecutar `python scripts/build-preview.py`. Los archivos estáticos se generan en `dist/`. Vercel está conectado a este repo: un push a `main` publica `dist/`. Para publicar manualmente, ejecutar Vercel desde la raíz del repo (Root Directory configurado en `dist`). Proyecto Vercel `meg-landings-wally` del equipo `joeldamatos-projects`.

Dominio previsto: `metodo.matirandazzook.com`. No modificar el dominio existente `meg.matirandazzook.com`.

## Configuración y pendientes
`config/site.json` centraliza los identificadores públicos. No guardar credenciales en este repo.

- Walter debe confirmar qué calendario de GHL usar. No elegir A–E, retargeting o webinar por inferencia. Hasta entonces no activar reservas ni redirecciones automáticas.
- Al conectar: reutilizar las preguntas/opciones reales de Mati, guardar la atribución por registro en GHL y comprobar reserva, asignación, avisos y redirección por rubro con un contacto de prueba autorizado.
- `attribution.js` conserva UTM y click IDs durante la navegación de la sesión (30 min). Una nueva campaña reemplaza el conjunto anterior completo. **No equivale aún a persistencia en GHL ni a histórico servidor.**
- VSL actual reproducible en la página desde el YouTube entregado. Falta identificar el player Vturb de ese VSL; los testimonios Vturb están configurados desde la maqueta V4. Verificar que Vturb permita el dominio nuevo cuando se conecte.
- Walter todavía debe pasar las imágenes definitivas de los casos; se usan las existentes.
- El elemento visual de Instagram queda pendiente de recibir la captura/diseño definido con Nahue. No agregar un enlace clickeable.
- Las páginas de gracias preparadas contienen testimonios por rubro. Falta contrastar con el contenido definitivo de la página actual y conectar después de reserva confirmada.
- ManyChat es un trabajo separado: origen disponible, alta temprana en GHL y recursos por intención. No modificar automatizaciones desde este repo.

## DNS solicitado por Vercel
CNAME `metodo` → `e74e3a60385436fb.vercel-dns-017.com.`
TXT `_vercel` → `vc-domain-verify=metodo.matirandazzook.com,14593c7a4ae4e6f02d2d`
Conservar los demás registros existentes. Verificar dominio y HTTPS después de propagación.
