// =====================================================================
//  SCENES (panel del administrador de sede) — Left column: the caption (top), Luna and the vet (bottom, their home spots).
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
//  the administrator: the vet's figure in a slate blazer, a light shirt, a lanyard with an ID card, hair in a bun
// ---------------------------------------------------------------------
const ADM_LOOK = { palette: { coat: '#3B4A63', coatD: '#2C3950', scrub: '#EAF2FF', pants: '#26324A', hair: '#5A3A28' }, steth: false, hair: 'bun' };
const adm = (x, y, s, o = {}) => vgVet(x, y, s, { ...ADM_LOOK, ...o });
function admHome(o = {}) {
  let { x, y, s } = VET;
  if (o.from) { const k = springEase(TT - (o.t0 ?? E0), 120, 22); x = lerp(o.from.x, x, k); y = lerp(o.from.y, y, k); s = lerp(o.from.s, s, k); }
  return adm(x, y, s, o);
}
// a screen whose picture changes on cue: seq = [[t, name], ...] (a quick cross-fade at each change)
function seqScreen(seq, crop, tout) {
  const k = ESP(E0) * (1 - EZ.i2(clamp((TT - tout) / 0.35)));
  let cur = seq[0][1], prev = null, u = 1;
  for (let i = 1; i < seq.length; i++) if (TT >= seq[i][0]) { prev = seq[i - 1][1]; cur = seq[i][1]; u = clamp((TT - seq[i][0]) / 0.25); }
  const scr = vgScreen(prev && u < 1 ? prev : cur, ...crop, WIN.x, WIN.y, WIN.w, { k });
  if (prev && u < 1) { const img = asset(cur); ctx.save(); ctx.globalAlpha = u * clamp(k * 1.6); ctx.beginPath(); ctx.roundRect(scr.x, scr.y, scr.w, scr.h, 20 * UNIT); ctx.clip(); if (img) ctx.drawImage(img, ...crop, scr.x, scr.y, scr.w, scr.h); ctx.restore(); }
  return scr;
}
// the reception: the clinic set plus a glass counter with a monitor
const DESK = { x: 1030, y: 770, w: 480, h: 190 }, ADM_DESK = { x: 1290, y: 860, s: 1.1 };
function recepcionSet() {
  clinicSet({ poster: false });
  vgGlass(1330, 600, 150, 100, { r: 12 });
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(1395, 700, 20, 70); ctx.restore();
}
function recepcionDesk() {
  ctx.save(); ctx.beginPath(); ctx.roundRect(DESK.x, DESK.y, DESK.w, DESK.h, 22); ctx.fillStyle = '#0A3FA8'; ctx.fill(); ctx.restore();
  vgGlass(DESK.x, DESK.y, DESK.w, DESK.h, { r: 22, tone: 'azul' });
  ctx.save(); ctx.font = `700 26px ${VG_FONT}`; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'center'; ctx.fillText('RECEPCIÓN', DESK.x + DESK.w / 2, DESK.y + 70); ctx.restore();
  vgPaw(DESK.x + DESK.w / 2, DESK.y + 125, 26, 'rgba(255,255,255,0.45)');
}

// ---------------------------------------------------------------------
//  1. RECEPCIÓN — the administrator behind the counter waves; Luna arrives
// ---------------------------------------------------------------------
function sceneRecepcion() {
  vgGround(); recepcionSet();
  adm(ADM_DESK.x, ADM_DESK.y, ADM_DESK.s, { pose: TT > 1.2 ? 'wave' : 'tablet', look: -1 });
  recepcionDesk();
  const k = springEase(TT - 0.4, 90, 18);
  vgDog(lerp(-200, CLIN_DOG.x, k), CLIN_DOG.y, CLIN_DOG.s, { mood: 'calm' });
  vgCaption('Panel de administración', ['Tu sede,', 'bajo control']);
}

// ---------------------------------------------------------------------
//  2. INICIO — the week's numbers, the week's load, what needs attention
// ---------------------------------------------------------------------
const I_SEMANA = [856, 194, 260, 148], I_CARGA = [968, 504, 426, 238], I_ATENCION = [968, 366, 426, 112];
function sceneInicioAdm() {
  vgGround();
  const salto = 5.6;
  const d = dogHome({ from: CLIN_DOG, mood: 'calm', tag: TT < salto });
  admHome({ from: ADM_DESK, pose: poseAt([[E0, 'idle'], [5.4, 'point']]) });
  const scr = panScreen('admin-inicio.jpg', [[E0, [0, 0, 1440]], [5.2, [250, 140, 1170]]], E0 + 0.2, eraEnd() - 0.35);
  const [x0, y0] = scr.map(...ctr(I_SEMANA));
  const u = pawJump(salto, 0.7, vgDogTag(d.x, d.y, d.s), [x0, y0]);
  if (u >= 1) ringTrack(scr, [[salto + 0.7, I_SEMANA], [7.1, I_CARGA], [8.0, I_ATENCION]], { r: 26 * UNIT });
  vgCaption('Inicio', ['Hola, Administrador:', 'tu sede de un vistazo'], { t0: E0 + 0.3 });
}

