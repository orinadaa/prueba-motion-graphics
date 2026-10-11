# Video de presentación — Sistema de citas Clínica Veterinaria UDES

**Formato:** 16:9 · ~45 segundos · sin voz ni música
**Estilo:** "vetUI glass" — fondo azul de marca con halos, paneles de vidrio flotante, ámbar como único acento, tipografía Raleway.
**Protagonista:** una mascota (perrito) que se queda en su sitio mientras las pantallas reales cambian a su alrededor.
**Hilo conductor:** una placa ámbar con forma de pata en el collar de la mascota. El ámbar siempre marca "lo siguiente que haces": salta al botón "Agendar cita", recorre cada paso y al final se vuelve el sello de cita confirmada.

## Escenas

**Escena 1 — En casa (0 a 3 s)**
La mascota en casa, rascándose la oreja; aparece un "?" sobre ella.
Pasa a la siguiente: el "?" se convierte en una ventana de vidrio.

**Escena 2 — Landing (3 a 8 s)**
Pantalla real del inicio: "Cuidamos de quienes hacen parte de tu familia".
Texto: Clínica Veterinaria UDES.
Pasa a la siguiente: la cámara baja por la página.

**Escena 3 — Servicios y sedes (8 a 13 s)**
Tarjetas reales de servicios y las 2 sedes: Bucaramanga y Valledupar.
Pasa a la siguiente: la pata ámbar salta al botón "Agendar cita".

**Escena 4 — Empieza a agendar (13 a 15 s)**
Clic en "Agendar cita"; aparecen los 5 pasos: Mascota · Servicio · Sede · Fecha y hora · Confirmación.

**Escena 5 — Mascota y servicio (15 a 19 s)**
Pantalla real: la tarjeta de la mascota queda seleccionada con anillo ámbar.

**Escena 6 — Sede, fecha y hora (19 a 24 s)**
Pantalla real del calendario y los horarios; se elige una hora.

**Escena 7 — Confirmación (24 a 28 s) — momento clave**
Se escribe el código de la cita, 1 segundo de quietud y aparece el sello ámbar de "cita confirmada".

**Escena 8 — Notificaciones (28 a 32 s)**
La campana marca 1 aviso: recordatorio 24 horas antes, también por correo.

**Escena 9 — Mis citas (32 a 37 s)**
Pantalla real: la próxima cita destacada; se puede reprogramar o cancelar desde el panel.

**Escena 10 — Mis mascotas (37 a 41 s)**
La ficha de la mascota con su foto real.

**Escena 11 — Cierre (41 a 45 s)**
Vuelve a la escena 1, pero la mascota está feliz con su placa ámbar.
Logo UDES y la frase: "Agenda la cita de tu mascota en línea".

## De dónde salen los datos (todos del propio proyecto)
- 2 sedes, Bucaramanga y Valledupar — `frontend/src/components/landing/Hero.jsx`
- 5 pasos de la reserva — `frontend/src/components/agendar/BookingStepper.jsx`
- Recordatorio 24 h antes y por correo — `docs/incremento_5_notificaciones_pruebas.md`
- Reprogramar y cancelar — `frontend/src/components/cliente/PanelMisCitas.jsx`
