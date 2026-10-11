# LOG

## Run 1 — 2026-10-11
- Historia aprobada: solo el administrador de sede (cuenta de Bucaramanga, la sede de Luna). Inicio con la fecha real (el servidor cuenta "citas de hoy" con su fecha); el resto con el reloj del navegador en el martes 20 oct 2026, 8:30.
- Personajes: Luna + la administradora (`vgVet` con `palette`, `steth: false` → carné, `hair: 'bun'`).
- Momento clave: el PDF real que genera "Generar reporte → Descargar PDF" y el sello «REPORTE LISTO».
- Review: cortes 8/8 en la rejilla PASS · ancla 756/756 (100%) PASS · texto PASS · dead beats PASS · arco 1/2:
  FAIL "peak has the highest cut rate": el ritmo es parejo por diseño (una pantalla por escena, ~0,2 cortes/s) y el corte al cierre cae 2,25 s después del sello. No se re-etiquetaron los actos para forzar el PASS. Sonido: N/A (pieza muda).
- Para volver a capturar: borrar antes la cita de Max del 22 oct 10:00 (`DELETE FROM cita WHERE fecha_hora = '2026-10-22 10:00' AND estado = 'agendada';`).
