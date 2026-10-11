# LOG

## Run 1 — 2026-10-11
- Story check aprobado (11 escenas). Look check: perrito blanco → cambiado a Luna (poodle de peluche, moños rosados) a pedido.
- Fotos reales: Luna (ficha y agendar) y las dos sedes (Bucaramanga: ladrillo; Valledupar: letrero verde).
- Review (`tools/review.mjs`): cortes en la rejilla 10/10 PASS · arco PASS (2/2) · ancla 624/624 frames (100%) PASS · texto 0 cortados/solapados PASS · dead beats 0 PASS. Sonido: N/A (pieza muda).
- Corregido en revisión: el ancla no tenía objetivo (x, y); las etiquetas de ciudad tapaban letreros y personas → borde blanco por tarjeta; captura de agendar desplazada → nueva captura `agendar-inicio`; `R.r()` sin argumentos daba NaN (rizos y huellas invisibles) → `R.f()`.
- Toma más débil: escena 3, servicios — la captura del carrusel sale con las fotos oscurecidas por la máscara del propio landing; se lee, pero es la menos nítida. Arreglo: capturar el carrusel con una tarjeta más clara o pausar su animación antes de capturar.

| shot | PASS |
|---|---|
| 1 En casa | PASS |
| 2 Landing | PASS |
| 3 Servicios y sedes | PASS (la más débil) |
| 4 Agendar | PASS |
| 5 Mascota y servicio | PASS |
| 6 Sede, fecha y hora | PASS |
| 7 Confirmación | PASS |
| 8 Notificaciones | PASS |
| 9 Mis citas | PASS |
| 10 Mis mascotas | PASS |
| 11 Cierre | PASS |
