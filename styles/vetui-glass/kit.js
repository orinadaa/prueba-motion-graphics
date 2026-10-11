// =====================================================================
//  styles/vetui-glass/kit.js — the vetUI "floating glass" look of the Clínica Veterinaria UDES system,
//  measured from frontend/src/styles/vetui.css and docs/vetui.md:
//  a brand-blue gradient lit by drifting halos (blue and amber), glass surfaces with a light rim and a
//  floating shadow, Raleway type, ONE amber accent (the next thing you do / the active state).
//  Motion on 1s with springs (200ms ease-out habits of the UI, scaled up for video).
//  The hero is a white dog with a navy collar and an amber paw tag.
//  Built on kit/core.js. Own helpers are prefixed `vg`.
// =====================================================================
const VG = {
  blue500: '#4280F7', blue600: '#0C5CF5', blue700: '#0847C0', blue800: '#06338A',
  amber: '#F7A71C', amberD: '#D98A06', green: '#16A34A', red: '#E4434B', navy: '#0B3C74',
  blue50: '#EFF6FF', blue100: '#DBEAFE', slate900: '#0F172A', slate700: '#334155',
  white: '#FFFFFF', fur: '#FFFFFF', furShade: '#D7E3F4', ear: '#E9D8BF', earShade: '#D6BF9E', tongue: '#F28C9B',
};
const VG_FONT = '"Raleway", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
const VG_MONO = '"SFMono-Regular", Consolas, "DejaVu Sans Mono", monospace';

// ---------------------------------------------------------------------
//  ground: the landing's gradient (blue-600 -> 700 -> 800) with drifting halos and faint paw prints
// ---------------------------------------------------------------------
function vgGround(o = {}) {
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  const g = ctx.createLinearGradient(0, 0, W * 0.25, H);
  g.addColorStop(0, VG.blue600); g.addColorStop(0.45, VG.blue700); g.addColorStop(1, VG.blue800);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const halo = (x, y, r, c, a) => { const h = ctx.createRadialGradient(x, y, 0, x, y, r); h.addColorStop(0, c.replace(')', `,${a})`).replace('rgb', 'rgba')); h.addColorStop(1, c.replace(')', ',0)').replace('rgb', 'rgba')); ctx.fillStyle = h; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); };
  const d = TT * TAU / 32;   // the 32s drift of animate-halo-deriva
  halo(W * (0.18 + 0.05 * Math.sin(d)), H * (0.15 + 0.06 * Math.cos(d * 1.3)), W * 0.42, 'rgb(66,128,247)', 0.55);
  halo(W * (0.92 + 0.04 * Math.cos(d)), H * (0.12 + 0.05 * Math.sin(d)), W * 0.3, 'rgb(247,167,28)', o.amber ?? 0.5);
  halo(W * (0.78 + 0.05 * Math.sin(d * 0.8)), H * (0.95 + 0.04 * Math.cos(d)), W * 0.38, 'rgb(247,167,28)', (o.amber ?? 0.5) * 0.8);
  halo(W * (0.05 + 0.04 * Math.cos(d * 0.7)), H * (0.9), W * 0.3, 'rgb(12,92,245)', 0.5);
  // faint paw prints drifting up (HuellasFondo)
  const R = RNG('vg-paws');
  for (let i = 0; i < 9; i++) {
    const x = R.r(0.03, 0.97) * W, y0 = R.r(0, 1) * H, s = R.r(18, 34) * UNIT, rot = R.r(-0.6, 0.6);
    const y = ((y0 - TT * 14 * UNIT) % H + H) % H;
    vgPaw(x, y, s, `rgba(255,255,255,${0.05 + 0.03 * R.f()})`, rot);
  }
  ctx.restore();
}

