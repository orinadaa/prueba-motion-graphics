// =====================================================================
//  SCENES (panel del superadministrador) — Left column: the caption (top), Luna and the vet (bottom, their home spots).
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
//  the superadmin: light-blue sweater over a white collar, round glasses, short hair, no lanyard
// ---------------------------------------------------------------------
const SUP_LOOK = { palette: { coat: '#9CC7F5', coatD: '#7DAEE3', scrub: '#FFFFFF', pants: '#2B3A55', hair: '#2A1E18', skin: '#E8B48E', skinD: '#D29A72' }, steth: false, lanyard: false, glasses: true };
const sup = (x, y, s, o = {}) => vgVet(x, y, s, { ...SUP_LOOK, ...o });
function supHome(o = {}) {
  let { x, y, s } = VET;
  if (o.from) { const k = springEase(TT - (o.t0 ?? E0), 120, 22); x = lerp(o.from.x, x, k); y = lerp(o.from.y, y, k); s = lerp(o.from.s, s, k); }
  return sup(x, y, s, o);
}
// the control room: a glass map with the two sites joined by a pulse of light
const MAPA = { x: 1100, y: 130, w: 680, h: 520 }, PIN_BGA = [1300, 470], PIN_VUP = [1560, 270];
const SUP_DESK = { x: 880, y: 950, s: 1.15 }, CENTRO_DOG = { x: 540, y: 930, s: 1.25 };
function mapaSedes(o = {}) {
  const k = o.k ?? 1;
  ctx.save(); ctx.globalAlpha = clamp(k * 1.5);
  vgGlass(MAPA.x, MAPA.y, MAPA.w, MAPA.h, { r: 30 });
  // a faint grid, a soft land shape
  ctx.save(); ctx.beginPath(); ctx.roundRect(MAPA.x, MAPA.y, MAPA.w, MAPA.h, 30); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1.5;
  for (let gx = MAPA.x + 40; gx < MAPA.x + MAPA.w; gx += 60) { ctx.beginPath(); ctx.moveTo(gx, MAPA.y); ctx.lineTo(gx, MAPA.y + MAPA.h); ctx.stroke(); }
  for (let gy = MAPA.y + 40; gy < MAPA.y + MAPA.h; gy += 60) { ctx.beginPath(); ctx.moveTo(MAPA.x, gy); ctx.lineTo(MAPA.x + MAPA.w, gy); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(1180, 600); ctx.bezierCurveTo(1150, 420, 1260, 320, 1380, 300); ctx.bezierCurveTo(1470, 200, 1620, 170, 1700, 230); ctx.bezierCurveTo(1760, 330, 1690, 480, 1600, 560); ctx.bezierCurveTo(1480, 640, 1300, 650, 1180, 600); ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill(); ctx.restore();
  // the link between the sites, with a pulse travelling along it
  ctx.save(); ctx.setLineDash([10, 10]); ctx.lineDashOffset = -TT * 40; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(...PIN_BGA); ctx.quadraticCurveTo(1460, 430, PIN_VUP[0], PIN_VUP[1]); ctx.stroke(); ctx.restore();
  const p = (TT * 0.5) % 1, qx = (1 - p) * (1 - p) * PIN_BGA[0] + 2 * (1 - p) * p * 1460 + p * p * PIN_VUP[0], qy = (1 - p) * (1 - p) * PIN_BGA[1] + 2 * (1 - p) * p * 430 + p * p * PIN_VUP[1];
  ctx.beginPath(); ctx.arc(qx, qy, 7, 0, TAU); ctx.fillStyle = VG.white; ctx.fill();
  // the pins and their names
  [[PIN_BGA, 'Bucaramanga'], [PIN_VUP, 'Valledupar']].forEach(([[px, py], n], i) => {
    const pk = springEase(TT - (o.t0 ?? 0) - 0.4 - i * 0.25, 260, 14);
    if (pk <= 0.01) return;
    const glow = 0.5 + 0.5 * Math.sin(TT * TAU * 0.8 + i);
    ctx.beginPath(); ctx.arc(px, py, (26 + 10 * glow) * pk, 0, TAU); ctx.fillStyle = `rgba(255,255,255,${0.12 + 0.1 * glow})`; ctx.fill();
    ctx.save(); ctx.translate(px, py); ctx.scale(pk, pk); icoPin(0, -6, 26); ctx.restore();
    vgPill(n, px, py + 46, 22, { align: 'center', fill: VG.navy, stroke: 'rgba(255,255,255,0.6)' });
  });
  if (o.logo) drawAsset('logo-blanco.png', MAPA.x + 380, MAPA.y + MAPA.h - 150, 270, 120, { fit: 'contain', alpha: clamp(o.logo) });
  ctx.restore();
}

// ---------------------------------------------------------------------
//  1. CENTRO DE CONTROL — the two sites on a glass map; the superadmin with a tablet; Luna
// ---------------------------------------------------------------------
function sceneCentro() {
  vgGround();
  mapaSedes({ k: springEase(TT - 0.2, 120, 22), t0: 0.3 });
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 960, W, H - 960); ctx.restore();
  sup(SUP_DESK.x, SUP_DESK.y, SUP_DESK.s, { pose: TT > 1.6 ? 'point' : 'tablet' });
  vgDog(CENTRO_DOG.x, CENTRO_DOG.y, CENTRO_DOG.s, { mood: 'calm' });
  vgCaption('Superadministrador', ['Todo el sistema,', 'sin programar']);
}

