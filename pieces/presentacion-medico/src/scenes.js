// =====================================================================
//  SCENES (vista del médico) — Left column: the caption (top), Luna and the vet (bottom, their home spots).
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
//  the vet's home spot, and the two characters together
// ---------------------------------------------------------------------
const VET = { x: 565, y: 966, s: 0.95 };
function vetHome(o = {}) {
  let { x, y, s } = VET;
  if (o.from) { const k = springEase(TT - (o.t0 ?? E0), 120, 22); x = lerp(o.from.x, x, k); y = lerp(o.from.y, y, k); s = lerp(o.from.s, s, k); }
  return vgVet(x, y, s, o);
}
// a pose that changes on cue: keys = [[t, pose], ...]
const poseAt = (keys) => { let p = keys[0][1]; for (const [t, v] of keys) if (TT >= t) p = v; return p; };
// a tall side panel (the app's right-hand drawer, 480x876 at x 948 in the captures) in its own glass window
const PANEL = { x: 1300, y: 112, w: 460 };
function sidePanel(name, tin, tout, o = {}) {
  const k = springEase(TT - tin, 170, 24), out = EZ.i2(clamp((TT - tout) / 0.35));
  const w = PANEL.w, h = w * 876 / 480, x = lerp(W + 40, PANEL.x, k), y = PANEL.y;
  ctx.save(); ctx.globalAlpha = 1 - out;
  vgGlass(x - 12, y - 12, w + 24, h + 24, { r: 30 });
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 22); ctx.clip();
  const img = asset(name); if (img) ctx.drawImage(img, 948, 12, 480, 876, x, y, w, h);
  if (o.next && TT >= o.next[0]) { const kk = clamp((TT - o.next[0]) / 0.25), im2 = asset(o.next[1]); ctx.globalAlpha *= kk; if (im2) ctx.drawImage(im2, 948, 12, 480, 876, x, y, w, h); }
  ctx.restore(); ctx.restore();
  return { x, y, w, h, s: w / 480, map: (qx, qy) => [x + (qx - 948) * w / 480, y + (qy - 12) * h / 876] };
}

// ---------------------------------------------------------------------
//  the clinic: a wall clock at 8:30, a poster, a plant, a glass bench (scenes 1 and 8)
// ---------------------------------------------------------------------
const CLIN_DOG = { x: 760, y: 930, s: 1.25 }, CLIN_VET = { x: 1060, y: 945, s: 1.15 };
function clinicSet(o = {}) {
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 960, W, H - 960); ctx.restore();
  // the wall clock: 8:30 and a sweeping second hand
  const cx = 1560, cy = 300, r = 120;
  vgGlass(cx - r, cy - r, 2 * r, 2 * r, { r });
  ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; ctx.lineWidth = i % 3 ? 3 : 6; ctx.beginPath(); ctx.moveTo(Math.sin(a) * r * 0.78, -Math.cos(a) * r * 0.78); ctx.lineTo(Math.sin(a) * r * 0.88, -Math.cos(a) * r * 0.88); ctx.stroke(); }
  const min = (o.min ?? 30) + TT / 60, hr = (o.hr ?? 8) + min / 60;
  const hand = (a, len, w, c) => { ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * len, -Math.cos(a) * len); ctx.stroke(); };
  hand(hr / 12 * TAU, r * 0.48, 9, VG.white); hand(min / 60 * TAU, r * 0.7, 6, VG.white); hand(TT / 60 * TAU * 6, r * 0.76, 2.5, VG.amber);
  ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fillStyle = VG.white; ctx.fill(); ctx.restore();
  // a poster: a paw with a cross
  if (o.poster !== false) {
  vgGlass(1240, 470, 200, 240, { r: 22 });
  vgPaw(1340, 560, 44, 'rgba(255,255,255,0.75)');
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillRect(1325, 625, 30, 64); ctx.fillRect(1308, 642, 64, 30); ctx.restore();
  }
  // a plant and the glass bench
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.roundRect(1700, 870, 80, 90, 16); ctx.fill();
  for (let i = 0; i < 6; i++) { const a = (i - 2.5) * 0.36 + Math.sin(TT * 1.2 + i) * 0.04; ctx.save(); ctx.translate(1740, 872); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -62, 15, 56, 0, 0, TAU); ctx.fillStyle = i % 2 ? '#6FD39A' : '#3FBF7F'; ctx.fill(); ctx.restore(); }
  ctx.restore();
  vgGlass(520, 800, 520, 26, { r: 13 });
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(560, 826, 18, 134); ctx.fillRect(982, 826, 18, 134); ctx.restore();
}