// a paw: one pad and four toes, centred on (x, y), radius r
function vgPaw(x, y, r, color, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(0, r * 0.28, r * 0.52, r * 0.42, 0, 0, TAU); ctx.fill();
  [[-0.62, -0.18, -0.35], [-0.24, -0.62, -0.12], [0.24, -0.62, 0.12], [0.62, -0.18, 0.35]].forEach(([tx, ty, a]) => {
    ctx.beginPath(); ctx.ellipse(tx * r, ty * r, r * 0.2, r * 0.27, a, 0, TAU); ctx.fill();
  });
  ctx.restore();
}
const vgPawPts = (x, y, r) => ellipsePts(x, y + r * 0.05, r * 0.9, r * 0.85, 0, 64);

// ---------------------------------------------------------------------
//  materials: glass (white 12%), white glass (white 80%), crystal-strong (white 88%)
//  vgGlass(x, y, w, h, { r, tone: 'vidrio'|'blanco'|'fuerte'|'azul', ring: amber ring width, k: 0..1 lift })
// ---------------------------------------------------------------------
function vgGlass(x, y, w, h, o = {}) {
  const r = o.r ?? 28 * UNIT, tone = o.tone ?? 'vidrio';
  const fill = { vidrio: 'rgba(255,255,255,0.12)', blanco: 'rgba(255,255,255,0.82)', fuerte: 'rgba(255,255,255,0.9)', azul: 'rgba(12,72,190,0.55)' }[tone];
  ctx.save();
  ctx.shadowColor = 'rgba(4,22,70,0.38)'; ctx.shadowBlur = 50 * UNIT; ctx.shadowOffsetY = 22 * UNIT;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  ctx.shadowColor = 'transparent';
  // the top reflection
  const g = ctx.createLinearGradient(0, y, 0, y + h * 0.5);
  g.addColorStop(0, 'rgba(255,255,255,0.22)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fill();
  // the rim of light
  const rim = ctx.createLinearGradient(x, y, x + w * 0.3, y + h);
  rim.addColorStop(0, 'rgba(255,255,255,0.7)'); rim.addColorStop(0.5, 'rgba(255,255,255,0.22)'); rim.addColorStop(1, 'rgba(255,255,255,0.35)');
  ctx.lineWidth = 1.6 * UNIT; ctx.strokeStyle = rim; ctx.stroke();
  if (o.ring) { ctx.beginPath(); ctx.roundRect(x - 3, y - 3, w + 6, h + 6, r + 3); ctx.lineWidth = o.ring * UNIT; ctx.strokeStyle = VG.amber; ctx.stroke(); }
  ctx.restore();
}

// a real screen: a crop (sx, sy, sw, sh) of asset `name`, framed as a floating glass window at (x, y, w)
// height follows the crop's aspect. o.k = entrance 0..1 (rises and settles), o.alpha
function vgScreen(name, sx, sy, sw, sh, x, y, w, o = {}) {
  const img = asset(name), pad = 12 * UNIT, h = w * sh / sw, k = o.k ?? 1;
  ctx.save();
  ctx.globalAlpha *= clamp(k * 1.6);
  const dy = (1 - k) * 90 * UNIT, sc = 0.94 + 0.06 * k;
  ctx.translate(x + w / 2, y + h / 2 + dy); ctx.scale(sc, sc); ctx.translate(-(x + w / 2), -(y + h / 2));
  vgGlass(x - pad, y - pad, w + 2 * pad, h + 2 * pad, { r: 30 * UNIT });
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, w, h, 20 * UNIT); ctx.clip();
  if (img) ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h); else { ctx.fillStyle = VG.blue700; ctx.fillRect(x, y, w, h); }
  ctx.restore();
  ctx.restore();
  return { x, y, w, h, s: w / sw, map: (px, py) => [x + (px - sx) * w / sw, y + (py - sy) * h / sh] };
}

// the amber focus: a pill ring around a region of a screen (screen-px rect via scr.map), drawn growing with k
function vgFocus(scr, px, py, pw, ph, k, o = {}) {
  if (k <= 0) return;
  const [x0, y0] = scr.map(px, py), [x1, y1] = scr.map(px + pw, py + ph), m = (o.m ?? 8) * UNIT;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, s = 1.25 - 0.25 * k;
  const w = (x1 - x0 + 2 * m) * s, h = (y1 - y0 + 2 * m) * s;
  ctx.save(); ctx.globalAlpha = clamp(k * 2);
  ctx.shadowColor = o.glow ?? 'rgba(247,167,28,0.65)'; ctx.shadowBlur = 24 * UNIT;
  ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, o.r ?? Math.min(h / 2, 40 * UNIT));
  ctx.lineWidth = 5 * UNIT; ctx.strokeStyle = o.color ?? VG.amber; ctx.stroke();
  ctx.restore();
  return [cx, cy];
}

