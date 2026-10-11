# LOG

## Run 1 — 2026-10-11
- Historia aprobada sin la escena de Disponibilidad (la función sale del sistema); el enlace "Disponibilidad" se oculta en todas las capturas.
- Personajes: Luna (paciente) + un veterinario nuevo en el kit (`vgVet`: poses idle, wave, point, tablet, pet).
- Capturas con el reloj del navegador en el martes 20 oct 2026, 8:30 (`page.clock`); médico: Camilo Rueda Peña.
- Review: cortes 7/7 en la rejilla PASS · arco PASS (2/2) · ancla 720/720 (100%) PASS · texto PASS · dead beats PASS. Sonido: N/A (pieza muda).
- Pendiente conocido: en la campana de María la hora de los avisos dice "11 de oct" (la pone el servidor con su fecha real).
- Para volver a capturar: borrar antes el recordatorio de Luna, su cita del 17 nov 9:00 y sus avisos:
  `DELETE FROM notificacion WHERE titulo ILIKE '%recordatorio%' OR mensaje ILIKE '%17 de noviembre%'; DELETE FROM recordatorio; DELETE FROM cita WHERE fecha_hora = '2026-11-17 09:00';`
