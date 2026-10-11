# Video de producto — Panel del superadministrador

**Formato:** 16:9 · ~50 segundos · sin voz ni música
**Estilo:** "vetUI glass" (`styles/vetui-glass`), el mismo de los otros tres videos.
**Personajes:** Luna + el superadministrador (personaje nuevo, dibujado en el mismo estilo).
**Idea:** el superadministrador configura **todo el sistema sin programar**: sedes, cuentas, servicios, la página web, los catálogos y los datos, para las dos sedes.
**Hilo conductor:** la placa ámbar de Luna salta a lo siguiente que hace el superadministrador. El momento clave es un cambio en el panel que **aparece en la página web pública**: el sello ámbar «PUBLICADO».

## Escenas

**1 — Centro de control (0 a 4 s)**
Un mapa de vidrio con las dos sedes, Bucaramanga y Valledupar, unidas por una línea de luz. El superadministrador con su tablet y Luna.
Texto: «Superadministrador» / «Todo el sistema, sin programar».

**2 — Inicio del sistema (4 a 9 s)**
Pantalla real: 2 sedes activas, el personal, los clientes y los servicios. Una tarjeta por sede y «Requiere tu atención».

**3 — Sedes (9 a 14 s)**
Las sedes con sus días y su horario. Crear, editar, activar o desactivar una sede.

**4 — Usuarios (14 a 19,5 s)**
Todas las cuentas del sistema. Crear un médico o un administrador con su rol y su sede; el interruptor para activar o desactivar cuentas.

**5 — Servicios (19,5 a 24,5 s)**
El catálogo con categoría, precio, duración y foto. Es el mismo que se muestra en la página web.

**6 — Página web (24,5 a 31,5 s) — momento clave**
«Información de la clínica»: número de WhatsApp y redes sociales. Guardar.
1 segundo de quietud. El landing público muestra el botón de WhatsApp y el sello ámbar **«PUBLICADO»**.

**7 — Catálogos (31,5 a 36 s)**
Categorías y especialidades; especies y razas. Las opciones de todo el sistema.

**8 — Datos (36 a 41,5 s)**
La bitácora: el cambio de la escena 6 queda registrado con quién y cuándo. La copia de seguridad de toda la base.

**9 — Reportes (41,5 a 45,5 s)**
Indicadores y gráficas de **todas las sedes**, con filtro por sede.

**10 — Cierre (45,5 a 50 s)**
De vuelta en el centro de control, las dos sedes encendidas, Luna feliz y el logo UDES.
Texto: «Toda la clínica, en tus manos».

## De dónde salen los datos (todos del propio proyecto)
- Reparto de funciones del superadministrador — `docs/roles_superadministrador.md`
- Información de la clínica, WhatsApp y redes; cada cambio queda en la bitácora — `docs/informacion_clinica_y_mi_cuenta.md`
- Bitácora y copia de seguridad (.sql) — `frontend/src/components/admin/PanelDatos.jsx`
- Nada se elimina, solo se desactiva — `docs/roles_superadministrador.md`