// ---------------------------------------------------------------------
//  type: Raleway. vgText writes word by word: each word rises out of a mask on a spring.
// ---------------------------------------------------------------------
function vgText(str, x, y, size, color, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 700} ${size}px ${o.font ?? VG_FONT}`; ctx.textBaseline = 'alphabetic';
  if (o.spacing) ctx.letterSpacing = o.spacing + 'px';
  const words = String(str).split(' '), sp = ctx.measureText(' ').width, total = ctx.measureText(str).width;
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  const t0 = o.t0 ?? -99, step = o.step ?? 0.06;
  words.forEach((wd, i) => {
    const ww = ctx.measureText(wd).width, k = springEase(TT - t0 - i * step, 260, 26);
    if (k > 0.001) {
      ctx.save(); ctx.beginPath(); ctx.rect(cx - 4, y - size * 1.1, ww + 8, size * 1.45); ctx.clip();
      ctx.fillStyle = (o.colors && o.colors[i]) || color; ctx.fillText(wd, cx, y + (1 - k) * size * 1.1);
      ctx.restore();
    }
    cx += ww + sp;
  });
  ctx.restore(); return total;
}
// the scene caption, top-left: an over-title (uppercase, tracked) and a title; drawn at screen size (DEFER)
function vgCaption(over, title, o = {}) {
  const f = () => {
    const x = o.x ?? 110 * UNIT, y = o.y ?? 150 * UNIT, t0 = o.t0 ?? E0 + 0.15;
    vgText(over.toUpperCase(), x, y, 22 * UNIT, VG.blue100, { weight: 600, spacing: 3 * UNIT, t0 });
    const lines = Array.isArray(title) ? title : [title];
    lines.forEach((ln, i) => vgText(ln, x, y + (66 + i * 66) * UNIT, 56 * UNIT, VG.white, { t0: t0 + 0.12 + i * 0.12, colors: o.colors?.[i] }));
    // the amber-and-white accent bar of SectionHeading
    const k = springEase(TT - t0 - 0.3, 170, 26), by = y + (66 * lines.length + 34) * UNIT;
    ctx.save(); ctx.fillStyle = VG.white; ctx.beginPath(); ctx.roundRect(x, by, 56 * UNIT * k, 7 * UNIT, 4 * UNIT); ctx.fill();
    ctx.fillStyle = VG.amber; ctx.beginPath(); ctx.roundRect(x + 60 * UNIT * k, by, 30 * UNIT * k, 7 * UNIT, 4 * UNIT); ctx.fill(); ctx.restore();
  };
  if (DEFER) DEFER.push(f); else f();
}
// a glass pill label (chips, badges)
function vgPill(str, x, y, size, o = {}) {
  ctx.save(); ctx.font = `${o.weight ?? 600} ${size}px ${VG_FONT}`;
  const w = ctx.measureText(str).width + size * 1.6, h = size * 2.1;
  const x0 = o.align === 'center' ? x - w / 2 : x;
  ctx.shadowColor = 'rgba(4,22,70,0.3)'; ctx.shadowBlur = 20 * UNIT; ctx.shadowOffsetY = 8 * UNIT;
  ctx.beginPath(); ctx.roundRect(x0, y - h / 2, w, h, h / 2); ctx.fillStyle = o.fill ?? 'rgba(255,255,255,0.16)'; ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.lineWidth = 1.5 * UNIT; ctx.strokeStyle = o.stroke ?? 'rgba(255,255,255,0.5)'; ctx.stroke();
  ctx.fillStyle = o.color ?? VG.white; ctx.textBaseline = 'middle'; ctx.fillText(str, x0 + size * 0.8, y + size * 0.05);
  ctx.restore(); return w;
}

// the pointer: white arrow with a navy rim; `press` 0..1 squashes it and sends an amber ripple
function vgCursor(x, y, press = 0, s = UNIT) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (1 - 0.12 * Math.sin(Math.PI * clamp(press))), s * (1 - 0.12 * Math.sin(Math.PI * clamp(press))));
  if (press > 0 && press < 1) { ctx.beginPath(); ctx.arc(0, 0, 18 + 50 * press, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = `rgba(247,167,28,${1 - press})`; ctx.stroke(); }
  ctx.shadowColor = 'rgba(4,22,70,0.4)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46); ctx.lineTo(12, 35); ctx.lineTo(21, 54); ctx.lineTo(29, 50); ctx.lineTo(20, 32); ctx.lineTo(35, 32); ctx.closePath();
  ctx.fillStyle = VG.white; ctx.fill(); ctx.shadowColor = 'transparent'; ctx.lineJoin = 'round'; ctx.lineWidth = 3.5; ctx.strokeStyle = VG.navy; ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------
//  the hero: Luna, a cream French poodle like a plush toy — a fluffy pompom body, a big round head with a
//  topknot, long curly ears with pink bows, big shiny eyes; a navy collar with the amber paw tag.
//  vgDog(x, y, s, { mood: 'worried'|'calm'|'happy', scratch: 0..1, tag: false hides the tag, key })
//  (x, y) = the point between its front paws on the ground; s = scale (1 = ~340px tall). Sets SPARK_AT.
//  vgDogTag(x, y, s) returns where the tag hangs, for the paw that jumps to the next action.
// ---------------------------------------------------------------------
const VG_FUR = { light: '#FFFBF4', base: '#F6EBDD', shade: '#E6D3BC', ear: '#EEDDC6', earShade: '#DCC4A6', bow: '#F7A1C4', bowD: '#E2709F', blush: 'rgba(242,128,160,0.35)' };
const vgDogTag = (x, y, s) => [x + 22 * s, y - 112 * s];
// a fluffy cloud: an ellipse ringed by curls (deterministic: the curl count and sizes come from the key)
function vgPuff(cx, cy, rx, ry, fill, o = {}) {
  const n = o.n ?? Math.max(8, Math.round((rx + ry) / 9)), cr = o.cr ?? Math.min(rx, ry) * 0.34, R = RNG('puff' + (o.key ?? ''));
  ctx.fillStyle = fill; ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + (o.rot ?? 0), j = 0.85 + 0.3 * R.f();
    const px = cx + Math.cos(a) * (rx - cr * 0.55), py = cy + Math.sin(a) * (ry - cr * 0.55);
    ctx.moveTo(px + cr * j, py); ctx.arc(px, py, cr * j, 0, TAU);
  }
  ctx.moveTo(cx + rx - cr * 0.5, cy); ctx.ellipse(cx, cy, rx - cr * 0.5, ry - cr * 0.5, 0, 0, TAU);
  ctx.fill();
  if (o.curls === false) return;
  // the curly coat: a scalloped rim and a few curls inside, in a soft shade of the fur
  const R2 = RNG('curl' + (o.key ?? ''));
  ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 2.6; ctx.strokeStyle = 'rgba(176,140,104,0.38)';
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + (o.rot ?? 0), px = cx + Math.cos(a) * (rx - cr * 0.55), py = cy + Math.sin(a) * (ry - cr * 0.55);
    ctx.beginPath(); ctx.arc(px, py, cr * 0.92, a - 0.9, a + 0.9); ctx.stroke();
  }
  const m = Math.round((rx * ry) / 900);
  for (let i = 0; i < m; i++) {
    const a = R2.r(0, TAU), d = Math.sqrt(R2.f()) * 0.62, px = cx + Math.cos(a) * rx * d, py = cy + Math.sin(a) * ry * d, r = cr * R2.r(0.28, 0.42);
    ctx.beginPath(); ctx.arc(px, py, r, R2.r(0, TAU), R2.r(0, TAU) + 3.6); ctx.stroke();
  }
  ctx.restore();
}
function vgFurFill(y0, y1) { const g = ctx.createLinearGradient(-60, y0, 40, y1); g.addColorStop(0, VG_FUR.light); g.addColorStop(0.6, VG_FUR.base); g.addColorStop(1, VG_FUR.shade); return g; }
function vgBow(x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  for (const k of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(k * 18, -22, k * 40, -18, k * 36, 0); ctx.bezierCurveTo(k * 40, 18, k * 18, 22, 0, 0);
    ctx.fillStyle = VG_FUR.bow; ctx.fill();
    ctx.beginPath(); ctx.moveTo(k * 8, -3); ctx.quadraticCurveTo(k * 22, -8, k * 28, 0); ctx.lineWidth = 2.5; ctx.strokeStyle = VG_FUR.bowD; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(k * 4, 6); ctx.lineTo(k * 14, 26); ctx.lineTo(k * 20, 20); ctx.closePath(); ctx.fillStyle = VG_FUR.bowD; ctx.fill();
  }
  ctx.beginPath(); ctx.ellipse(0, 0, 8, 9, 0, 0, TAU); ctx.fillStyle = VG_FUR.bowD; ctx.fill();
  ctx.beginPath(); ctx.ellipse(-2, -3, 3, 3, 0, 0, TAU); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill();
  ctx.restore();
}
function vgDog(x, y, s, o = {}) {
  const mood = o.mood ?? 'calm', key = o.key ?? 'dog';
  const happy = mood === 'happy', worried = mood === 'worried';
  const breathe = Math.sin(TT * TAU * 0.5) * 0.015;
  const wag = Math.sin(TT * TAU * (happy ? 3.2 : 1.1)) * (happy ? 0.5 : worried ? 0.08 : 0.22);
  const tilt = worried ? 0.12 + 0.04 * Math.sin(TT * TAU * 0.4) : happy ? -0.06 * Math.sin(TT * TAU * 1.6) : 0.03 * Math.sin(TT * TAU * 0.3);
  SPARK_AT = toScreen(x, y - 170 * s);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const ell = (cx, cy, rx, ry, a, fill) => { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, a, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  // ground shadow
  ell(-15, 4, 135, 15, 0, 'rgba(4,22,70,0.28)');
  // tail: a pompom on a short stem
  ctx.save(); ctx.translate(-92, -58); ctx.rotate(-0.6 + wag);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, -38); ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.strokeStyle = VG_FUR.shade; ctx.stroke();
  vgPuff(-38, -52, 26, 26, VG_FUR.base, { key: key + 'tail', n: 9 });
  ctx.restore();
  // body and haunch
  ctx.save(); ctx.scale(1, 1 + breathe);
  vgPuff(-58, -36, 46, 38, VG_FUR.shade, { key: key + 'haunch' });
  vgPuff(-28, -88, 80, 70, vgFurFill(-160, 0), { key: key + 'body' });
  ctx.restore();
  // front legs with pompom cuffs (one lifts to scratch)
  const sc = clamp(o.scratch ?? 0), lift = sc * (0.5 + 0.5 * Math.sin(TT * TAU * 5));
  const leg = (lx, up) => { ctx.beginPath(); ctx.roundRect(lx - 13, -104 - up, 26, 92, 13); ctx.fillStyle = VG_FUR.base; ctx.fill(); vgPuff(lx + 2, -16 - up, 24, 18, VG_FUR.light, { key: key + 'cuff' + lx, n: 8 }); };
  leg(-14, 0); leg(30, lift * 42);
  // chest
  vgPuff(10, -118, 46, 44, VG_FUR.light, { key: key + 'chest' });
  // collar and the amber tag
  ctx.save(); ctx.beginPath(); ctx.moveTo(-30, -144); ctx.quadraticCurveTo(12, -118, 58, -142);
  ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.strokeStyle = VG.navy; ctx.stroke(); ctx.restore();
  if (o.tag !== false) { const ty = -112 + 3 * Math.sin(TT * TAU * 0.9); ell(22, ty, 16, 16, 0, VG.amber); vgPaw(22, ty + 1, 9.5, VG.white); }
  // head
  ctx.save(); ctx.translate(14, -212); ctx.rotate(tilt);
  const earSw = Math.sin(TT * TAU * 0.7) * 0.04, earDrop = worried ? 0.12 : happy ? -0.06 : 0;
  // ears (behind the face), long and curly
  for (const k of [-1, 1]) {
    ctx.save(); ctx.translate(k * 58, -6); ctx.rotate(k * (0.12 + earDrop) + earSw);
    vgPuff(k * 6, 48, 30, 58, k < 0 ? VG_FUR.earShade : VG_FUR.ear, { key: key + 'ear' + k, n: 12 });
    ctx.restore();
  }
  // topknot and the round head
  vgPuff(0, -62, 46, 34, VG_FUR.base, { key: key + 'top', n: 10 });
  vgPuff(0, 0, 74, 68, vgFurFill(-70, 70), { key: key + 'head', n: 16 });
  // face: muzzle, cheeks, eyes, nose, mouth
  ell(10, 30, 34, 25, 0, VG_FUR.light);
  ell(-36, 22, 13, 8, 0, VG_FUR.blush); ell(56, 22, 13, 8, 0, VG_FUR.blush);
  const blink = (B + key.length * 5) % 50 < 2;
  for (const ex of [-22, 40]) {
    if (happy) { ctx.beginPath(); ctx.arc(ex, 0, 11, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.strokeStyle = VG.navy; ctx.stroke(); }
    else if (blink) { ctx.beginPath(); ctx.moveTo(ex - 10, 0); ctx.lineTo(ex + 10, 0); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = VG.navy; ctx.stroke(); }
    else { ell(ex, 0, 12, 14, 0, VG.navy); ell(ex + 4, -5, 5, 5, 0, VG.white); ell(ex - 4, 5, 2.2, 2.2, 0, 'rgba(255,255,255,0.8)'); }
  }
  if (worried) { ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.strokeStyle = VG_FUR.earShade; ctx.beginPath(); ctx.moveTo(-34, -26); ctx.lineTo(-12, -32); ctx.moveTo(52, -26); ctx.lineTo(30, -32); ctx.stroke(); }
  ell(10, 20, 11, 8, 0, '#2A2233'); ell(7, 17, 3.5, 2.2, 0, 'rgba(255,255,255,0.7)');
  ctx.lineCap = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = '#2A2233';
  if (happy) {
    ctx.beginPath(); ctx.moveTo(-6, 34); ctx.quadraticCurveTo(10, 58, 26, 34); ctx.closePath(); ctx.fillStyle = '#8A3550'; ctx.fill();
    ell(10, 46, 9, 8, 0, VG.tongue);
  } else {
    ctx.beginPath(); ctx.moveTo(10, 28); ctx.lineTo(10, 33); ctx.moveTo(-2, 34); ctx.quadraticCurveTo(4, 40, 10, 33); ctx.quadraticCurveTo(16, 40, 22, 34); ctx.stroke();
  }
  // the pink bows on top of the ears
  vgBow(-58, -38, 1, -0.35 + earSw); vgBow(58, -38, 1, 0.35 + earSw);
  ctx.restore();
  ctx.restore();
}

// ---------------------------------------------------------------------
//  a second character: the vet. White coat over blue scrubs, a stethoscope, a friendly round face.
//  vgVet(x, y, s, { pose: 'idle'|'wave'|'point'|'pet'|'tablet', look: -1|1, key })
//  (x, y) = between the feet on the ground; s = scale (1 = ~470px tall). Same flat, soft look as the dog.
// ---------------------------------------------------------------------
const VG_VET = { skin: '#F1C6A0', skinD: '#DDA67C', hair: '#3A2A22', coat: '#FFFFFF', coatD: '#D5E1F2', scrub: '#5BA8F5', pants: '#14306A', steth: '#4B5B75', cheek: 'rgba(232,120,120,0.28)' };
function vgVet(x, y, s, o = {}) {
  const pose = o.pose ?? 'idle', key = o.key ?? 'vet', look = o.look ?? 1;
  const br = Math.sin(TT * TAU * 0.45) * 2.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const ell = (cx, cy, rx, ry, a, f) => { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, a, 0, TAU); ctx.fillStyle = f; ctx.fill(); };
  const rr = (x0, y0, w, h, r, f) => { ctx.beginPath(); ctx.roundRect(x0, y0, w, h, r); ctx.fillStyle = f; ctx.fill(); };
  ell(0, 4, 95, 13, 0, 'rgba(4,22,70,0.28)');
  // legs and shoes
  rr(-38, -150, 32, 150, 14, VG_VET.pants); rr(6, -150, 32, 150, 14, VG_VET.pants);
  ell(-26, -6, 30, 12, 0, VG.white); ell(26, -6, 30, 12, 0, VG.white);
  // an arm: from the shoulder (sx, sy), angle a (0 = straight down), elbow bend b; returns the hand point
  const arm = (sx, sy, a, b, len = 92) => {
    const ex = sx + Math.sin(a) * len, ey = sy + Math.cos(a) * len, hx = ex + Math.sin(a + b) * len * 0.95, hy = ey + Math.cos(a + b) * len * 0.95;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = VG_VET.coatD; ctx.lineWidth = 40;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = VG_VET.coat; ctx.lineWidth = 34; ctx.stroke(); ctx.restore();
    ell(hx + Math.sin(a + b) * 10, hy + Math.cos(a + b) * 10, 17, 17, 0, VG_VET.skin);
    return [hx, hy];
  };
  // the arm behind (left on screen)
  const wave = Math.sin(TT * TAU * 2.2) * 0.35;
  let back = [-0.08, 0.05];
  if (pose === 'pet') back = [-1.05 + Math.sin(TT * TAU * 1.2) * 0.06, 0.2];
  if (pose === 'tablet') back = [-0.2, 1.3];
  const hb = arm(-62, -318 + br, back[0], back[1]);
  // coat body
  ctx.beginPath(); ctx.moveTo(-64, -330 + br); ctx.quadraticCurveTo(-80, -230, -86, -118); ctx.lineTo(86, -118); ctx.quadraticCurveTo(80, -230, 64, -330 + br); ctx.closePath();
  const g = ctx.createLinearGradient(-90, -330, 90, -120); g.addColorStop(0, VG_VET.coat); g.addColorStop(1, VG_VET.coatD); ctx.fillStyle = g; ctx.fill();
  // scrubs in the V, the lapels, a pocket with a pen, a badge
  ctx.beginPath(); ctx.moveTo(-26, -334 + br); ctx.lineTo(0, -268 + br); ctx.lineTo(26, -334 + br); ctx.closePath(); ctx.fillStyle = VG_VET.scrub; ctx.fill();
  ctx.save(); ctx.strokeStyle = VG_VET.coatD; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-28, -332 + br); ctx.lineTo(0, -262 + br); ctx.lineTo(0, -122); ctx.moveTo(28, -332 + br); ctx.lineTo(0, -262 + br); ctx.stroke();
  ctx.strokeRect(22, -230, 42, 40); ctx.restore();
  rr(30, -244, 6, 26, 3, VG.navy);
  rr(-62, -236, 40, 28, 5, VG.white); rr(-62, -236, 40, 8, 4, VG.blue600);
  // neck, stethoscope, head
  rr(-16, -350 + br, 32, 26, 10, VG_VET.skinD);
  ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = VG_VET.steth; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-34, -336 + br); ctx.quadraticCurveTo(-44, -270, -16, -246); ctx.moveTo(34, -336 + br); ctx.quadraticCurveTo(40, -290, 18, -262); ctx.quadraticCurveTo(4, -246, -16, -246); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-16, -246); ctx.lineTo(-20, -212); ctx.stroke(); ctx.restore();
  ell(-20, -204, 14, 14, 0, '#C9D3E2'); ell(-20, -204, 8, 8, 0, '#E8EEF6');
  const hy = -402 + br, tilt = 0.04 * Math.sin(TT * TAU * 0.35) + (pose === 'pet' ? -0.12 : 0);
  ctx.save(); ctx.translate(0, hy); ctx.rotate(tilt);
  ell(-56, 6, 12, 16, 0, VG_VET.skinD); ell(56, 6, 12, 16, 0, VG_VET.skinD);
  ell(0, 0, 58, 62, 0, VG_VET.skin);
  // hair: a rounded cap with a soft quiff
  ctx.beginPath(); ctx.moveTo(-58, 2); ctx.bezierCurveTo(-64, -70, 40, -92, 60, -18); ctx.bezierCurveTo(46, -40, 10, -46, -22, -30); ctx.bezierCurveTo(-40, -22, -50, -10, -58, 2); ctx.closePath(); ctx.fillStyle = VG_VET.hair; ctx.fill();
  ell(-18, -52, 34, 18, -0.3, VG_VET.hair);
  // face (looks toward `look`)
  const fx = look * 6, blink = (B + 17) % 46 < 2;
  for (const ex of [-20, 20]) { if (blink) { ctx.beginPath(); ctx.moveTo(fx + ex - 8, 6); ctx.lineTo(fx + ex + 8, 6); ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = VG.navy; ctx.stroke(); } else { ell(fx + ex, 6, 7, 9, 0, VG.navy); ell(fx + ex + 2, 3, 2.5, 2.5, 0, VG.white); } }
  ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = VG_VET.hair;
  ctx.beginPath(); ctx.moveTo(fx - 30, -12); ctx.quadraticCurveTo(fx - 20, -18, fx - 10, -13); ctx.moveTo(fx + 10, -13); ctx.quadraticCurveTo(fx + 20, -18, fx + 30, -12); ctx.stroke();
  ell(fx - 34, 22, 10, 6, 0, VG_VET.cheek); ell(fx + 34, 22, 10, 6, 0, VG_VET.cheek);
  ctx.beginPath(); ctx.moveTo(fx - 14, 28); ctx.quadraticCurveTo(fx, 42, fx + 14, 28); ctx.lineWidth = 4; ctx.strokeStyle = '#8A4B3A'; ctx.stroke();
  ctx.restore();
  // the arm in front (right on screen): down, waving, pointing toward the screen, or holding the tablet
  let fr = [0.1, 0.05];
  if (pose === 'wave') fr = [-2.5 + wave * 0.4, -0.5 + wave];
  if (pose === 'point') fr = [-1.75, -0.15];
  if (pose === 'tablet') fr = [-0.2, 1.3];
  const hf = arm(62, -318 + br, -fr[0], -fr[1]);
  if (pose === 'tablet') { ctx.save(); ctx.translate((hb[0] + hf[0]) / 2, (hb[1] + hf[1]) / 2 - 10); ctx.rotate(-0.12); vgGlass(-56, -40, 112, 80, { r: 12, tone: 'blanco' }); ctx.restore(); }
  ctx.restore();
  return { hand: [x + hf[0] * s, y + hf[1] * s], back: [x + hb[0] * s, y + hb[1] * s] };
}

// ---------------------------------------------------------------------
//  STYLE hooks (styles/README.md). The ground never changes, so a morph is a glass window on the same sky.
// ---------------------------------------------------------------------
const STYLE = {
  name: 'vetui-glass',
  paper: '#06338A',
  backdrop() { vgGround(); },
  window(P, key, src, o) {
    ctx.save(); trace(P, true); ctx.clip(); ctx.drawImage(src, 0, 0); ctx.restore();
    ctx.save(); trace(P, true); ctx.lineWidth = 2 * UNIT; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.stroke(); ctx.restore();
  },
  blob(P, c) { ctx.save(); trace(P, true); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 2 * UNIT; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.stroke(); ctx.restore(); },
  hero(x, y, r) { vgDog(x, y + r, r / 170); },
  heroColor: "#F6EBDD",
  post() {},
  ones: true,
};