// ---------------------------------------------------------------------
//  2. INICIO DEL SISTEMA — sites, staff, clients, services; one card per site; what needs attention
// ---------------------------------------------------------------------
const SI_KPI = [300, 194, 1094, 162], SI_BGA = [300, 422, 642, 144], SI_VUP = [300, 582, 642, 144], SI_ATENCION = [966, 382, 428, 344];
function sceneInicioSup() {
  vgGround();
  const salto = 5.6;
  const d = dogHome({ from: CENTRO_DOG, mood: 'calm', tag: TT < salto });
  supHome({ from: SUP_DESK, pose: poseAt([[E0, 'idle'], [5.4, 'point']]) });
  const scr = panScreen('sup-inicio.jpg', [[E0, [0, 0, 1440]], [5.2, [250, 140, 1170]]], E0 + 0.2, eraEnd() - 0.35);
  const [x0, y0] = scr.map(...ctr(SI_KPI));
  const u = pawJump(salto, 0.7, vgDogTag(d.x, d.y, d.s), [x0, y0]);
  if (u >= 1) ringTrack(scr, [[salto + 0.7, SI_KPI], [7.0, SI_BGA], [7.6, SI_VUP], [8.2, SI_ATENCION]], { r: 24 * UNIT });
  vgCaption('Inicio del sistema', ['Las dos sedes,', 'de un vistazo'], { t0: E0 + 0.3 });
}

