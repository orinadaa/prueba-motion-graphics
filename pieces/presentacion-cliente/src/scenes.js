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
const BUBBLE = () => [CASA_DOG.x + 200, CASA_DOG.y - 500, 74];
function casaSet(win = true) {
  // the window on the wall: glass panes, soft light through them
  const wx = 1240, wy = 150, ww = 520, wh = 470;
  if (win) {
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
  }
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
}
function sceneCasa() {
  vgGround(); casaSet();
  const { x, y, s } = CASA_DOG;
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
//  helpers for the screen scenes
// ---------------------------------------------------------------------
const AR = 1.6;   // every window crop is 16:10, so the window keeps its size while the view pans inside it
// a crop that pans on springs: keys = [[t, [x, y, w]], ...]  ->  [x, y, w, w / AR]
function cropTrack(keys) {
  const c = [0, 1, 2].map((i) => springTrack(keys.map(([t, v]) => [t, v[i]]), SPRING.smooth));
  return [c[0], c[1], c[2], c[2] / AR];
}
// the amber focus ring that hops from target to target: keys = [[t, [px, py, pw, ph]], ...]
function ringTrack(scr, keys, o = {}) {
  if (TT < keys[0][0]) return null;
  const r = [0, 1, 2, 3].map((i) => springTrack(keys.map(([t, v]) => [t, v[i]]), SPRING.snappy));
  const k = springEase(TT - keys[0][0], 260, 18) * (o.k ?? 1);
  return vgFocus(scr, ...r, k, o);
}
// a screen window whose crop pans; rises in at `tin`, leaves at `tout`
function panScreen(name, keys, tin, tout, o = {}) {
  const k = ESP(tin) * (1 - EZ.i2(clamp((TT - tout) / 0.35)));
  return vgScreen(name, ...cropTrack(keys), o.x ?? WIN.x, o.y ?? WIN.y, o.w ?? WIN.w, { k });
}
const eraEnd = () => ERA_LIST[ERA_LIST.findIndex((e) => e[0] === E0)][1];
const ctr = (r) => [r[0] + r[2] / 2, r[1] + r[3] / 2];
// a white glass chip with an icon drawn by `icon(x, y, r)`, springing in at t0
function chip(str, x, y, t0, icon) {
  const k = springEase(TT - t0, 260, 16); if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.translate(-x, -y);
  const w = vgPill(str, x + 34, y, 26, { fill: VG.navy, stroke: 'rgba(255,255,255,0.6)' });
  ctx.beginPath(); ctx.arc(x + 4, y, 26, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fill();
  if (icon) icon(x + 4, y, 15);
  ctx.restore();
}
// small line icons (Phosphor-like) for the chips
function icoPin(x, y, r) { ctx.save(); ctx.fillStyle = VG.blue700; ctx.beginPath(); ctx.arc(x, y - r * 0.25, r * 0.62, Math.PI, 0); ctx.lineTo(x, y + r); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(x, y - r * 0.25, r * 0.25, 0, TAU); ctx.fillStyle = VG.white; ctx.fill(); ctx.restore(); }
function icoMail(x, y, r) { ctx.save(); ctx.strokeStyle = VG.blue700; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.strokeRect(x - r, y - r * 0.7, 2 * r, 1.4 * r); ctx.beginPath(); ctx.moveTo(x - r, y - r * 0.7); ctx.lineTo(x, y + r * 0.1); ctx.lineTo(x + r, y - r * 0.7); ctx.stroke(); ctx.restore(); }
function icoBell(x, y, r) { ctx.save(); ctx.fillStyle = VG.blue700; ctx.beginPath(); ctx.moveTo(x - r * 0.8, y + r * 0.5); ctx.quadraticCurveTo(x - r * 0.7, y - r, x, y - r); ctx.quadraticCurveTo(x + r * 0.7, y - r, x + r * 0.8, y + r * 0.5); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(x, y + r * 0.72, r * 0.25, 0, TAU); ctx.fill(); ctx.restore(); }

// ---------------------------------------------------------------------
//  3. SERVICIOS Y SEDES — the services, then the two sites; the paw jumps to "Agendar cita" in the bar
// ---------------------------------------------------------------------
const NAV_AGENDAR = [1072, 24, 152, 40];
function sceneSedes() {
  vgGround();
  const swap = 10.5, salto = 11.9;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  // the services view, then the sites view rises over it
  if (TT < swap + 0.4) {
    const k = ESP(E0) * (1 - EZ.i2(clamp((TT - (swap - 0.3)) / 0.4)));
    vgScreen('landing-servicios.jpg', ...cropTrack([[E0, [80, 90, 1280]], [E0 + 0.2, [160, 140, 1120]]]), WIN.x, WIN.y, WIN.w, { k });
  }
  if (TT >= swap) {
    const scr = panScreen('landing-sedes.jpg', [[swap, [0, 0, 1440]]], swap, eraEnd() - 0.35);
    // the two sites light up in turn (white: information, not an action)
    const SED = [[145, 279, 563, 527], [732, 279, 563, 527]];
    SED.forEach((r, i) => { const t = swap + 0.5 + i * 0.5, k = springEase(TT - t, 260, 18) * (1 - clamp((TT - (salto - 0.2)) / 0.3)); if (k > 0) vgFocus(scr, ...r, k, { color: 'rgba(255,255,255,0.95)', glow: 'rgba(255,255,255,0.6)', r: 22 * UNIT, m: 6 }); });
    const [cx, cy] = scr.map(...ctr(NAV_AGENDAR));
    const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [cx, cy]);
    if (u >= 1) vgFocus(scr, ...NAV_AGENDAR, springEase(TT - salto - 0.6, 260, 18));
    cursorPath([[12.1, 1900, 700], [12.15, 1700, 400], [12.45, cx + 16, cy + 6]], 12.75);
  }
  if (TT < swap) vgCaption('Servicios', ['Atención', 'veterinaria integral'], { t0: E0 + 0.2 });
  else vgCaption('Nuestras sedes', ['Bucaramanga', 'y Valledupar'], { t0: swap + 0.1 });
}

// ---------------------------------------------------------------------
//  4. AGENDAR — the booking page opens; the ring runs along the five steps
// ---------------------------------------------------------------------
const STEPS = [284, 518, 752, 985, 1218].map((x) => [x - 26, 374, 52, 52]);
function sceneAgendar() {
  vgGround();
  dogHome({ mood: 'calm' });
  const scr = panScreen('agendar-inicio.jpg', [[E0, [0, 0, 1440]], [E0 + 0.9, [80, 120, 1280]]], E0, eraEnd() - 0.35);
  ringTrack(scr, STEPS.map((r, i) => [E0 + 0.5 + i * 0.22, r]), { m: 6 });
  // the step names pop as the ring passes
  vgCaption('Agendar cita', ['5 pasos, en', 'menos de un minuto'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  5. MASCOTA Y SERVICIO — the paw lands on Luna's card, then the ring goes to Vacunación
// ---------------------------------------------------------------------
const LUNA_CARD = [192, 140, 240, 176], VACUNA = [704, 790, 242, 86];
function sceneMascota() {
  vgGround();
  const salto = 15.5, pan = 17.1;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  const scr = panScreen('agendar-mascota.jpg', [[E0, [140, 40, 1180]], [pan, [140, 260, 1180]]], E0, eraEnd() - 0.35);
  const [lx, ly] = scr.map(...ctr(LUNA_CARD));
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [lx, ly]);
  if (u >= 1) ringTrack(scr, [[salto + 0.6, LUNA_CARD], [pan + 0.4, VACUNA]], { r: 24 * UNIT });
  const [vx, vy] = scr.map(...ctr(VACUNA));
  cursorPath([[15.9, 1900, 900], [15.95, 1500, 950], [16.2, lx + 30, ly + 20], [pan + 0.3, lx + 30, ly + 20], [pan + 0.55, vx + 40, vy + 10]], TT < pan + 0.5 ? 16.5 : pan + 0.95);
  vgCaption('Pasos 1 y 2', ['Elige a tu mascota', 'y el servicio'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  6. SEDE, FECHA Y HORA — the ring hops: the site, the 20th, 9:00, then "Confirmar cita"
// ---------------------------------------------------------------------
const SEDE_BGA = [192, 140, 500, 192], DIA20 = [248, 852, 40, 40], NUEVE = [833, 744, 115, 42], CONFIRMAR = [807, 1135, 165, 40];
function sceneFecha() {
  vgGround();
  const salto = 19.4, pan = 21.0;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  const scr = panScreen('agendar-fecha.jpg', [[E0, [100, 90, 1240]], [pan, [100, 520, 1240]]], E0, eraEnd() - 0.35);
  const [sx, sy] = scr.map(...ctr(SEDE_BGA));
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [sx, sy]);
  const keys = [[salto + 0.6, SEDE_BGA], [21.5, DIA20], [22.3, NUEVE], [23.1, CONFIRMAR]];
  if (u >= 1) ringTrack(scr, keys, { r: 22 * UNIT });
  const P = (r) => { const [x, y] = scr.map(...ctr(r)); return [x + 12, y + 8]; };
  const step = TT < 21.5 ? 20.3 : TT < 22.3 ? 21.85 : TT < 23.1 ? 22.65 : 23.45;
  cursorPath([[19.9, 1900, 1000], [19.95, 1500, 800], [20.0, ...P(SEDE_BGA)], [21.4, ...P(DIA20)], [22.2, ...P(NUEVE)], [23.0, ...P(CONFIRMAR)]], step);
  vgCaption('Pasos 3 y 4', ['Sede, fecha', 'y hora'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  8. NOTIFICACIONES — the bell rings; its list says the appointment is booked; the 24h reminder, also by email
// ---------------------------------------------------------------------
const CAMPANA = [831, 30, 36, 36], DROPDOWN = [499, 80, 368, 293];
function sceneCampana() {
  vgGround();
  const d = dogHome({ mood: 'calm', tag: TT < 28.9 });
  const scr = panScreen('panel-campana.jpg', [[E0, [240, 0, 1100]], [E0 + 1.6, [300, 30, 900]]], E0, eraEnd() - 0.35);
  const [bx, by] = scr.map(...ctr(CAMPANA));
  const u = pawJump(28.9, 0.6, vgDogTag(d.x, d.y, d.s), [bx, by]);
  if (u >= 1) {
    ringTrack(scr, [[29.5, CAMPANA], [30.1, DROPDOWN]], { r: 26 * UNIT });
    // the bell rings: two arcs either side
    const w = Math.sin((TT - 29.5) * TAU * 3) * Math.exp(-(TT - 29.5) * 2);
    if (TT < 30.2) for (const s of [-1, 1]) { ctx.save(); ctx.beginPath(); ctx.arc(bx, by, 34 + 6 * Math.abs(w), s < 0 ? Math.PI * 0.75 : -Math.PI * 0.25, s < 0 ? Math.PI * 1.25 : Math.PI * 0.25); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.stroke(); ctx.restore(); }
  }
  vgCaption('Notificaciones', ['Te avisamos', '24 horas antes'], { t0: E0 + 0.15 });
  const f = () => { chip('También por correo', 140, 380, 30.6, icoMail); };
  if (DEFER) DEFER.push(f); else f();
}

// ---------------------------------------------------------------------
//  9. MIS CITAS — Luna's appointment in the list; its detail slides in: reprogramar, cancelar
// ---------------------------------------------------------------------
const CITA_LUNA = [104, 1216, 856, 180], VER = [812, 1306, 132, 36], REPROG = [1283, 504, 121, 30], CANCELAR = [972, 830, 432, 42];
function sceneCitas() {
  vgGround();
  const d = dogHome({ mood: 'calm', tag: TT < 32.5 });
  const det = 34.0;
  const scr = panScreen('panel-citas.jpg', [[E0, [40, 700, 1120]], [E0 + 1.0, [60, 820, 1000]]], E0, eraEnd() - 0.35);
  const [lx, ly] = scr.map(...ctr(CITA_LUNA));
  const u = pawJump(32.5, 0.6, vgDogTag(d.x, d.y, d.s), [lx - 200, ly]);
  if (u >= 1 && TT < det + 0.3) ringTrack(scr, [[33.1, CITA_LUNA]], { r: 28 * UNIT, k: 1 - clamp((TT - det) / 0.3) });
  const [vx, vy] = scr.map(...ctr(VER));
  if (TT < det + 0.6) cursorPath([[33.0, 1900, 1000], [33.05, 1600, 1000], [33.35, vx + 10, vy + 8]], 33.7);
  // the detail panel (its own glass window) slides in from the right
  if (TT >= det) {
    const k = springEase(TT - det, 170, 24), out = EZ.i2(clamp((TT - (eraEnd() - 0.35)) / 0.35));
    const pw = 470, ph = pw * 876 / 480, px = lerp(W + 40, 1330, k), py = 120;
    ctx.save(); ctx.globalAlpha = 1 - out;
    vgGlass(px - 12, py - 12, pw + 24, ph + 24, { r: 30 });
    ctx.save(); ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 22); ctx.clip();
    const img = asset('panel-detalle.jpg'); if (img) ctx.drawImage(img, 948, 12, 480, 876, px, py, pw, ph);
    ctx.restore();
    const dmap = { map: (qx, qy) => [px + (qx - 948) * pw / 480, py + (qy - 12) * ph / 876] };
    ringTrack(dmap, [[det + 0.7, REPROG], [det + 1.7, CANCELAR]], { r: 22 * UNIT });
    ctx.restore();
  }
  vgCaption('Mis citas', ['Reprograma', 'o cancela'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  10. MIS MASCOTAS — Luna's card with her real photo; the photo floats out to meet the drawn Luna
// ---------------------------------------------------------------------
const FICHA_LUNA = [104, 806, 296, 284], FOTO_LUNA = [196, 831, 112, 112];
function sceneMascotas() {
  vgGround();
  const pop = 38.6;
  const d = dogHome({ mood: TT > pop + 0.4 ? 'happy' : 'calm', tag: TT < 37.4 });
  const scr = panScreen('panel-mascotas.jpg', [[E0, [40, 560, 1120]], [E0 + 1.2, [60, 640, 1000]]], E0, eraEnd() - 0.35);
  const [fx, fy] = scr.map(...ctr(FICHA_LUNA));
  const u = pawJump(37.4, 0.6, vgDogTag(d.x, d.y, d.s), [fx, fy]);
  if (u >= 1) ringTrack(scr, [[38.0, FICHA_LUNA]], { r: 28 * UNIT });
  // the real photo pops out of the card and floats next to the drawn Luna
  if (TT >= pop) {
    const k = springEase(TT - pop, 120, 15), [ox, oy] = scr.map(...ctr(FOTO_LUNA));
    const x = lerp(ox, 560, k), y = lerp(oy, 600 + Math.sin(TT * TAU * 0.5) * 6, k), r = lerp(FOTO_LUNA[2] / 2 * scr.s, 120, k);
    ctx.save(); ctx.shadowColor = 'rgba(4,22,70,0.45)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 16;
    ctx.beginPath(); ctx.arc(x, y, r + 8, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    const img = asset('panel-mascotas.jpg'); if (img) ctx.drawImage(img, FOTO_LUNA[0] + 4, FOTO_LUNA[1] + 4, FOTO_LUNA[2] - 8, FOTO_LUNA[3] - 8, x - r, y - r, 2 * r, 2 * r);
    ctx.restore();
    if (k > 0.6) vgText('Luna', x, y + r + 52, 34, VG.white, { align: 'center', t0: pop + 0.35 });
  }
  vgCaption('Mis mascotas', ['Su ficha,', 'siempre a mano'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  11. CIERRE — back home, happy; the window now holds the UDES logo (the end is the start, changed)
// ---------------------------------------------------------------------
function sceneCierre() {
  vgGround(); casaSet(false);
  const { x, y, s } = CASA_DOG;
  const k = springEase(TT - E0, 120, 22);
  vgDog(lerp(DOG.x, x, k), lerp(DOG.y, y, k), lerp(DOG.s, s, k), { mood: 'happy' });
  // the bubble again, now with a check
  const [bx, by, br] = BUBBLE(), kb = springEase(TT - (E0 + 0.6), 260, 14);
  if (kb > 0.01) {
    const bob = Math.sin(TT * TAU * 0.8) * 6;
    vgGlass(bx - br * kb, by - br * kb + bob, 2 * br * kb, 2 * br * kb, { r: br * kb });
    ctx.save(); ctx.translate(bx, by + bob); ctx.scale(kb, kb); ctx.beginPath(); ctx.moveTo(-28, 2); ctx.lineTo(-8, 22); ctx.lineTo(30, -20);
    ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = VG.white; ctx.stroke(); ctx.restore();
  }
  // the window: the logo on glass
  const kw = springEase(TT - (E0 + 0.3), 170, 24), wx = 1240, wy = 150, ww = 520, wh = 470;
  ctx.save(); ctx.translate(wx + ww / 2, wy + wh / 2); ctx.scale(0.9 + 0.1 * kw, 0.9 + 0.1 * kw); ctx.translate(-(wx + ww / 2), -(wy + wh / 2));
  ctx.globalAlpha = clamp(kw * 1.5);
  vgGlass(wx, wy, ww, wh, { r: 28 });
  drawAsset('logo-blanco.png', wx + 50, wy + 70, ww - 100, wh - 140, { fit: 'contain' });
  ctx.restore();
  vgCaption('Clínica Veterinaria UDES', ['Agenda la cita de', 'tu mascota en línea'], { t0: E0 + 0.4 });
}
