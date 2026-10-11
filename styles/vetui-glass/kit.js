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
    vgPaw(x, y, s, `rgba(255,255,255,${0.05 + 0.03 * R.r()})`, rot);
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
  ctx.shadowColor = 'rgba(247,167,28,0.65)'; ctx.shadowBlur = 24 * UNIT;
  ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, o.r ?? Math.min(h / 2, 40 * UNIT));
  ctx.lineWidth = 5 * UNIT; ctx.strokeStyle = VG.amber; ctx.stroke();
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
//  the hero: a white dog, sitting, facing right; navy collar with the amber paw tag.
//  vgDog(x, y, s, { mood: 'worried'|'calm'|'happy', scratch: 0..1, tag: false hides the tag, key })
//  (x, y) = the point between its front paws on the ground; s = scale (1 = ~330px tall). Sets SPARK_AT.
//  vgDogTag(x, y, s) returns where the tag hangs, for the paw that jumps to the next action.
// ---------------------------------------------------------------------
const vgDogTag = (x, y, s) => [x + 26 * s, y - 84 * s];
function vgDog(x, y, s, o = {}) {
  const mood = o.mood ?? 'calm', key = o.key ?? 'dog';
  const happy = mood === 'happy', worried = mood === 'worried';
  const breathe = Math.sin(TT * TAU * 0.5) * 0.012;
  const wag = Math.sin(TT * TAU * (happy ? 3.2 : 1.1)) * (happy ? 0.55 : worried ? 0.08 : 0.25);
  const tilt = worried ? 0.1 + 0.05 * Math.sin(TT * TAU * 0.4) : happy ? -0.05 * Math.sin(TT * TAU * 1.6) : 0.02 * Math.sin(TT * TAU * 0.3);
  SPARK_AT = toScreen(x, y - 160 * s);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const fur = (P) => { const g = ctx.createLinearGradient(-120, -260, 60, 20); g.addColorStop(0, VG.fur); g.addColorStop(0.65, VG.fur); g.addColorStop(1, VG.furShade); return g; };
  const ell = (cx, cy, rx, ry, a, fill) => { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, a, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  // ground shadow
  ell(-20, 4, 140, 16, 0, 'rgba(4,22,70,0.28)');
  // tail
  ctx.save(); ctx.translate(-105, -40); ctx.rotate(-0.5 + wag);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-55, -30, -48, -95); ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.strokeStyle = VG.furShade; ctx.stroke();
  ctx.restore();
  // body (sitting) + back leg
  ctx.save(); ctx.scale(1, 1 + breathe);
  ell(-35, -78, 82, 80, -0.25, fur());
  ell(-62, -18, 58, 26, 0, VG.furShade);
  ell(-58, -24, 54, 24, 0, fur());
  ctx.restore();
  // front legs and paws (one lifts to scratch)
  const sc = clamp(o.scratch ?? 0), lift = sc * (0.5 + 0.5 * Math.sin(TT * TAU * 5));
  const leg = (lx, up) => { ctx.beginPath(); ctx.roundRect(lx - 15, -110 - up, 30, 110, 15); ctx.fillStyle = fur(); ctx.fill(); ell(lx + 6, -6 - up, 22, 12, 0, VG.white); };
  leg(-5, 0); leg(32, lift * 40);
  // chest
  ell(18, -110, 46, 56, 0.15, VG.white);
  // head
  ctx.save(); ctx.translate(30, -168); ctx.rotate(tilt);
  // back ear
  ell(-40, -18, 20, 44, 0.45 + (worried ? 0.25 : 0), VG.earShade);
  ell(0, 0, 66, 60, 0, fur());
  // snout and nose
  ell(52, 18, 42, 30, 0.08, VG.white);
  ell(88, 6, 13, 10, 0, VG.navy);
  ell(85, 3, 4, 2.5, 0, 'rgba(255,255,255,0.6)');
  // mouth
  ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = VG.navy;
  if (happy) {
    ctx.beginPath(); ctx.moveTo(84, 18); ctx.quadraticCurveTo(70, 44, 46, 32); ctx.closePath(); ctx.fillStyle = '#7A2E3B'; ctx.fill();
    ell(64, 38, 11, 9, 0.2, VG.tongue);
  } else { ctx.beginPath(); ctx.moveTo(84, 18); ctx.quadraticCurveTo(72, worried ? 26 : 30, 56, worried ? 30 : 28); ctx.stroke(); }
  // eye (blinks), brow
  const blink = (B + key.length * 5) % 50 < 2;
  if (happy) { ctx.beginPath(); ctx.arc(26, -12, 9, Math.PI * 1.1, Math.PI * 1.9); ctx.lineWidth = 5; ctx.stroke(); }
  else { ell(26, -12, 8, blink ? 1.5 : 10, 0, VG.navy); if (!blink) ell(29, -16, 3, 3, 0, VG.white); }
  if (worried) { ctx.beginPath(); ctx.moveTo(12, -32); ctx.lineTo(36, -26); ctx.lineWidth = 4; ctx.stroke(); }
  // front ear (floppy; droops when worried, perks when happy)
  ell(-22, -10, 24, 50, (worried ? 0.35 : happy ? -0.05 : 0.15) + Math.sin(TT * TAU * 0.7) * 0.03, VG.ear);
  ctx.restore();
  // collar (under the chin, curved around the neck)
  ctx.save(); ctx.beginPath(); ctx.moveTo(-18, -112); ctx.quadraticCurveTo(18, -88, 62, -110);
  ctx.lineWidth = 15; ctx.lineCap = 'round'; ctx.strokeStyle = VG.navy; ctx.stroke(); ctx.restore();
  if (o.tag !== false) {
    const [tx, ty] = [26, -84 + 3 * Math.sin(TT * TAU * 0.9)];
    ell(tx, ty, 17, 17, 0, VG.amber); vgPaw(tx, ty + 1, 10, VG.white);
  }
  ctx.restore();
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
  heroColor: '#FFFFFF',
  post() {},
  ones: true,
};
