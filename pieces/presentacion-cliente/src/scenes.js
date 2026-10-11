// =====================================================================
//  SCENES — one function per era. Left column: the caption (top) and the dog (bottom, its home spot).
//  Right column: the real screen in a floating glass window. Coordinates of things inside a screenshot
//  are in the capture's own pixels (1440 wide) and placed with scr.map(px, py).
// =====================================================================
const DOG = { x: 330, y: 960, s: 1.0 };                 // the dog's home spot (the anchor)
const WIN = { x: 720, y: 150, w: 1090 };                // the screen window
const ESP = (t0) => springEase(TT - t0, 170, 26);       // a "smooth" spring from t0, 0..1

// the dog in its home spot (blends in from another pose with a spring when `from` is given)
function dogHome(o = {}) {
  let { x, y, s } = DOG;
  if (o.from) { const k = springEase(TT - (o.t0 ?? E0), 120, 22); x = lerp(o.from.x, x, k); y = lerp(o.from.y, y, k); s = lerp(o.from.s, s, k); }
  vgDog(x, y, s, o);
  return { x, y, s };
}

// the amber paw leaves the collar and flies in an arc to (tx, ty); returns 0..1 (1 = arrived)
function pawJump(t0, d, from, to, r = 17) {
  const u = clamp((TT - t0) / d); if (TT < t0) return 0;
  const e = EZ.io(u), x = lerp(from[0], to[0], e), y = lerp(from[1], to[1], e) - Math.sin(Math.PI * e) * 160 * UNIT;
  if (u < 1) {
    ctx.save(); ctx.shadowColor = 'rgba(247,167,28,0.7)'; ctx.shadowBlur = 26 * UNIT;
    ctx.beginPath(); ctx.arc(x, y, r * (1 + 0.5 * Math.sin(Math.PI * e)), 0, TAU); ctx.fillStyle = VG.amber; ctx.fill(); ctx.restore();
    vgPaw(x, y + 1, r * 0.6 * (1 + 0.5 * Math.sin(Math.PI * e)), VG.white);
  }
  return u;
}

// the cursor glides in along keyframes [[t, x, y], ...] and presses at `clickT`
function cursorPath(keys, clickT) {
  if (TT < keys[0][0]) return;
  const x = springTrack(keys.map(([t, x]) => [t, x]), SPRING.smooth), y = springTrack(keys.map(([t, , y]) => [t, y]), SPRING.smooth);
  vgCursor(x, y, clickT != null ? clamp((TT - clickT) / 0.45) : 0);
}

// a scene's screen: rises in at E0, leaves (sinks a little and fades) in the last 0.35s of the era
function screenIn(name, sx, sy, sw, sh, o = {}) {
  const t1 = ERA_LIST[ERA_LIST.findIndex((e) => e[0] === E0)][1];
  const out = clamp((TT - (t1 - 0.35)) / 0.35);
  const k = ESP(E0 + (o.delay ?? 0)) * (1 - EZ.i2(out));
  return vgScreen(name, sx, sy, sw, sh, o.x ?? WIN.x, o.y ?? WIN.y, o.w ?? WIN.w, { k });
}

