import * as THREE from 'three';
import { ModeBase } from './base.js';
import { Recorder, makeGhost } from './ghost.js';
import { propBag, ring, sign, windsock } from './props.js';
import { makeWorker, animateWorker } from '../world.js';
import { M } from './scenarios.js';

// Emergency: a reefer leaks ammonia. The plume is a pure function of time (puffs emitted on a
// fixed clock, drifting downwind and spreading), so the replay can rebuild it exactly.
const LEAK = new THREE.Vector3(4.6, 1.0, -6.4);
const WIND = new THREE.Vector3(0.43, 0, 0.9).normalize(), PERP = new THREE.Vector3(WIND.z, 0, -WIND.x);
const SPEED = 2.0, EVERY = 0.25, LIFE = 28, PREWARM = 20;
const A = { x: 16, z: 28 }, B = { x: -24, z: 28 }, SPAWN = { x: -1, z: 4 }, VICTIM = { x: 11, z: 9 };
const NAB = 25, IDLH = 300;
const amp = (a) => 2.0 / Math.pow(1 + a, 1.35);
const rad = (a) => 0.9 + 0.32 * a;

function puffTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(240,238,214,1)'); gr.addColorStop(0.5, 'rgba(232,230,200,0.45)'); gr.addColorStop(1, 'rgba(232,230,200,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
}