// ---------------------------------------------------------------------
//  1. EMPIEZA EL DÍA — 8:30 in the clinic; Luna waits; the vet walks in and waves
// ---------------------------------------------------------------------
function sceneInicio() {
  vgGround(); clinicSet();
  vgDog(CLIN_DOG.x, CLIN_DOG.y, CLIN_DOG.s, { mood: 'calm' });
  const k = springEase(TT - 0.6, 90, 18);
  vgVet(lerp(W + 200, CLIN_VET.x, k), CLIN_VET.y, CLIN_VET.s, { pose: TT > 1.4 ? 'wave' : 'idle', look: -1 });
  vgCaption('Panel médico', ['Tu día en la clínica,', 'organizado']);
}

// ---------------------------------------------------------------------
//  2. PANEL MÉDICO — "Hola, Camilo" and the day's numbers; the paw lands on "Citas hoy"
// ---------------------------------------------------------------------
const KPI = [[104, 530, 296, 150], [416, 530, 296, 150], [728, 530, 296, 150]];
function scenePanel() {
  vgGround();
  const salto = 6.4;
  const d = dogHome({ from: CLIN_DOG, mood: 'calm', tag: TT < salto });
  vetHome({ from: CLIN_VET, pose: poseAt([[E0, 'idle'], [6.2, 'point']]) });
  const scr = panScreen('medico-panel.jpg', [[E0, [0, 0, 1440]], [5.6, [40, 180, 1100]]], E0 + 0.2, eraEnd() - 0.35);
  ringTrack(scr, [[salto + 0.7, KPI[1]], [8.0, KPI[2]]], { r: 30 * UNIT });
  const [kx, ky] = scr.map(...ctr(KPI[1]));
  pawJump(salto, 0.7, vgDogTag(d.x, d.y, d.s), [kx, ky]);
  vgCaption('Panel médico', ['Hola, Camilo:', 'tu día, de un vistazo'], { t0: E0 + 0.3 });
}

