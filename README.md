# MEG · Landings de Walter

Sitio público de Matías Randazzo. Repositorio de trabajo para Joel, Walter y Marucho17 / Scalito.

## Rutas
- `/` y `/finanzas`: corta, video destacado y métricas después del video.
- `/metodo`: larga con imágenes de casos.
- `/metodomeg`: larga V2 con casos en video y filtros por rubro.
- `/reservas`: formulario de la corta; registra en GHL y, si aplica, muestra el calendario real y redirige a `/gracias/<rubro>` al confirmar la cita.
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

### Redirección por rubro preparada (20/11)
`web/thank-you-routing.js` mapea las opciones exactas del formulario. `form-routing.js` actualiza un campo oculto `thank_you_path` al elegir rubro. No redirige al completar datos ni al usar la agenda simulada. Al conectar la agenda real, el backend debe validar la cita y el rubro; recién entonces el adaptador podrá habilitar `MEG_BOOKING_ENABLED` y llamar `MEGRedirectAfterBooking` con confirmación e ID de cita. Esta marca del navegador no es una validación de seguridad: la confirmación debe venir del servidor. Los rubros desconocidos no se adjudican por defecto. Pruebas: `node --test test/thank-you-routing.test.cjs`.

Miniaturas de los 30 testimonios obtenidas de los players Vturb correspondientes y verificadas; URLs en `config/video-thumbnails.json`. No son imágenes genéricas.

### Pixel de Meta y regla de aplica (SOL-261124-24, 24/11)
- Regla de aplica (Walter, 24/11): **no aplica** si lleva las finanzas en cuaderno / nada sistematizado, si factura menos de 10.000 USD/mes, o si usa solamente Excel y responde que **no** tiene los datos cargados. Todo lo demás aplica y ve el calendario. El capital no filtra. `web/qualification.js` (copia en `server/qualification.cjs`).
- `scripts/pixel-release.py` (lo corre `connect-release.py` al final) pone el Pixel `871683891257529` en el `<head>` de todas las páginas de `dist/`. PageView sólo si la página no está dentro de un iframe.
- `LlamadaAgendada` (custom) y `Schedule` (estándar) los dispara `native-form.js` recién cuando `/api/booking-status` confirma una cita real en el calendario `lPdipJGxlyfyyZFPH7wq`, con `eventID` `llamada_<id de cita>` / `schedule_<id de cita>`. `Schedule` sólo si el lead es «aplica +» (aplica y tiene capital para invertir), calculado en el servidor y firmado en el recibo.
- Pruebas: `node --test test/*.cjs`. Para probar el pixel en el navegador hay que usar Chrome con ventana (Meta descarta el tráfico de navegadores headless).