// ---------------------------------------------------------------------
//  1. EN CASA — the dog, worried, scratches its ear; a "?" pops over it
// ---------------------------------------------------------------------
const CASA_DOG = { x: LX(0.45), y: 930, s: 1.3 };
const BUBBLE = () => [CASA_DOG.x + 190, CASA_DOG.y - 430, 74];
function sceneCasa() {
  vgGround();
  // the window on the wall: glass panes, soft light through them
  const wx = 1240, wy = 150, ww = 520, wh = 470;
  vgGlass(wx, wy, ww, wh, { r: 28 });
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy + 14); ctx.lineTo(wx + ww / 2, wy + wh - 14); ctx.moveTo(wx + 14, wy + wh / 2); ctx.lineTo(wx + ww - 14, wy + wh / 2); ctx.stroke();
  for (let i = 0; i < 3; i++) {   // light streaks drifting across the panes
    const p = ((TT * 0.12 + i / 3) % 1), x0 = wx + p * (ww + 200) - 150;
    ctx.save(); ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 28); ctx.clip();
    ctx.beginPath(); ctx.moveTo(x0, wy + wh); ctx.lineTo(x0 + 70, wy + wh); ctx.lineTo(x0 + 190, wy); ctx.lineTo(x0 + 120, wy); ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); ctx.restore();
  }
  ctx.restore();
  // a framed paw photo and a shelf with a plant
  vgGlass(860, 250, 190, 150, { r: 20 }); vgPaw(955, 330, 42, 'rgba(255,255,255,0.5)');
  vgGlass(150, 560, 300, 22, { r: 11 });
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.roundRect(255, 500, 70, 62, 14); ctx.fill();
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.42 + Math.sin(TT * 1.3 + i) * 0.04; ctx.save(); ctx.translate(290, 502); ctx.rotate(a + Math.PI / 2); ctx.beginPath(); ctx.ellipse(0, -45, 13, 42, 0, 0, TAU); ctx.fillStyle = i % 2 ? '#6FD39A' : '#3FBF7F'; ctx.fill(); ctx.restore(); }
  ctx.restore();
  // the floor line, the bed, the bowl
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 960, W, H - 960); ctx.restore();
  const { x, y, s } = CASA_DOG;
  ctx.save(); ctx.beginPath(); ctx.ellipse(x - 30, y + 2, 270, 52, 0, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.stroke(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.moveTo(x + 330, y - 40); ctx.lineTo(x + 470, y - 40); ctx.lineTo(x + 445, y + 10); ctx.lineTo(x + 355, y + 10); ctx.closePath(); ctx.fillStyle = VG.navy; ctx.fill(); ctx.restore();
  // the dog: worried, scratching from 0.4s to 2.4s
  vgDog(x, y, s, { mood: 'worried', scratch: ev(0.4, 0.3) * (1 - ev(2.4, 0.3)) });
  // the "?" bubble
  const [bx, by, br] = BUBBLE(), k = springEase(TT - TIMELINE.cues.pregunta, 260, 14);
  if (k > 0.01) {
    const bob = Math.sin(TT * TAU * 0.8) * 6;
    [[0.25, 22], [0.12, 12]].forEach(([f, r], i) => vgGlass(bx - 120 + i * 50 - r, by + 120 - i * 50 - r + bob * 0.5, 2 * r * k, 2 * r * k, { r: r * k }));
    vgGlass(bx - br * k, by - br * k + bob, 2 * br * k, 2 * br * k, { r: br * k });
    ctx.save(); ctx.font = `800 ${Math.round(92 * k)}px ${VG_FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = VG.white;
    ctx.fillText('?', bx, by + bob + 4); ctx.restore();
  }
  vgCaption('Clínica Veterinaria UDES', ['¿Tu mascota', 'necesita una cita?']);
}

// ---------------------------------------------------------------------
//  2. LANDING — the "?" grows into the browser window; the paw jumps to "Agendar cita"; a click
// ---------------------------------------------------------------------
const HERO_BTN = [104, 573, 168, 48];   // "Agendar cita" in landing-hero.jpg
function sceneLanding() {
  vgGround();
  const d = dogHome({ from: CASA_DOG, mood: 'calm', tag: TT < TIMELINE.cues.salto1 });
  // the window grows out of the bubble
  const [bx, by, br] = BUBBLE(), k = springEase(TT - E0, 110, 21);
  const h = WIN.w * 900 / 1440;
  const x = lerp(bx - br, WIN.x, k), y = lerp(by - br, WIN.y, k), w = lerp(2 * br, WIN.w, k), hh = lerp(2 * br, h, k);
  // once open, the view inside the window pushes in toward the headline and "Agendar cita"
  const z = EZ.io(seg(TT, 4.9, 5.9)), C = [0, 0, 1440, 900].map((v, i) => lerp(v, [40, 250, 800, 500][i], z));
  const out = clamp((TT - (S.sedes - 0.35)) / 0.35);
  ctx.save(); ctx.globalAlpha = 1 - EZ.i2(out);
  vgGlass(x - 12, y - 12, w + 24, hh + 24, { r: lerp(br, 30, k) });
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, hh, lerp(br, 20, k)); ctx.clip();
  ctx.drawImage(asset('landing-hero.jpg') || document.createElement('canvas'), C[0], C[1], C[2], C[3], x + (w - WIN.w) / 2, y + (hh - h) / 2, WIN.w, h);
  ctx.restore();
  const scr = { map: (px, py) => [WIN.x + (px - C[0]) * WIN.w / C[2], WIN.y + (py - C[1]) * h / C[3]] };
  // the paw jumps to the button and becomes its amber ring
  const [cx, cy] = scr.map(HERO_BTN[0] + HERO_BTN[2] / 2, HERO_BTN[1] + HERO_BTN[3] / 2);
  const u = pawJump(TIMELINE.cues.salto1, 0.7, vgDogTag(d.x, d.y, d.s), [cx, cy]);
  if (u >= 1) vgFocus(scr, ...HERO_BTN, springEase(TT - TIMELINE.cues.salto1 - 0.7, 260, 18));
  cursorPath([[6.5, 1900, 1000], [6.55, 1500, 900], [6.9, cx + 20, cy + 6]], TIMELINE.cues.clic1);
  ctx.restore();
  vgCaption('Sistema de citas en línea', ['Tu clínica,', 'a un clic'], { t0: E0 + 0.4 });
}

// ---------------------------------------------------------------------
//  7. CONFIRMACIÓN — the code; a held beat; the paw lands as the amber seal
// ---------------------------------------------------------------------
const CONF = [130, 330, 1180, 765];     // the crop of confirmacion.jpg: the stepper and the card
const CONF_CARD = [304, 500, 896, 230]; // "¡Tu cita ha sido agendada!" card
function sceneConfirma() {
  vgGround();
  const sello = TIMELINE.cues.sello;
  const d = dogHome({ mood: TT >= sello ? 'happy' : 'calm', tag: TT < sello - 0.8 });
  // a slow push on the card while it holds
  const z = 1 + 0.06 * EZ.io(seg(TT, E0 + 0.6, sello - 0.3));
  const [px, py] = [WIN.x + WIN.w * 0.5, WIN.y + 330];
  ctx.save(); ctx.translate(px, py); ctx.scale(z, z); ctx.translate(-px, -py);
  const scr = screenIn('confirmacion.jpg', ...CONF);
  ctx.restore();
  const map = (qx, qy) => { const [a, b] = scr.map(qx, qy); return [px + (a - px) * z, py + (b - py) * z]; };
  // the seal: the paw flies from the collar and lands on the card
  const [sx, sy] = map(1110, 560);
  pawJump(sello - 0.8, 0.8, vgDogTag(d.x, d.y, d.s), [sx, sy]);
  const k = springEase(TT - sello, 260, 12);
  if (TT >= sello) {
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.18 * k); ctx.scale(k, k);
    ctx.shadowColor = 'rgba(247,167,28,0.75)'; ctx.shadowBlur = 50;
    ctx.beginPath(); ctx.arc(0, 0, 105, 0, TAU); ctx.fillStyle = VG.amber; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.arc(0, 0, 88, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.setLineDash([10, 9]); ctx.stroke(); ctx.setLineDash([]);
    vgPaw(0, -14, 44, VG.white);
    ctx.font = `800 21px ${VG_FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = VG.slate900; ctx.fillText('CONFIRMADA', 0, 62);
    ctx.restore();
    // a ring of light expanding once
    const r = clamp((TT - sello) / 0.6);
    if (r < 1) { ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, 105 + 160 * EZ.o2(r), 0, TAU); ctx.lineWidth = 6 * (1 - r); ctx.strokeStyle = `rgba(247,167,28,${1 - r})`; ctx.stroke(); ctx.restore(); }
  }
  vgCaption('Paso 5 · Confirmación', ['¡Listo! Tu cita', 'queda agendada'], { t0: E0 + 0.3 });
}

// ---------------------------------------------------------------------
//  scenes still to draw for the storyboard (show the real screen in place)
// ---------------------------------------------------------------------
function scenePlaceholder(name, crop, over, title) {
  vgGround(); dogHome({ mood: 'calm' }); screenIn(name, ...crop); vgCaption(over, title);
}
const sceneSedes = () => scenePlaceholder('landing-servicios.jpg', [0, 0, 1440, 900], 'Servicios y sedes', ['Bucaramanga', 'y Valledupar']);
const sceneAgendar = () => scenePlaceholder('agendar-mascota.jpg', [0, 150, 1440, 900], 'Agendar cita', ['5 pasos,', 'menos de un minuto']);
const sceneMascota = () => scenePlaceholder('agendar-mascota.jpg', [100, 330, 1240, 775], 'Pasos 1 y 2', ['Tu mascota', 'y el servicio']);
const sceneFecha = () => scenePlaceholder('agendar-fecha.jpg', [100, 480, 1240, 775], 'Pasos 3 y 4', ['Sede, fecha', 'y hora']);
const sceneCampana = () => scenePlaceholder('panel-campana.jpg', [0, 0, 1440, 900], 'Notificaciones', ['Te avisamos', '24 h antes']);
const sceneCitas = () => scenePlaceholder('panel-citas.jpg', [0, 600, 1440, 900], 'Mis citas', ['Reprograma', 'o cancela']);
const sceneMascotas = () => scenePlaceholder('panel-mascotas.jpg', [0, 600, 1440, 900], 'Mis mascotas', ['Sus fichas,', 'siempre a mano']);
const sceneCierre = () => { vgGround(); dogHome({ mood: 'happy' }); vgCaption('Clínica Veterinaria UDES', ['Agenda en línea']); };