// ---------------------------------------------------------------------
//  3. AGENDA — the week's calendar; today: Luna at 9:00; a click on her appointment
// ---------------------------------------------------------------------
const HOY_CARD = [1016, 1070, 320, 122], LUNA_CITA = [320, 1034, 124, 48];
function sceneAgenda() {
  vgGround();
  const salto = 10.0;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  vetHome({ pose: poseAt([[E0, 'tablet'], [11.5, 'point']]) });
  const scr = panScreen('medico-agenda.jpg', [[E0, [60, 560, 1320]], [11.3, [200, 760, 1000]]], E0, eraEnd() - 0.35);
  const [hx, hy] = scr.map(...ctr(HOY_CARD));
  const u = pawJump(salto, 0.7, vgDogTag(d.x, d.y, d.s), [hx, hy]);
  if (u >= 1) ringTrack(scr, [[salto + 0.7, HOY_CARD], [11.8, LUNA_CITA]], { r: 20 * UNIT });
  const [lx, ly] = scr.map(...ctr(LUNA_CITA));
  cursorPath([[12.0, 1900, 1000], [12.05, 1500, 950], [12.4, lx + 14, ly + 8]], 12.8);
  vgCaption('Mis citas', ['Tu agenda', 'de la semana'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  4. DETALLE DE LA CITA — the drawer: Luna's photo and data, her medical info, "Crear recordatorio"
// ---------------------------------------------------------------------
const P_HEAD = [972, 100, 428, 80], P_INFO = [972, 596, 432, 76], P_RECORD = [972, 830, 432, 42];
function sceneDetalle() {
  vgGround();
  const salto = 15.2;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  vetHome({ pose: poseAt([[E0, 'idle'], [15.0, 'point']]) });
  screenIn('medico-detalle-cita.jpg', 0, 0, 1440, 900);
  const pn = sidePanel('medico-detalle-cita.jpg', E0 + 0.3, eraEnd() - 0.35);
  const [px, py] = pn.map(...ctr(P_HEAD));
  const u = pawJump(salto, 0.7, vgDogTag(d.x, d.y, d.s), [px, py]);
  if (u >= 1) ringTrack(pn, [[salto + 0.7, P_HEAD], [16.9, P_INFO], [17.9, P_RECORD]], { r: 18 * UNIT });
  const [rx, ry] = pn.map(...ctr(P_RECORD));
  cursorPath([[18.0, 1900, 1000], [18.05, 1700, 1040], [18.35, rx + 20, ry + 6]], 18.65);
  vgCaption('Detalle de la cita', ['Todo sobre', 'tu paciente'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  5. CREAR RECORDATORIO — type, title, date and time; save; a held beat; the amber seal;
//     then what the owner gets: the reminder in her bell (and by email)
// ---------------------------------------------------------------------
const R_VACUNA = [972, 330, 211, 78], R_TITULO = [972, 567, 432, 36], R_FECHA = [972, 785, 432, 36], R_GUARDAR = [1076, 834, 328, 38];
const AVISO = [500, 84, 368, 290];
function sceneRecordatorio() {
  vgGround();
  const guardar = 22.9, sello = SELLO, aviso = 25.4;
  const d = dogHome({ mood: TT >= sello ? 'happy' : 'calm', tag: TT < sello - 0.8 });
  vetHome({ pose: poseAt([[E0, 'point'], [sello, 'wave'], [aviso, 'idle']]) });
  screenIn('medico-recordatorio-lleno.jpg', 0, 0, 1440, 900);
  const pn = sidePanel('medico-recordatorio.jpg', E0 + 0.2, eraEnd() - 0.35, { next: [20.3, 'medico-recordatorio-lleno.jpg'] });
  if (TT < sello + 0.2) ringTrack(pn, [[19.7, R_VACUNA], [20.9, R_TITULO], [21.8, R_FECHA], [22.5, R_GUARDAR]], { r: 16 * UNIT, k: 1 - clamp((TT - sello) / 0.2) });
  const [gx, gy] = pn.map(...ctr(R_GUARDAR));
  if (TT < sello) cursorPath([[22.2, 1900, 1040], [22.25, 1750, 1060], [22.55, gx + 30, gy + 6]], guardar);
  // the seal: Luna's paw lands on the drawer
  const [sx, sy] = [pn.x + pn.w / 2, pn.y + 330];
  pawJump(sello - 0.8, 0.8, vgDogTag(d.x, d.y, d.s), [sx, sy]);
  if (TT >= sello) {
    const k = springEase(TT - sello, 260, 12), out = clamp((TT - (aviso + 0.6)) / 0.4);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.16 * k); ctx.scale(k * (1 - 0.35 * EZ.io(out)), k * (1 - 0.35 * EZ.io(out)));
    ctx.shadowColor = 'rgba(247,167,28,0.75)'; ctx.shadowBlur = 50;
    ctx.beginPath(); ctx.arc(0, 0, 112, 0, TAU); ctx.fillStyle = VG.amber; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.arc(0, 0, 95, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.setLineDash([10, 9]); ctx.stroke(); ctx.setLineDash([]);
    vgPaw(0, -22, 40, VG.white);
    ctx.font = `800 19px ${VG_FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = VG.slate900; ctx.fillText('RECORDATORIO', 0, 42); ctx.fillText('ENVIADO', 0, 64);
    ctx.restore();
    const r = clamp((TT - sello) / 0.6);
    if (r < 1) { ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, 112 + 170 * EZ.o2(r), 0, TAU); ctx.lineWidth = 6 * (1 - r); ctx.strokeStyle = `rgba(247,167,28,${1 - r})`; ctx.stroke(); ctx.restore(); }
  }
  // what María receives: her bell, in a window of its own
  if (TT >= aviso) {
    const k = springEase(TT - aviso, 170, 22), w = 560, h = w * AVISO[3] / AVISO[2], x = 780, y = lerp(H + 40, 330, k);
    vgGlass(x - 12, y - 12, w + 24, h + 24, { r: 28 });
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.clip();
    const img = asset('cliente-aviso.jpg'); if (img) ctx.drawImage(img, ...AVISO, x, y, w, h);
    ctx.restore();
    chip('Así le llega a María', x + 30, y - 46, aviso + 0.3, icoBell);
  }
  if (TT < aviso) vgCaption('Recordatorios', ['Crea un aviso', 'en segundos'], { t0: E0 + 0.15 });
  else vgCaption('Le llega a la dueña', ['en su campana', 'y por correo'], { t0: aviso + 0.1 });
}

// ---------------------------------------------------------------------
//  6. MIS PACIENTES — the list with its numbers; the patient's drawer: her pets, then her appointments
// ---------------------------------------------------------------------
const PAC_KPI = [104, 530, 296, 150], PAC_LUNA = [972, 236, 430, 78], PAC_CITA = [972, 236, 430, 70];
function scenePacientes() {
  vgGround();
  const salto = 28.2, cajon = 29.6, citas = 31.3;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  vetHome({ pose: poseAt([[E0, 'tablet'], [cajon + 0.6, 'point']]) });
  const scr = panScreen('medico-pacientes.jpg', [[E0, [40, 470, 1240]], [E0 + 1.0, [60, 520, 1150]]], E0, eraEnd() - 0.35);
  const [kx, ky] = scr.map(...ctr(PAC_KPI));
  const u = pawJump(salto, 0.7, vgDogTag(d.x, d.y, d.s), [kx, ky]);
  if (u >= 1 && TT < cajon + 0.3) ringTrack(scr, [[salto + 0.7, PAC_KPI]], { r: 30 * UNIT, k: 1 - clamp((TT - cajon) / 0.3) });
  if (TT >= cajon) {
    const pn = sidePanel('medico-paciente-mascotas.jpg', cajon, eraEnd() - 0.35, { next: [citas, 'medico-paciente-citas.jpg'] });
    ringTrack(pn, [[cajon + 0.7, PAC_LUNA], [citas + 0.4, PAC_CITA]], { r: 16 * UNIT });
  }
  vgCaption('Mis pacientes', ['Dueños y mascotas,', 'con su historial'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  7. AGENDAR — on the patient's behalf: the 17th at 9:00, then the summary: "la cita queda contigo, en tu sede"
// ---------------------------------------------------------------------
const AG_17 = [1042, 384, 42, 42], AG_NUEVE = [1265, 625, 140, 42], AG_SIG = [1052, 834, 352, 38], AG_RESUMEN = [972, 488, 432, 80];
function sceneAgendarMed() {
  vgGround();
  const salto = 33.4, paso4 = 36.2;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  vetHome({ pose: poseAt([[E0, 'point'], [38.2, 'idle']]) });
  screenIn('medico-agendar-3.jpg', 0, 0, 1440, 900);
  const pn = sidePanel('medico-agendar-3.jpg', E0 + 0.2, eraEnd() - 0.35, { next: [paso4, 'medico-agendar-4.jpg'] });
  const [ax, ay] = pn.map(...ctr(AG_17));
  const u = pawJump(salto, 0.7, vgDogTag(d.x, d.y, d.s), [ax, ay]);
  if (u >= 1) ringTrack(pn, [[salto + 0.7, AG_17], [34.8, AG_NUEVE], [35.5, AG_SIG], [paso4 + 0.3, AG_RESUMEN], [37.4, AG_SIG]], { r: 18 * UNIT });
  const P = (r) => { const [x, y] = pn.map(...ctr(r)); return [x + 20, y + 6]; };
  cursorPath([[35.0, 1900, 1040], [35.05, 1750, 1060], [35.4, ...P(AG_SIG)], [37.5, ...P(AG_SIG)]], TT < 37 ? 35.8 : 37.9);
  vgCaption('Agendar', ['A nombre de', 'tu paciente'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  8. CIERRE — back in the clinic: Luna vaccinated (a little bandage), happy; the vet pets her; the UDES logo
// ---------------------------------------------------------------------
function curita(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.roundRect(-34, -11, 68, 22, 11); ctx.fillStyle = '#F4D6B8'; ctx.fill();
  ctx.beginPath(); ctx.roundRect(-12, -11, 24, 22, 4); ctx.fillStyle = '#E8B98F'; ctx.fill();
  ctx.fillStyle = 'rgba(160,110,70,0.5)'; for (const [dx, dy] of [[-24, -4], [-24, 4], [24, -4], [24, 4]]) { ctx.beginPath(); ctx.arc(dx, dy, 1.8, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function sceneCierreMed() {
  vgGround(); clinicSet({ hr: 9, min: 30, poster: false });
  const k = springEase(TT - E0, 120, 22);
  const dx = lerp(DOG.x, CLIN_DOG.x, k), dy = lerp(DOG.y, CLIN_DOG.y, k), ds = lerp(DOG.s, CLIN_DOG.s, k);
  vgDog(dx, dy, ds, { mood: 'happy' });
  curita(dx - 70 * ds, dy - 110 * ds, ds, -0.5);
  const vx = lerp(VET.x, dx + 300 * ds, k);
  vgVet(vx, CLIN_VET.y, lerp(VET.s, CLIN_VET.s, k), { pose: TT > E0 + 0.9 ? 'pet' : 'idle', look: -1 });
  // the logo on glass, where the poster was
  const kw = springEase(TT - (E0 + 0.5), 170, 24);
  ctx.save(); ctx.globalAlpha = clamp(kw * 1.5); ctx.translate(1190, 255); ctx.scale(0.9 + 0.1 * kw, 0.9 + 0.1 * kw); ctx.translate(-1190, -255);
  vgGlass(990, 145, 400, 220, { r: 26 });
  drawAsset('logo-blanco.png', 1020, 170, 340, 170, { fit: 'contain' });
  ctx.restore();
  vgCaption('Clínica Veterinaria UDES', ['Tu agenda y tus pacientes,', 'en un solo lugar'], { t0: E0 + 0.4 });
}
