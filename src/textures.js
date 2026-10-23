import * as THREE from 'three';

// All textures are drawn on <canvas> at startup — no image files, no downloads.
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(c, repeat = [1, 1], srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
let seed = 11;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

function grime(ctx, w, h, n, alpha, dark = true, maxR = 60) {
  for (let i = 0; i < n; i++) {
    const r = 4 + rnd() * maxR;
    const g = ctx.createRadialGradient(rnd() * w, rnd() * h, 0, 0, 0, r);
    ctx.fillStyle = `rgba(${dark ? '20,16,12' : '240,236,230'},${alpha * rnd()})`;
    ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, r, 0, Math.PI * 2); ctx.fill();
  }
}

const LINES = ['NUSA LINE', 'PELAGIC', 'JAYA FREIGHT', 'ARUS CARGO', 'SAMUDRA', 'KHATULISTIWA', 'BENUA'];
const CODES = ['NUSU', 'PLGU', 'JYFU', 'ARCU', 'SMDU', 'KTLU', 'BNAU'];

// Corrugated container side: colour, grime, shipping-line name and a box number.
export function containerMaps(color, idx) {
  const w = 1024, h = 256;
  const c = canvas(w, h), ctx = c.getContext('2d');
  const base = new THREE.Color(color);
  ctx.fillStyle = `#${base.getHexString()}`; ctx.fillRect(0, 0, w, h);
  // corrugation shading
  for (let x = 0; x < w; x += 16) {
    const g = ctx.createLinearGradient(x, 0, x + 16, 0);
    g.addColorStop(0, 'rgba(0,0,0,0.22)'); g.addColorStop(0.35, 'rgba(255,255,255,0.08)'); g.addColorStop(0.65, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0.22)');
    ctx.fillStyle = g; ctx.fillRect(x, 0, 16, h);
  }
  // top/bottom rails + road grime creeping up from the bottom
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, w, 10); ctx.fillRect(0, h - 12, w, 12);
  const gg = ctx.createLinearGradient(0, h * 0.6, 0, h); gg.addColorStop(0, 'rgba(40,30,20,0)'); gg.addColorStop(1, 'rgba(40,30,20,0.45)');
  ctx.fillStyle = gg; ctx.fillRect(0, 0, w, h);
  const tg = ctx.createLinearGradient(0, 0, 0, h * 0.25); tg.addColorStop(0, 'rgba(255,255,255,0.10)'); tg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = tg; ctx.fillRect(0, 0, w, h);
  grime(ctx, w, h, 50, 0.25);
  // rust streaks
  for (let i = 0; i < 25; i++) { ctx.fillStyle = `rgba(110,55,20,${0.12 + rnd() * 0.2})`; const x = rnd() * w; ctx.fillRect(x, rnd() * h * 0.3, 2 + rnd() * 3, 40 + rnd() * 120); }
  // line name + box number
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = 'bold 54px ui-sans-serif, Helvetica, Arial';
  ctx.fillText(LINES[idx % LINES.length], 70, 120);
  ctx.font = 'bold 30px ui-monospace, Menlo, monospace';
  ctx.fillText(`${CODES[idx % CODES.length]} ${String(100000 + Math.floor(rnd() * 899999))} ${Math.floor(rnd() * 9)}`, 650, 60);
  ctx.font = '22px ui-monospace, Menlo, monospace'; ctx.fillText('45G1', 940, 60);
  const map = tex(c);
  // bump: pure corrugation + rails
  const b = canvas(w, h), bc = b.getContext('2d');
  bc.fillStyle = '#808080'; bc.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 16) {
    const g = bc.createLinearGradient(x, 0, x + 16, 0);
    g.addColorStop(0, '#404040'); g.addColorStop(0.5, '#c0c0c0'); g.addColorStop(1, '#404040');
    bc.fillStyle = g; bc.fillRect(x, 0, 16, h);
  }
  bc.fillStyle = '#e0e0e0'; bc.fillRect(0, 0, w, 10); bc.fillRect(0, h - 12, w, 12);
  const bump = tex(b, [1, 1], false);
  return { map, bump };
}

// Container door end: two leaves, four locking bars, hinges.
export function containerDoorMaps(color) {
  const w = 256, h = 256;
  const c = canvas(w, h), ctx = c.getContext('2d');
  ctx.fillStyle = `#${new THREE.Color(color).getHexString()}`; ctx.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 12) { ctx.fillStyle = x % 24 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.05)'; ctx.fillRect(x, 0, 12, h); }
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(w / 2 - 2, 0, 4, h);
  for (const x of [40, 90, 166, 216]) { ctx.fillStyle = '#d8d8d8'; ctx.fillRect(x - 3, 18, 6, h - 36); ctx.fillStyle = '#333'; ctx.fillRect(x - 8, 110, 16, 28); }
  grime(ctx, w, h, 20, 0.25);
  return { map: tex(c) };
}