export class EvacMode extends ModeBase {
  constructor(ctx, role) { super(ctx, role); this.usesPlayer = true; }
  setup() {
    const w = this.world, bag = this.bag = propBag(w.scene);
    w.paused = true;
    // reefer unit on the end of the front box, hissing
    const unit = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.3, 2.2), new THREE.MeshStandardMaterial({ color: 0xe9ecef, roughness: 0.5 }));
    unit.position.set(4.3, 1.3, -6); bag.add(unit);
    sign(bag, ['BAHAYA · AMONIA', 'R717 · REEFER', 'GAS LEAK'], 3.4, -3.6, { yaw: -Math.PI / 2, w: 2, h: 1, bg: '#ffffff', fg: '#c0392b' });
    // muster points: both are real, only one is right today
    for (const [p, label] of [[A, 'A'], [B, 'B']]) {
      ring(bag, p.x, p.z, 3, 0x3ccf7a);
      sign(bag, [`TITIK KUMPUL ${label}`, `ASSEMBLY POINT ${label}`], p.x, p.z - 3.6, { bg: '#1f8a4c', fg: '#ffffff', w: 2.6, h: 1.3 });
    }
    this.socks = [windsock(bag, -5, 9, WIND), windsock(bag, 6, 32, WIND)];
    this.mustered = [makeWorker(0xff8c1a), makeWorker(0x38c172)].map((m, i) => { bag.add(m); m.position.set(A.x - 1 + i * 2, 0, A.z + 0.5); return m; });
    this.victim = bag.add(makeWorker(0xff8c1a)); this.victim.position.set(VICTIM.x, 0.2, VICTIM.z); this.victim.rotation.set(-Math.PI / 2, 0.7, 0);
    // plume: one point per puff. Points, not sprites: the AO pass skips points, so the haze stays soft.
    const n = this.nPuffs = Math.ceil(LIFE / EVERY) + 1;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute('size', new THREE.BufferAttribute(new Float32Array(n), 1));
    geo.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(n), 1));
    this.cloud = bag.add(new THREE.Points(geo, new THREE.ShaderMaterial({
      uniforms: { map: { value: puffTexture() }, uH: { value: innerHeight * Math.min(devicePixelRatio, 1.25) } },
      vertexShader: 'attribute float size; attribute float alpha; uniform float uH; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = size * uH * 0.5 * projectionMatrix[1][1] / -mv.z; vA = alpha; gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform sampler2D map; varying float vA; void main(){ float a = texture2D(map, gl_PointCoord).a * vA; if (a < 0.004) discard; gl_FragColor = vec4(0.86, 0.85, 0.72, a); }',
      transparent: true, depthWrite: false,
    })));
    this.cloud.frustumCulled = false;
    this.rec = new Recorder(() => this.capture(), 10);
    this.audio?.siren?.(true);
    this.ui.setHint({ en: M.evacHint.en, id: M.evacHint.id });
    this.time = 0; this.peak = 0;
    this.reset();
  }
  teardown() { this.bag?.clear(); this.world.paused = false; this.audio?.siren?.(false); this.player.setBodyVisible(true); this.player.speed = 5.5; }
  reset() {
    this.player.setPosition(SPAWN.x, SPAWN.z, -1.3);            // facing the leak and the haze drifting off it this.player.enabled = true; this.player.speed = 4.2;
    this.dose = 0; this.inside = 0; this.rec.reset();
    const b = this.player.body; if (b) { b.rotation.x = 0; b.position.y = 0; }
    for (const m of this.mustered) { m.rotation.x = 0; m.position.y = 0; }
  }
  get pt() { return PREWARM + this.time; }

  // Plume at time t: positions the sprites, returns nothing. ppm(p, t) samples it.
  plume(t) {
    const g = this.cloud.geometry, pos = g.attributes.position, size = g.attributes.size, alpha = g.attributes.alpha;
    const n0 = Math.floor((t - LIFE) / EVERY) + 1;
    for (let j = 0; j < this.nPuffs; j++) {
      const te = (n0 + j) * EVERY, a = t - te;
      if (a < 0 || a > LIFE) { size.array[j] = 0; alpha.array[j] = 0; continue; }
      const c = this.center(te, a); pos.setXYZ(j, c.x, c.y, c.z);
      size.array[j] = rad(a) * 2.4; alpha.array[j] = (0.035 + 0.1 * Math.exp(-a / 10)) * Math.min(1, a * 2);
    }
    pos.needsUpdate = size.needsUpdate = alpha.needsUpdate = true;
  }
  center(te, a) {
    const mean = Math.sin(te * 0.9) * 0.15 * a + Math.sin(te * 0.31 + 2) * 0.1 * a;
    return LEAK.clone().addScaledVector(WIND, SPEED * a).addScaledVector(PERP, mean).setY(0.8 + a * 0.06);
  }
  ppm(x, z, t) {
    let sum = 0;
    const n0 = Math.floor((t - LIFE) / EVERY) + 1, n1 = Math.floor(t / EVERY);
    for (let k = n0; k <= n1; k++) {
      const te = k * EVERY, a = t - te; const c = this.center(te, a), r = rad(a);
      const d2 = (c.x - x) ** 2 + (c.z - z) ** 2; if (d2 > 9 * r * r) continue;
      sum += amp(a) * Math.exp(-d2 / (r * r));
    }
    return sum * 400;
  }

  capture() { const p = this.player.pos; return { x: p.x, z: p.z, yaw: this.player.yaw, pt: this.pt, ppm: this.cur ?? 0 }; }
  apply(s) {
    const b = this.player.body; if (b) { b.visible = true; b.position.set(s.x, 0, s.z); b.rotation.y = s.yaw + Math.PI; animateWorker(b, s.pt, 0.8); }
    this.plume(s.pt);
  }

  tick(dt) {
    this.time += dt;
    this.plume(this.pt);
    for (const s of this.socks) s.update(this.time);
    const p = this.player.pos;
    const ppm = this.cur = this.ppm(p.x, p.z, this.pt);
    this.peak = Math.max(this.peak, ppm);
    if (ppm > NAB) { this.dose += (ppm / IDLH) * dt; this.inside += dt; }
    this.rec.tick(dt);
    if (this.time > 4 && !this.asked) { this.asked = true; return this.prompt(1, () => { this.player.enabled = true; this.player.lock(); this.hold({ type: 'hold', key: 'KeyE', seconds: 1.6, label: M.radioHold }, () => this.pass(1)); }); }
    if (this.dose >= 3) return this.failPlume();
    if (Math.hypot(p.x - A.x, p.z - A.z) < 3 && !this.resolved?.has(2)) return this.failMuster();
    if (Math.hypot(p.x - B.x, p.z - B.z) < 3 && !this.resolved?.has(2)) { if (!this.resolved?.has(0)) this.pass(0, `${this.t({ en: 'Peak', id: 'Puncak' })} ${Math.round(this.peak)} ppm`); this.pass(2); }
    this.world.setBeacon(0, 0, false);
    this.ui.setObjectiveNote(`${this.t(M.musterA)} ${Math.hypot(p.x - A.x, p.z - A.z).toFixed(0)} m · ${this.t(M.musterB)} ${Math.hypot(p.x - B.x, p.z - B.z).toFixed(0)} m`);
    this.ui.setTimer(this.elapsed);
    this.ui.setHint(this.player.locked ? { en: M.evacHint.en, id: M.evacHint.id } : 'click');
    this.gauge(ppm);
  }
  gauge(ppm) {
    // wind arrow relative to where you are looking
    const fwd = new THREE.Vector3(-Math.sin(this.player.yaw), 0, -Math.cos(this.player.yaw));
    const ang = Math.atan2(fwd.x * WIND.z - fwd.z * WIND.x, fwd.x * WIND.x + fwd.z * WIND.z);
    const lvl = ppm > IDLH ? 'bad' : ppm > NAB ? 'warn' : 'ok';
    this.ui.setGauge(`<div class="k">${this.t(M.exposure)}</div>
      <div class="big ${ppm > NAB ? 'over' : ''}">${Math.round(ppm)}<small>ppm</small></div>
      <div class="row"><span>NAB 25 · IDLH 300</span><b class="${lvl}">${lvl === 'ok' ? '✓' : '!'}</b></div>
      <div class="row"><span>${this.t(M.dose)}</span><b>${Math.round((this.dose / 3) * 100)}%</b></div>
      <div class="meter ${this.dose > 1.5 ? 'bad' : ''}"><i style="width:${Math.min(100, (this.dose / 3) * 100)}%"></i></div>
      <div class="row"><span>${this.t(M.windFrom)}</span><b style="display:inline-block;transform:rotate(${(-ang * 180) / Math.PI}deg)">↑</b></div>`);
  }

  ghost(lead, opts) {
    this.player.enabled = false;
    return makeGhost({
      world: this.world, frames: this.rec.clip(lead), apply: (s) => this.apply(s),
      focus: (s) => new THREE.Vector3(s.x, 0, s.z), radius: 14, height: 7, angle: -0.9,
      tele: (s) => `${Math.round(s.ppm)} ppm`,
      dispose: () => this.player.setBodyVisible(true), ...opts,
    });
  }
  t2(en, id) { return this.ui.lang === 'id' ? id : en; }
  collapse(b, k) { if (!b) return; b.rotation.x = -Math.min(Math.PI / 2, k * 2.2); b.position.y = Math.min(0.2, k * 0.3); }
  failPlume() {
    const lead = 6, secs = this.inside, peak = this.peak;
    const r = this.ghost(lead, {
      after: 2.4, impactAfter: 0.4,
      aftermath: (k, last) => { this.plume(last.pt + k); this.collapse(this.player.body, k); },
      captions: [
        { t: 0, text: this.t2('Walking with the wind, along the cloud.', 'Berjalan searah angin, menyusuri awan gas.') },
        { t: lead - 2, text: this.t2(`${secs.toFixed(0)} s above the 25 ppm limit. Peak ${Math.round(peak)} ppm.`, `${secs.toFixed(0)} dtk di atas batas 25 ppm. Puncak ${Math.round(peak)} ppm.`) },
        { t: lead + 0.4, text: this.t2('Above 300 ppm the airway swells shut. You go down inside the cloud, where nobody can reach you.', 'Di atas 300 ppm saluran napas membengkak. Kamu tumbang di dalam awan, tempat tak ada yang bisa menjangkau.') },
      ],
    });
    this.fail(0, r, () => this.reset());
  }
  failMuster() {
    const lead = 5;
    const r = this.ghost(lead, {
      after: 4, impactAfter: 2.5,
      aftermath: (k, last) => { this.plume(last.pt + k * 3); if (k > 2.5) { this.collapse(this.player.body, (k - 2.5) * 0.6); this.mustered.forEach((m) => this.collapse(m, (k - 2.5) * 0.5)); } },
      captions: [
        { t: 0, text: this.t2('Muster A: nearest, signposted, where the others went.', 'Titik kumpul A: terdekat, ada rambunya, tempat yang lain berkumpul.') },
        { t: lead - 1, text: this.t2('Today it is 30 m downwind of the leak. The windsock pointed straight at it.', 'Hari ini letaknya 30 m searah angin dari kebocoran. Windsock menunjuk tepat ke sana.') },
        { t: lead + 2.5, text: this.t2('The cloud arrives at the muster point with everyone standing in it.', 'Awan gas tiba di titik kumpul, dengan semua orang berdiri di dalamnya.') },
      ],
    });
    this.fail(2, r, () => { this.reset(); for (const m of this.mustered) { m.rotation.x = 0; m.position.y = 0; } });
  }
  // Wrong answer to the man-down call: you run in.
  buildReplay() {
    const p = this.player.pos, start = { x: p.x, z: p.z, yaw: this.player.yaw, pt: this.pt, ppm: this.cur ?? 0 };
    const run = Math.hypot(VICTIM.x - 1 - p.x, VICTIM.z - p.z) / 4.2;
    const r = makeGhost({
      world: this.world, frames: [{ t: 0, s: start }], apply: (s) => this.apply(s),
      focus: () => new THREE.Vector3(VICTIM.x - 1, 0, VICTIM.z), radius: 13, height: 6, angle: 2.3, trail: false,
      after: run + 3, impactAfter: run + 1.2,
      aftermath: (k) => {
        const b = this.player.body; if (!b) return; b.visible = true;
        const q = Math.min(1, k / run); b.position.set(start.x + (VICTIM.x - 1 - start.x) * q, 0, start.z + (VICTIM.z - start.z) * q);
        b.rotation.y = Math.atan2(VICTIM.x - 1 - start.x, VICTIM.z - start.z); animateWorker(b, k, q < 1 ? 1 : 0.1);
        this.plume(start.pt + k);
        if (k > run + 0.6) this.collapse(b, k - run - 0.6);
      },
      captions: [
        { t: 0, text: this.t2('You go in. 15 m, holding your breath.', 'Kamu masuk. 15 m, menahan napas.') },
        { t: run * 0.8, text: this.t2('You cannot hold your breath and drag 80 kg. You breathe in.', 'Kamu tidak bisa menahan napas sambil menyeret 80 kg. Kamu menarik napas.') },
        { t: run + 1.2, text: this.t2('Two casualties instead of one. The ERT now has to find both of you.', 'Dua korban, bukan satu. ERT sekarang harus menemukan kalian berdua.') },
      ],
      dispose: () => { this.player.setBodyVisible(true); const b = this.player.body; if (b) { b.rotation.x = 0; b.position.y = 0; } },
    });
    this.player.enabled = false;
    return r;
  }
  afterCard() { this.player.enabled = true; this.player.lock(); }
}