// ---------------------------------------------------------------------
//  3. SEDES — edit a site: its photo, its data, active or not
// ---------------------------------------------------------------------
const SE_FOTO = [972, 132, 432, 242], SE_ACTIVA = [972, 726, 432, 36], SE_GUARDAR = [972, 838, 432, 30];
function sceneSedesSup() {
  vgGround();
  const salto = 10.6;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  supHome({ pose: poseAt([[E0, 'tablet'], [10.4, 'point']]) });
  screenIn('sup-sedes.jpg', 0, 0, 1440, 900);
  const pn = sidePanel('sup-sede-editar.jpg', E0 + 0.4, eraEnd() - 0.35);
  const [fx, fy] = pn.map(...ctr(SE_FOTO));
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [fx, fy]);
  if (u >= 1) ringTrack(pn, [[salto + 0.6, SE_FOTO], [12.2, SE_ACTIVA], [13.0, SE_GUARDAR]], { r: 16 * UNIT });
  vgCaption('Sedes', ['Crea y configura', 'cada sede'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  4. USUARIOS — every account; a new doctor with role and site; the on/off switches
// ---------------------------------------------------------------------
const U_TOGGLE = [1140, 368, 62, 34], U_NOMBRE = [972, 132, 430, 34], U_ROL = [972, 322, 430, 32], U_SEDE = [972, 400, 430, 32];
function sceneUsuarios() {
  vgGround();
  const salto = 14.4, cajon = 16.2;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  supHome({ pose: poseAt([[E0, 'point'], [18.8, 'idle']]) });
  const scr = panScreen('sup-usuarios.jpg', [[E0, [250, 60, 1170]]], E0, eraEnd() - 0.35);
  const [tx, ty] = scr.map(...ctr(U_TOGGLE));
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [tx, ty]);
  if (u >= 1 && TT < cajon + 0.3) ringTrack(scr, [[salto + 0.6, U_TOGGLE]], { r: 18 * UNIT, k: 1 - clamp((TT - cajon) / 0.3) });
  if (TT >= cajon) { const pn = sidePanel('sup-usuario-nuevo.jpg', cajon, eraEnd() - 0.35); ringTrack(pn, [[cajon + 0.6, U_NOMBRE], [17.6, U_ROL], [18.4, U_SEDE]], { r: 14 * UNIT }); }
  vgCaption('Usuarios', ['Cada cuenta,', 'con su rol y su sede'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  5. SERVICIOS — the catalogue the website shows: photo, category, price
// ---------------------------------------------------------------------
const SV_FOTO = [988, 140, 392, 296], SV_CAT = [972, 660, 432, 160], SV_GUARDAR = [1260, 838, 142, 28];
function sceneServiciosSup() {
  vgGround();
  const salto = 21.2, cajon = 21.0;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  supHome({ pose: poseAt([[E0, 'tablet'], [21.4, 'point']]) });
  screenIn('sup-servicios.jpg', 0, 0, 1440, 900);
  const pn = sidePanel('sup-servicio-editar.jpg', cajon, eraEnd() - 0.35);
  const [fx, fy] = pn.map(...ctr(SV_FOTO));
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [fx, fy]);
  if (u >= 1) ringTrack(pn, [[salto + 0.6, SV_FOTO], [23.0, SV_CAT], [23.8, SV_GUARDAR]], { r: 16 * UNIT });
  vgCaption('Servicios', ['El catálogo', 'de tu página web'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  6. PÁGINA WEB — the clinic's WhatsApp; save; the public landing now shows it; a held beat; «PUBLICADO»
// ---------------------------------------------------------------------
const W_NUM = [320, 434, 494, 34], W_SWITCH = [318, 488, 300, 30], W_GUARDAR = [1220, 730, 174, 36], W_OK = [300, 732, 1094, 30];
const L_WHATSAPP = [1256, 754, 162, 58];
function scenePaginaWeb() {
  vgGround();
  const salto = 25.0, guardar = 27.0, landing = 27.4, sello = SELLO;
  const d = dogHome({ mood: TT >= sello ? 'happy' : 'calm', tag: TT < salto || (TT >= salto + 0.6 && TT < sello - 0.8) });
  supHome({ pose: poseAt([[E0, 'point'], [sello, 'wave'], [31.0, 'idle']]) });
  const scr = seqScreen([[E0, 'sup-web-info.jpg'], [guardar + 0.1, 'sup-web-info-ok.jpg']], [0, 0, 1440, 900], eraEnd() - 0.35);
  const [nx, ny] = scr.map(...ctr(W_NUM));
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), [nx, ny]);
  if (u >= 1 && TT < landing + 0.3) ringTrack(scr, [[salto + 0.6, W_NUM], [26.2, W_SWITCH], [26.8, W_GUARDAR], [guardar + 0.3, W_OK]], { r: 14 * UNIT, k: 1 - clamp((TT - landing) / 0.3) });
  const [gx, gy] = scr.map(...ctr(W_GUARDAR));
  if (TT < landing) cursorPath([[26.3, 1900, 1040], [26.35, 1800, 1000], [26.7, gx + 16, gy + 6]], guardar);
  // the public landing rises over the panel: the WhatsApp button is there
  let lw = null;
  if (TT >= landing) {
    const k = springEase(TT - landing, 150, 22), w = 820, h = w * 900 / 1440, x = 940, y = lerp(H + 40, 300, k);
    vgGlass(x - 12, y - 12, w + 24, h + 24, { r: 28 });
    // the view inside pushes in toward the WhatsApp button
    const z = EZ.io(seg(TT, landing + 0.35, landing + 0.85)), C = [0, 0, 1440, 900].map((v, i) => lerp(v, [940, 590, 500, 312][i], z));
    ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 18); ctx.clip();
    const img = asset('sup-landing-contacto.jpg'); if (img) ctx.drawImage(img, ...C, x, y, w, h);
    ctx.restore();
    lw = { map: (px, py) => [x + (px - C[0]) * w / C[2], y + (py - C[1]) * h / C[3]] };
    chip('La página pública', x + 30, y - 46, landing + 0.3, (ix, iy, r) => vgPaw(ix, iy, r * 0.9, VG.blue700));
    if (TT < sello + 0.2) ringTrack(lw, [[landing + 0.8, L_WHATSAPP]], { r: 26 * UNIT, k: 1 - clamp((TT - sello) / 0.2) });
  }
  // the seal lands next to the WhatsApp button
  const [sx, sy] = lw ? lw.map(1085, 700) : [1600, 700];
  pawJump(sello - 0.8, 0.8, vgDogTag(d.x, d.y, d.s), [sx, sy]);
  if (TT >= sello) {
    const k = springEase(TT - sello, 260, 12);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(-0.16 * k); ctx.scale(k, k);
    ctx.shadowColor = 'rgba(247,167,28,0.75)'; ctx.shadowBlur = 50;
    ctx.beginPath(); ctx.arc(0, 0, 104, 0, TAU); ctx.fillStyle = VG.amber; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.arc(0, 0, 88, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.setLineDash([10, 9]); ctx.stroke(); ctx.setLineDash([]);
    vgPaw(0, -16, 42, VG.white);
    ctx.font = `800 22px ${VG_FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = VG.slate900; ctx.fillText('PUBLICADO', 0, 58);
    ctx.restore();
    const r = clamp((TT - sello) / 0.6);
    if (r < 1) { ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, 104 + 170 * EZ.o2(r), 0, TAU); ctx.lineWidth = 6 * (1 - r); ctx.strokeStyle = `rgba(247,167,28,${1 - r})`; ctx.stroke(); ctx.restore(); }
  }
  if (TT < landing) vgCaption('Página web', ['El WhatsApp', 'de la clínica'], { t0: E0 + 0.15 });
  else vgCaption('Página web', ['Guardas, y ya', 'está en la web'], { t0: landing + 0.1 });
}

// ---------------------------------------------------------------------
//  7. CATÁLOGOS — categories and specialties; species and breeds
// ---------------------------------------------------------------------
const CA_CANINO = [300, 316, 288, 64], CA_RAZAS = [604, 316, 790, 400];
function sceneCatalogos() {
  vgGround();
  const salto = 32.0;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  supHome({ pose: poseAt([[E0, 'tablet'], [32.6, 'point']]) });
  const scr = seqScreen([[E0, 'sup-catalogos.jpg'], [32.8, 'sup-especies.jpg']], [250, 60, 1170, 731], eraEnd() - 0.35);
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), scr.map(...ctr(CA_CANINO)));
  if (u >= 1) ringTrack(scr, [[33.2, CA_CANINO], [34.2, CA_RAZAS]], { r: 20 * UNIT });
  vgCaption('Catálogos', ['Especies, razas', 'y especialidades'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  8. DATOS — the log keeps the change from scene 6 (who, when, what); the full backup
// ---------------------------------------------------------------------
const D_ENTRADA = [300, 376, 1094, 64], D_RESPALDO = [300, 260, 768, 256], D_BOTON = [324, 460, 256, 30];
function sceneDatos() {
  vgGround();
  const salto = 36.4, resp = 39.0;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  supHome({ pose: poseAt([[E0, 'point'], [41.0, 'idle']]) });
  const scr = seqScreen([[E0, 'sup-bitacora.jpg'], [resp, 'sup-respaldo.jpg']], [250, 60, 1170, 731], eraEnd() - 0.35);
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), scr.map(...ctr(D_ENTRADA)));
  if (u >= 1) ringTrack(scr, [[salto + 0.6, D_ENTRADA], [resp + 0.3, D_RESPALDO], [40.4, D_BOTON]], { r: 18 * UNIT });
  if (TT < resp) vgCaption('Datos', ['Cada cambio queda', 'en la bitácora'], { t0: E0 + 0.15 });
  else vgCaption('Datos', ['Y una copia', 'de toda la base'], { t0: resp + 0.1 });
}

// ---------------------------------------------------------------------
//  9. REPORTES — every site, with a site filter
// ---------------------------------------------------------------------
const RS_FILTRO = [300, 220, 160, 30], RS_CHARTS = [300, 470, 1094, 360];
function sceneReportesSup() {
  vgGround();
  const salto = 41.9;
  const d = dogHome({ mood: 'calm', tag: TT < salto });
  supHome({ pose: poseAt([[E0, 'tablet'], [42.4, 'point']]) });
  const scr = panScreen('sup-reportes.jpg', [[E0, [250, 60, 1170]]], E0, eraEnd() - 0.35);
  const u = pawJump(salto, 0.6, vgDogTag(d.x, d.y, d.s), scr.map(...ctr(RS_FILTRO)));
  if (u >= 1) ringTrack(scr, [[salto + 0.6, RS_FILTRO], [43.8, RS_CHARTS]], { r: 18 * UNIT });
  vgCaption('Reportes', ['De todas', 'las sedes'], { t0: E0 + 0.15 });
}

// ---------------------------------------------------------------------
//  10. CIERRE — the control room again, both sites lit, the UDES logo on the map; Luna happy
// ---------------------------------------------------------------------
function sceneCierreSup() {
  vgGround();
  mapaSedes({ k: springEase(TT - E0, 120, 22), t0: E0, logo: springEase(TT - (E0 + 0.8), 170, 24) });
  ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 960, W, H - 960); ctx.restore();
  const k = springEase(TT - E0, 120, 22);
  sup(lerp(VET.x, SUP_DESK.x, k), lerp(VET.y, SUP_DESK.y, k), lerp(VET.s, SUP_DESK.s, k), { pose: TT > E0 + 0.8 && TT < E0 + 2.8 ? 'wave' : 'tablet' });
  vgDog(lerp(DOG.x, CENTRO_DOG.x, k), lerp(DOG.y, CENTRO_DOG.y, k), lerp(DOG.s, CENTRO_DOG.s, k), { mood: 'happy' });
  vgCaption('Clínica Veterinaria UDES', ['Toda la clínica,', 'en tus manos'], { t0: E0 + 0.4 });
}