export function asphaltMaps() {
  const w = 512, h = 512;
  const c = canvas(w, h), ctx = c.getContext('2d');
  ctx.fillStyle = '#34373c'; ctx.fillRect(0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 34; d[i] += n; d[i + 1] += n; d[i + 2] += n + 2; }
  ctx.putImageData(img, 0, 0);
  grime(ctx, w, h, 160, 0.10, true, 14); grime(ctx, w, h, 40, 0.035, false, 8);
  // cracks
  ctx.strokeStyle = 'rgba(20,20,22,0.6)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 14; i++) { ctx.beginPath(); let x = rnd() * w, y = rnd() * h; ctx.moveTo(x, y); for (let k = 0; k < 10; k++) { x += (rnd() - 0.5) * 50; y += (rnd() - 0.5) * 50; ctx.lineTo(x, y); } ctx.stroke(); }
  const map = tex(c, [40, 40]);
  const r = canvas(w, h), rc = r.getContext('2d');
  rc.fillStyle = '#e6e6e6'; rc.fillRect(0, 0, w, h); grime(rc, w, h, 60, 0.08, true, 10);
  return { map, rough: tex(r, [40, 40], false) };
}

export function concreteMaps() {
  const w = 256, h = 256;
  const c = canvas(w, h), ctx = c.getContext('2d');
  ctx.fillStyle = '#6a6b67'; ctx.fillRect(0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (rnd() - 0.5) * 22; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  ctx.putImageData(img, 0, 0);
  grime(ctx, w, h, 40, 0.12, true, 12);
  return { map: tex(c, [12, 12]) };
}

export function paintedMaps(hex, worn = 0.35) {
  const w = 256, h = 64;
  const c = canvas(w, h), ctx = c.getContext('2d');
  ctx.fillStyle = hex; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 140; i++) { ctx.fillStyle = `rgba(70,74,79,${rnd() * worn})`; ctx.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 8, 2 + rnd() * 5); }
  return { map: tex(c, [8, 1]) };
}

export function hazardStripe() {
  const c = canvas(128, 128), ctx = c.getContext('2d');
  ctx.fillStyle = '#f5c518'; ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = '#111'; for (let i = -128; i < 256; i += 48) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 24, 0); ctx.lineTo(i + 24 + 128, 128); ctx.lineTo(i + 128, 128); ctx.closePath(); ctx.fill(); }
  return tex(c, [1, 1]);
}

export function signText(lines, { bg = '#f5c518', fg = '#111', w = 512, h = 256 } = {}) {
  const c = canvas(w, h), ctx = c.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = fg; ctx.lineWidth = 10; ctx.strokeRect(12, 12, w - 24, h - 24);
  ctx.fillStyle = fg; ctx.textAlign = 'center';
  lines.forEach((l, i) => { ctx.font = `bold ${i === 0 ? 56 : 34}px ui-sans-serif, Helvetica, Arial`; ctx.fillText(l, w / 2, 90 + i * 56); });
  const t = tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}

export function vestMaps(color) {
  const c = canvas(64, 64), ctx = c.getContext('2d');
  ctx.fillStyle = `#${new THREE.Color(color).getHexString()}`; ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#d9d9d9'; ctx.fillRect(0, 20, 64, 8); ctx.fillRect(0, 40, 64, 8);
  return { map: tex(c) };
}

// Transparent canvas with painted text, for road markings.
export function paintText(text, { fg = '#f2f2f2', w = 512, h = 160, size = 110 } = {}) {
  const c = canvas(w, h), ctx = c.getContext('2d');
  ctx.clearRect(0, 0, w, h); ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `bold ${size}px ui-sans-serif, Helvetica, Arial`; ctx.fillText(text, w / 2, h / 2);
  for (let i = 0; i < 90; i++) { ctx.clearRect(rnd() * w, rnd() * h, 2 + rnd() * 6, 2 + rnd() * 4); }   // wear
  const t = tex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}

// Soft radial shadow blob for contact shadows under heavy things.
export function contactShadow() {
  const c = canvas(256, 256), ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128); g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(0.6, 'rgba(0,0,0,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const t = tex(c, [1, 1], false); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}

// Tileable ripple normal map for water.
export function waterNormal() {
  const w = 256, h = 256, c = canvas(w, h), ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h), d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const nx = Math.sin(x * 0.12 + y * 0.05) * 0.35 + Math.sin(y * 0.09 - x * 0.03) * 0.25;
    const ny = Math.cos(y * 0.11 + x * 0.04) * 0.35 + Math.cos(x * 0.07 + y * 0.02) * 0.25;
    d[i] = 128 + nx * 90; d[i + 1] = 128 + ny * 90; d[i + 2] = 255; d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return tex(c, [24, 8], false);
}
