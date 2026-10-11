# Brief — Presentación del sistema de citas para el cliente

- **Pieza:** 16:9 · 1920×1080 · 45 s · 24 fps · sin audio (pedido de la usuaria: sin voz ni música).
- **Formato:** F5, viaje con protagonista fijo. Luna (poodle de peluche con moños rosados) se queda en su sitio mientras cambian las pantallas reales.
- **Estilo:** `styles/vetui-glass` — tomado de `frontend/src/styles/vetui.css` y `docs/vetui.md`: degradado azul de marca, halos, vidrio flotante, Raleway, ámbar como único acento (= lo siguiente que haces).
- **Recurso:** la placa ámbar del collar salta a cada acción y termina como el sello «CONFIRMADA».
- **Escenas:** ver `historia.md` (11 escenas) y `storyboard.png`.
- **Capturas:** reales, de la app en local con los datos de ejemplo (`tools/capturar.mjs`, clienta `maria.gomez@demo.udes.co`). Se registró a Luna con su foto real y se subieron las fotos reales de las sedes. Se ocultan el botón flotante de contacto y el aviso de correo no enviado (no hay SMTP en local).

## Afirmaciones en pantalla y su fuente
| Afirmación | Fuente |
|---|---|
| 2 sedes: Bucaramanga y Valledupar | `frontend/src/components/landing/Hero.jsx`, tabla `sede` |
| 5 pasos; «menos de un minuto» | `BookingStepper.jsx`; texto de la página `/agendar` |
| Recordatorio 24 h antes, también por correo | `docs/incremento_5_notificaciones_pruebas.md` |
| Reprogramar o cancelar | `PanelMisCitas.jsx`, `DetalleCitaPanel.jsx` |
