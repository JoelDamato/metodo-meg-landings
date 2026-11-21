# Formulario nativo MEG — estado

Copia independiente. El sitio original y GHL no fueron modificados.

Preguntas y opciones copiadas de la encuesta publicada rbMEYfSbnkPn2B4LMyn1, que usa el sitio original; fuente y opciones en config/ghl-questions.json.

Sin scoring. Aplica si elige una banda desde «Entre 30.000 y 50.000 USD al mes» en adelante Y una opción que indique que tiene sistema (incluye tenerlo pero casi no usarlo). Excel solo no aplica. El rango no distingue exactamente 30.000 de 30.001; se clasifica por la banda existente de GHL.

Preguntas restantes se conservan, pero no alteran esta regla de dos condiciones. La pregunta de detalle de Excel se muestra si la respuesta de sistema menciona Excel.

Pendiente Walter: agenda definitiva y equipo de closers del reparto. Los formularios ya guardan y actualizan contactos, respuestas, clasificación y UTM en GHL. No se crean citas ni se activa reparto hasta confirmar agenda. La pantalla distingue registro recibido de reserva confirmada.

Implementado /api/register: validación del servidor y upsert en GHL, UTM en campos existentes y lastAttributionSource. Pendiente: obtener confirmación de cita real y closer desde la agenda de GHL; solo entonces habilitar redirección por rubro. No confiar en flags del navegador como seguridad.

Rubro «Otro» requiere destino general antes de activar reservas; no inferir industria. Las páginas de gracias por rubro tienen el video de preparación del sitio original y testimonios específicos.

Formularios integrados en /, /finanzas, /costos, /rentabilidad, /metodo y /metodomeg. /reservas redirige a /metodomeg#agendar. Prueba real con contacto QA MEG en DND: creación y reentrada sin duplicado; respuestas y cinco UTM verificadas por lectura de GHL.

## Actualización 21/11 — agenda propia conectada

Agenda creada por instrucción de Jota: Postulación MEG | Landings sin scoring (lPdipJGxlyfyyZFPH7wq). Reemplaza la dependencia de confirmación de Walter indicada arriba. Mismos cuatro usuarios, prioridades y RoundRobin_OptimizeForAvailability que la agenda A; sin grupo/categoría A, sin cálculo de scoring. La agenda A fue leída antes/después y permaneció idéntica.

/api/register devuelve la agenda nueva únicamente para Aplica. Formulario integrado muestra el calendario con contacto y UTM precargados. La asignación de closer ocurre al reservar, según disponibilidad y prioridades de GHL, no al completar la postulación. API booking-status verifica la cita en la nueva agenda antes de redirigir a la gracias por rubro; Otro tiene gracias general.

Verificado en producción: Aplica habilita agenda nueva; No aplica no la habilita; registro sin reserva devuelve confirmed=false; agenda muestra horarios y conserva asignación al miembro del equipo. No se creó una cita real de prueba: creación final, notificaciones y redirección posterior a reserva requieren validación con una reserva real. Los workflows exclusivos de calendarios A–E no se copiaron ni editaron.
