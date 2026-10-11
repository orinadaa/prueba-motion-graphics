# Video de producto — Vista del médico veterinario

**Formato:** 16:9 · ~45 segundos · sin voz ni música
**Estilo:** el mismo "vetUI glass" del video del cliente (`styles/vetui-glass`).
**Protagonista:** Luna, ahora como paciente del día. El médico es Camilo Rueda Peña (su cita real del 20 de octubre, 9:00 a. m., Vacunación).
**Hilo conductor:** la placa ámbar del collar de Luna salta a "lo siguiente que hace el médico" y termina como el sello de **recordatorio enviado** a la dueña.
**Día del video:** martes 20 de octubre de 2026, 8:30 a. m. (la app se captura con el reloj del navegador en ese momento, para que "Citas de hoy" muestre a Luna).

## Escenas

**1 — Empieza el día (0 a 3,5 s)**
Sala de la clínica en vidrio, reloj de pared a las 8:30. Luna espera su turno.
Texto: «Panel médico» / «Tu día en la clínica, organizado».

**2 — Panel médico (3,5 a 8 s)**
Pantalla real: «Hola, Camilo» y los indicadores: 5 citas esta semana, 1 hoy, 4 próximas.

**3 — Agenda de la semana (8 a 13 s)**
Calendario real del 19 al 24 de octubre; vistas Semana, Día y Agenda. «Citas de hoy: Luna, 9:00 a. m.».

**4 — Detalle de la cita (13 a 18 s)**
Clic en la cita de Luna: su foto, Caniche, hembra, 6,5 kg, Vacunación, la dueña María y su información médica.

**5 — Crear recordatorio (18 a 24 s) — momento clave**
La placa salta a «Crear recordatorio»: tipo Vacunación, título sugerido, fecha y hora. Guardar.
1 segundo de quietud y el sello ámbar «RECORDATORIO ENVIADO»: le llega a la dueña en la campana y por correo.

**6 — Mis pacientes (24 a 30 s)**
Lista real de pacientes con sus indicadores; búsqueda «Luna»; el detalle del paciente (dueña, mascotas, citas).

**7 — Agendar a nombre del paciente (30 a 35 s)**
«Agendar cita» desde el paciente: la cita queda con el médico y en su sede.

**8 — Disponibilidad (35 a 41 s)**
Mi perfil → Disponibilidad: el horario semanal por días (con el reloj de manecillas) y los bloqueos (vacaciones, congresos).

**9 — Cierre (41 a 45 s)**
Luna, vacunada y feliz con una curita; logo UDES.
Texto: «Tu agenda, tus pacientes y tu horario, en un solo lugar».

## De dónde salen los datos (todos del propio proyecto)
- Agenda, indicadores, detalle de cita y recordatorios — `frontend/src/components/medico/`
- El médico agenda a nombre de un cliente y la cita queda con él y en su sede — `docs/modulo_medico_pruebas.md`
- El recordatorio envía un correo al dueño — `docs/modulo_medico_pruebas.md`; y aviso en su campana — `docs/incremento_5_notificaciones_pruebas.md`
- Horario por días, pausas y bloqueos — `docs/modulo_medico_pruebas.md`
