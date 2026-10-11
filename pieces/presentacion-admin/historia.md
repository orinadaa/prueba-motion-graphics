# Video de producto — Panel del administrador de sede

**Formato:** 16:9 · ~45 segundos · sin voz ni música
**Estilo:** "vetUI glass" (`styles/vetui-glass`), el mismo de los videos del cliente y del médico.
**Personajes:** Luna + un administrador nuevo, dibujado en el mismo estilo.
**Cuenta:** el administrador de la sede **Bucaramanga** (la sede de Luna), así se ven su cita del 20 de octubre y el Dr. Camilo Rueda Peña.
**Hilo conductor:** la placa ámbar de Luna salta a lo siguiente que hace el administrador y termina como el sello **«REPORTE LISTO»** sobre el PDF real que genera el sistema.

## Escenas

**1 — Recepción (0 a 4 s)**
La recepción de la clínica en vidrio. El administrador está tras el mostrador con su pantalla y Luna llega.
Texto: «Panel de administración» / «Tu sede, bajo control».

**2 — Inicio (4 a 9 s)**
Pantalla real: «Hola, Administrador», los indicadores de la semana, la carga de la semana en barras y «Requiere tu atención: todo está en orden».

**3 — Calendario de citas (9 a 14 s)**
La semana del 19 al 24 de octubre con las citas de todos los médicos de la sede. «Citas del día»: Luna y Manchas. Clic en Luna: médico, cliente, mascota y estado.

**4 — Nueva cita (14 a 19,5 s)**
El administrador agenda a nombre de un cliente: cliente y servicio, luego fecha y médico, y confirma.

**5 — Médicos (19,5 a 24,5 s)**
Los médicos de la sede con sus especialidades. Editar médico: los servicios que presta cada uno.

**6 — Pacientes (24,5 a 28,5 s)**
Dueños y mascotas de la sede, con sus indicadores, y el detalle de un paciente.

**7 — Horario de atención (28,5 a 34 s)**
El editor por días: la manecilla del reloj marca la hora de apertura (8:00 a. m.) y de cierre (5:00 p. m.). Guardar.

**8 — Reportes (34 a 40,5 s) — momento clave**
Indicadores y gráficas (citas por semana, servicios más solicitados). «Generar reporte» y «Descargar PDF».
1 segundo de quietud y el sello ámbar **«REPORTE LISTO»** sobre la primera página del PDF real.

**9 — Cierre (40,5 a 45 s)**
De vuelta en la recepción: el administrador satisfecho, Luna feliz y el logo UDES.
Texto: «Tu sede, organizada de punta a punta».

## De dónde salen los datos (todos del propio proyecto)
- Módulos del administrador de sede — `frontend/src/pages/PanelAdminPage.jsx`, `frontend/src/components/admin/`
- El administrador agenda a nombre de un cliente, en su sede — `docs/incremento_3_pruebas.md`
- Reportes en Excel y PDF generados en el navegador — `frontend/src/components/admin/PanelReportes.jsx`