// ---------------------------------------------------------------------
//  3. CALENDARIO — every doctor's appointments; today's list; Luna's appointment and its detail
// ---------------------------------------------------------------------
const C_DIA = [1126, 590, 234, 46], C_LUNA = [494, 508, 110, 42], C_MEDICO = [972, 250, 400, 34], C_CLIENTE = [972, 306, 400, 100];
function sceneCitasAdm() {
  vgGround();
  const salto = 10.0, det = 12.4;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  admHome({ pose: poseAt([[E0, 'tablet'], [10.8, 'point']]) });
  const scr = panScreen('admin-citas.jpg', [[E0, [250, 60, 1170]], [10.9, [330, 300, 900]]], E0, eraEnd() - 0.35);
  const [lx, ly] = scr.map(...ctr(C_DIA));
  const u = pawJump(salto, 0.7, vgDogTag(d.x, d.y, d.s), [lx, ly]);
  if (u >= 1 && TT < det + 0.3) ringTrack(scr, [[salto + 0.7, C_DIA], [11.4, C_LUNA]], { r: 16 * UNIT, k: 1 - clamp((TT - det) / 0.3) });
  const [bx, by] = scr.map(...ctr(C_LUNA));
  if (TT < det + 0.5) cursorPath([[11.3, 1900, 1000], [11.35, 1500, 950], [11.7, bx + 14, by + 8]], 12.0);
  if (TT >= det) { const pn = sidePanel('admin-cita-luna.jpg', det, eraEnd() - 0.35); ringTrack(pn, [[det + 0.6, C_MEDICO], [13.4, C_CLIENTE]], { r: 14 * UNIT }); }
  vgCaption('Calendario de citas', ['Todas las citas', 'de tu sede'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  4. NUEVA CITA — on a client's behalf: client + pet + service; day, hour and doctor; confirm
// ---------------------------------------------------------------------
const N_MAX = [576, 150, 294, 78], N_SERV = [576, 477, 294, 84], N_CONT1 = [1080, 831, 138, 33];
const N_DIA = [390, 465, 36, 36], N_HORA = [819, 381, 213, 42], N_MED = [630, 636, 552, 36], N_CONT2 = [1080, 834, 132, 30];
const N_RES = [384, 300, 672, 366], N_AGENDAR = [1086, 708, 120, 36];
function sceneNuevaCita() {
  vgGround();
  const p2 = 16.4, p3 = 18.1, salto = 14.4;
  const d = dogHome({ mood: TT > 19.0 ? 'happy' : 'calm', tag: TT < salto });
  admHome({ pose: poseAt([[E0, 'point'], [19.0, 'idle']]) });
  const scr = seqScreen([[E0, 'admin-nueva-1.jpg'], [p2, 'admin-nueva-2.jpg'], [p3, 'admin-nueva-3.jpg']], [0, 0, 1440, 900], eraEnd() - 0.35);
  const [mx, my] = scr.map(...ctr(N_MAX));
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [mx, my]);
  if (u >= 1) ringTrack(scr, [[salto + 0.6, N_MAX], [15.3, N_SERV], [15.9, N_CONT1], [p2 + 0.2, N_DIA], [16.8, N_HORA], [17.3, N_MED], [17.8, N_CONT2], [p3 + 0.2, N_RES], [18.7, N_AGENDAR]], { r: 16 * UNIT });
  const P = (r) => { const [x, y] = scr.map(...ctr(r)); return [x + 12, y + 6]; };
  cursorPath([[15.7, 1900, 1040], [15.75, 1700, 1000], [15.95, ...P(N_CONT1)], [17.6, ...P(N_CONT1)], [17.85, ...P(N_CONT2)], [18.6, ...P(N_CONT2)], [18.8, ...P(N_AGENDAR)]], TT < 17 ? 16.2 : TT < 18.4 ? 18.0 : 19.0);
  vgCaption('Nueva cita', ['Agenda por', 'tus clientes'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  5. MÉDICOS — the sede's doctors with their specialties; edit one: the services each doctor provides
// ---------------------------------------------------------------------
const M_SOFIA = [630, 540, 210, 75], M_EDITAR = [1326, 488, 48, 24], M_SERV = [972, 528, 430, 120], M_GUARDAR = [1260, 837, 141, 30];
function sceneMedicos() {
  vgGround();
  const salto = 20.0, cajon = 21.7;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  admHome({ pose: poseAt([[E0, 'point'], [23.6, 'idle']]) });
  const scr = panScreen('admin-medicos.jpg', [[E0, [250, 60, 1170]], [20.8, [280, 300, 1000]]], E0, eraEnd() - 0.35);
  const [sx, sy] = scr.map(...ctr(M_SOFIA));
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [sx, sy]);
  if (u >= 1 && TT < cajon + 0.3) ringTrack(scr, [[salto + 0.6, M_SOFIA], [21.1, M_EDITAR]], { r: 14 * UNIT, k: 1 - clamp((TT - cajon) / 0.3) });
  if (TT >= cajon) { const pn = sidePanel('admin-medico-editar.jpg', cajon, eraEnd() - 0.35); ringTrack(pn, [[cajon + 0.6, M_SERV], [23.4, M_GUARDAR]], { r: 16 * UNIT }); }
  vgCaption('Médicos', ['Quién atiende', 'cada servicio'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  6. PACIENTES — the sede's owners and pets; María's detail
// ---------------------------------------------------------------------
const PA_KPI = [300, 195, 1095, 165], PA_MARIA = [300, 465, 1095, 60], PA_HEAD = [972, 84, 430, 60];
function scenePacientesAdm() {
  vgGround();
  const salto = 25.0, cajon = 26.5;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  admHome({ pose: poseAt([[E0, 'tablet'], [25.8, 'point']]) });
  const scr = panScreen('admin-pacientes.jpg', [[E0, [250, 60, 1170]]], E0, eraEnd() - 0.35);
  const [kx, ky] = scr.map(...ctr(PA_KPI));
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [kx, ky]);
  if (u >= 1 && TT < cajon + 0.3) ringTrack(scr, [[salto + 0.6, PA_KPI], [26.0, PA_MARIA]], { r: 22 * UNIT, k: 1 - clamp((TT - cajon) / 0.3) });
  if (TT >= cajon) { const pn = sidePanel('admin-paciente.jpg', cajon, eraEnd() - 0.35); ringTrack(pn, [[cajon + 0.6, PA_HEAD]], { r: 16 * UNIT }); }
  vgCaption('Pacientes', ['Dueños y mascotas', 'de tu sede'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  7. HORARIO — the opening hours, day by day, set on the clock
// ---------------------------------------------------------------------
const H_LUN = [972, 156, 54, 30], H_ABRE = [987, 264, 400, 51], H_RELOJ = [1011, 345, 207, 195], H_GUARDAR = [1263, 561, 126, 33];
function sceneHorario() {
  vgGround();
  const salto = 29.0;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  admHome({ pose: poseAt([[E0, 'point'], [33.0, 'idle']]) });
  screenIn('admin-horario-editor.jpg', 0, 0, 1440, 900);
  const pn = sidePanel('admin-horario-editor.jpg', E0 + 0.2, eraEnd() - 0.35);
  const [lx, ly] = pn.map(...ctr(H_LUN));
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [lx, ly]);
  if (u >= 1) ringTrack(pn, [[salto + 0.6, H_LUN], [30.5, H_ABRE], [31.4, H_RELOJ], [32.5, H_GUARDAR]], { r: 18 * UNIT });
  const [gx, gy] = pn.map(...ctr(H_GUARDAR));
  cursorPath([[32.2, 1900, 1040], [32.25, 1750, 1000], [32.6, gx + 14, gy + 6]], 32.95);
  vgCaption('Horario de atención', ['Abre y cierra', 'a tu medida'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  8. REPORTES — indicators and charts; "Generar reporte"; the real PDF; a held beat; the amber seal
// ---------------------------------------------------------------------
const R_CHARTS = [300, 474, 1095, 336], R_GENERAR = [1236, 120, 159, 36];
function sceneReportes() {
  vgGround();
  const salto = 34.4, pdf = 37.0, sello = SELLO;
  const d = dogHome({ mood: TT >= sello ? 'happy' : 'calm', tag: TT < sello - 0.8 });
  admHome({ pose: poseAt([[E0, 'point'], [sello, 'wave'], [39.6, 'idle']]) });
  const scr = panScreen('admin-reportes.jpg', [[E0, [250, 60, 1170]]], E0, eraEnd() - 0.35);
  const [cx, cy] = scr.map(...ctr(R_CHARTS));
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [cx, cy]);
  if (u >= 1 && TT < pdf) ringTrack(scr, [[salto + 0.6, R_CHARTS], [35.8, R_GENERAR]], { r: 22 * UNIT, k: 1 - clamp((TT - (pdf - 0.2)) / 0.2) });
  const [gx, gy] = scr.map(...ctr(R_GENERAR));
  if (TT < pdf) cursorPath([[35.6, 1900, 700], [35.65, 1750, 500], [35.95, gx + 20, gy + 8]], 36.3);
  // the PDF the system generated, rising as a sheet of paper
  let pg = null;
  if (TT >= pdf) {
    const k = springEase(TT - pdf, 150, 20), w = 470, h = w * 1287 / 910, x = 1180, y = lerp(H + 60, 92, k);
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(0.03 * (1 - k)); ctx.translate(-(x + w / 2), -(y + h / 2));
    ctx.shadowColor = 'rgba(4,22,70,0.5)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 20;
    ctx.fillStyle = VG.white; ctx.fillRect(x, y, w, h); ctx.shadowColor = 'transparent';
    drawAsset('admin-reporte-pdf.jpg', x, y, w, h, { fit: 'contain' });
    ctx.restore();
    pg = { x, y, w, h };
    chip('También en Excel', 780, 900, pdf + 0.5, (ix, iy, r) => { ctx.save(); ctx.fillStyle = VG.green; ctx.fillRect(ix - r * 0.8, iy - r, r * 1.6, r * 2); ctx.fillStyle = VG.white; ctx.font = `800 ${r}px ${VG_FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('X', ix, iy + 1); ctx.restore(); });
  }
  // the seal lands on the report
  const [tx, ty] = pg ? [pg.x + pg.w * 0.72, pg.y + 260] : [1500, 400];
  pawJump(sello - 0.8, 0.8, vgDogTag(d.x, d.y, d.s), [tx, ty]);
  if (TT >= sello) {
    const k = springEase(TT - sello, 260, 12);
    ctx.save(); ctx.translate(tx, ty); ctx.rotate(-0.16 * k); ctx.scale(k, k);
    ctx.shadowColor = 'rgba(247,167,28,0.75)'; ctx.shadowBlur = 50;
    ctx.beginPath(); ctx.arc(0, 0, 108, 0, TAU); ctx.fillStyle = VG.amber; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.arc(0, 0, 92, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.setLineDash([10, 9]); ctx.stroke(); ctx.setLineDash([]);
    vgPaw(0, -20, 40, VG.white);
    ctx.font = `800 21px ${VG_FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = VG.slate900; ctx.fillText('REPORTE', 0, 44); ctx.fillText('LISTO', 0, 68);
    ctx.restore();
    const r = clamp((TT - sello) / 0.6);
    if (r < 1) { ctx.save(); ctx.beginPath(); ctx.arc(tx, ty, 108 + 170 * EZ.o2(r), 0, TAU); ctx.lineWidth = 6 * (1 - r); ctx.strokeStyle = `rgba(247,167,28,${1 - r})`; ctx.stroke(); ctx.restore(); }
  }
  if (TT < pdf) vgCaption('Reportes', ['Indicadores', 'y tendencias'], { t0: E0 + 0.15 });
  else vgCaption('Reportes', ['En PDF y Excel,', 'en un clic'], { t0: pdf + 0.1 });
}

// ---------------------------------------------------------------------
//  9. CIERRE — back at the reception: the administrator waves, Luna is happy, the UDES logo
// ---------------------------------------------------------------------
function sceneCierreAdm() {
  vgGround(); recepcionSet();
  const k = springEase(TT - E0, 120, 22);
  adm(lerp(VET.x, ADM_DESK.x, k), lerp(VET.y, ADM_DESK.y, k), lerp(VET.s, ADM_DESK.s, k), { pose: TT > E0 + 0.8 && TT < E0 + 2.6 ? 'wave' : 'tablet', look: -1 });
  recepcionDesk();
  vgDog(lerp(DOG.x, CLIN_DOG.x, k), lerp(DOG.y, CLIN_DOG.y, k), lerp(DOG.s, CLIN_DOG.s, k), { mood: 'happy' });
  const kw = springEase(TT - (E0 + 0.5), 170, 24);
  ctx.save(); ctx.globalAlpha = clamp(kw * 1.5); ctx.translate(1180, 200); ctx.scale(0.9 + 0.1 * kw, 0.9 + 0.1 * kw); ctx.translate(-1180, -200);
  vgGlass(1000, 105, 360, 190, { r: 24 });
  drawAsset('logo-blanco.png', 1025, 125, 310, 150, { fit: 'contain' });
  ctx.restore();
  vgCaption('Clínica Veterinaria UDES', ['Tu sede, organizada', 'de punta a punta'], { t0: E0 + 0.4 });
}
