import * as THREE from 'three';
import { ModeBase } from './base.js';
import { Recorder, makeGhost } from './ghost.js';
import { propBag, speedSign, trafficLight, groundLine, sign } from './props.js';
import { makeTruck, makeWorker, animateWorker } from '../world.js';
import { M } from './scenarios.js';

// Terminal tractor driver. Westbound in the truck lane: radar at x=28, zebra at x=0,
// then a right turn into the block and a red light under the RTG at z=-4.
const LIMIT = 15 / 3.6;            // m/s
const REACT = 0.75, DECEL = 4.0;   // driver reaction (s), loaded braking on wet asphalt (m/s²)
const stopDist = (v) => v * REACT + (v * v) / (2 * DECEL);
const kmh = (v) => Math.round(Math.abs(v) * 3.6);
const RADAR_X = 28, ZEBRA = 1.6, LANE_Z = 20, STOP_Z = -4, RED_Z = -6.2;
const SPAWN = [{ x: 62, z: LANE_Z, yaw: Math.PI }, { x: 26, z: LANE_Z, yaw: Math.PI }, { x: -3.5, z: 9, yaw: Math.PI / 2 }];
const PED = { from: [0.2, 24.6], cross: [0.2, 12.4], rest: [3.4, 11.4] };

export class DriveMode extends ModeBase {
  setup() {
    const w = this.world, scene = w.scene;
    this.hideWorldTrucks = true; w.setTrucksVisible(false);
    this.player.setBodyVisible(false);
    w.craneManual = true; this.y0 = w.hang.position.y;
    this.bag = propBag(scene);
    this.truck = this.bag.add(makeTruck(0x2a6fb0));
    this.cab = this.truck.children.find((m) => m.position.x === 3.7 && m.position.y === 2.15);
    this.wheels = this.truck.userData.wheels;
    this.ped = this.bag.add(makeWorker(0x38c172));
    speedSign(this.bag, 15, 44, 23.2, Math.PI / 2);
    sign(this.bag, ['RADAR', 'Batas 15 km/jam'], RADAR_X, 23.4, { yaw: Math.PI / 2, w: 2, h: 1, bg: '#ffffff', fg: '#c0392b' });
    groundLine(this.bag, RADAR_X, LANE_Z, 0.3, 4, 0xf5c518, 0.8);
    groundLine(this.bag, 6, LANE_Z, 0.5, 4);                                   // stop line before the zebra
    groundLine(this.bag, -3.5, STOP_Z, 7.5, 0.5);                              // stop line before the RTG bay
    this.light = trafficLight(this.bag, -8.2, STOP_Z, Math.PI / 2);
    sign(this.bag, ['STOP SAAT MERAH', 'Box sedang turun', 'STOP ON RED'], -9.6, STOP_Z + 1.4, { yaw: Math.PI / 2, w: 2.4, h: 1.2 });
    this.rec = new Recorder(() => this.capture(), 10);
    this.ui.setHint({ en: M.driveKeys.en.map(([k, l]) => `${k} ${l}`).join(' · '), id: M.driveKeys.id.map(([k, l]) => `${k} ${l}`).join(' · ') });
    this.camPos = new THREE.Vector3(); this.snap = true; this.time = 0;
    this.reset(0);
  }
  teardown() {
    this.bag?.clear(); this.world.hang.position.y = this.y0 ?? this.world.hang.position.y;
    this.world.craneManual = false; this.world.setTrucksVisible(true); this.player.setBodyVisible(true);
    if (this.audio?.nodes?.dieselGain) this.audio.nodes.dieselGain.gain.value = 0.08;
  }
  jumpTo(i) { for (let k = 0; k < i; k++) { (this.resolved ||= new Set()).add(k); this.results[k] = 'pass'; } this.syncHud(); this.reset(i); }

  // Put the truck at the start of checkpoint i and re-arm everything after it.
  reset(i) {
    const s = SPAWN[i];
    this.x = s.x; this.z = s.z; this.yaw = s.yaw; this.v = 0; this.steer = 0;
    this.pedState = 'wait'; this.pedT = 0; this.setPed(...PED.from, Math.PI); this.ped.rotation.x = 0; this.ped.position.y = 0; this.ped.rotation.z = 0;
    if (i >= 2) { this.pedState = 'rest'; this.setPed(...PED.rest, -Math.PI / 2); }
    this.lightState = 'red'; this.waited = 0; this.lift = 0;
    if (this.cab) { this.cab.scale.y = 1; this.cab.position.y = 2.15; }
    this.attemptFailed = false; this.rec.reset(); this.snap = true;
    this.place();
  }
  setPed(x, z, yaw) { this.ped.position.set(x, 0, z); if (yaw !== undefined) this.ped.rotation.y = yaw; }
  get f() { return new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)); }
  place() { this.truck.position.set(this.x, 0, this.z); this.truck.rotation.y = this.yaw; this.player.yaw = this.yaw - Math.PI / 2; }
  capture() { return { x: this.x, z: this.z, yaw: this.yaw, v: this.v, px: this.ped.position.x, pz: this.ped.position.z, py: this.ped.rotation.y, hy: this.world.hang.position.y, light: this.lightState }; }
  apply(s) {
    this.x = s.x; this.z = s.z; this.yaw = s.yaw; this.place();
    for (const wh of this.wheels) wh.rotation.y += s.v * 0.016 / 0.52;
    this.ped.position.set(s.px, 0, s.pz); this.ped.rotation.y = s.py; animateWorker(this.ped, performance.now() / 1000, s.v > 0.1 ? 0.6 : 0.1);
    this.world.hang.position.y = s.hy; this.light.set(s.light);
  }
  front() { return new THREE.Vector3(this.x, 0, this.z).addScaledVector(this.f, 5.0); }
  rear() { return new THREE.Vector3(this.x, 0, this.z).addScaledVector(this.f, -4.8); }

  onKey(e) { if (e.code === 'KeyH') this.audio?.horn(); if (e.code === 'KeyV') { this.cab_ = !this.cab_; this.snap = true; } }

  drive(dt) {
    const k = this.keys, f = this.f;
    const thr = k.KeyW || k.ArrowUp, brk = k.KeyS || k.ArrowDown;
    if (thr) this.v += (this.v < 0 ? 6 : 2.2) * dt;
    if (brk) this.v = this.v > 0.2 ? this.v - 6.5 * dt : Math.max(-2.5, this.v - 1.6 * dt);
    if (!thr && !brk) this.v -= Math.sign(this.v) * Math.min(Math.abs(this.v), (0.7 + 0.03 * this.v * this.v) * dt);
    this.v = Math.max(-2.5, Math.min(12.5, this.v));
    const target = ((k.KeyA || k.ArrowLeft) ? 1 : 0) - ((k.KeyD || k.ArrowRight) ? 1 : 0);
    this.steer += (target * 0.65 - this.steer) * Math.min(1, dt * 4);
    this.yaw += (this.v / 6) * Math.tan(this.steer) * dt;
    this.x += Math.cos(this.yaw) * this.v * dt; this.z += -Math.sin(this.yaw) * this.v * dt;
    this.collide();
    for (const wh of this.wheels) wh.rotation.y += this.v * dt / 0.52;
    this.place();
    if (this.audio?.nodes?.dieselGain) this.audio.nodes.dieselGain.gain.value = 0.08 + Math.abs(this.v) * 0.012;
  }
  collide() {
    this.x = Math.max(-70, Math.min(70, this.x)); this.z = Math.max(-40, Math.min(37, this.z));
    const f = this.f, r = 1.35; let hit = false;
    for (const off of [-3.6, 0, 3.6]) {
      const px = this.x + f.x * off, pz = this.z + f.z * off;
      for (const c of this.world.colliders) {
        if (px < c.minX - r || px > c.maxX + r || pz < c.minZ - r || pz > c.maxZ + r) continue;
        const dl = px - (c.minX - r), dr = c.maxX + r - px, dn = pz - (c.minZ - r), df = c.maxZ + r - pz;
        const m = Math.min(dl, dr, dn, df);
        if (m === dl) this.x -= dl; else if (m === dr) this.x += dr; else if (m === dn) this.z -= dn; else this.z += df;
        hit = true;
      }
    }
    if (hit && Math.abs(this.v) > 1.2) this.audio?.tone?.(70, 0.25, { type: 'sine', gain: 0.25 });
    if (hit) this.v *= 0.2;
  }

  camera_(dt) {
    const f = this.f, cam = this.camera;
    if (this.cab_) {
      cam.position.set(this.x + f.x * 5.3, 3.0, this.z + f.z * 5.3);
      cam.lookAt(this.x + f.x * 16, 1.8, this.z + f.z * 16);
      return;
    }
    const want = new THREE.Vector3(this.x - f.x * 13, 6.2, this.z - f.z * 13);
    if (this.snap) { this.camPos.copy(want); this.snap = false; } else this.camPos.lerp(want, 1 - Math.exp(-dt * 4));
    cam.position.copy(this.camPos); cam.lookAt(this.x + f.x * 5, 1.6, this.z + f.z * 5);
  }

  pedestrian(dt) {
    const p = this.ped.position;
    if (this.pedState === 'wait') { animateWorker(this.ped, this.time, 0.08); if (this.front().x < 18 && this.idx >= 1) { this.pedState = 'cross'; this.pedSeenAt = this.front().x - ZEBRA; } return; }
    if (this.pedState === 'cross') {
      p.z -= 1.0 * dt; this.ped.rotation.y = Math.PI; animateWorker(this.ped, this.time, 1);
      if (p.z <= PED.cross[1]) this.pedState = 'aside';
      return;
    }
    if (this.pedState === 'aside') {
      const dx = PED.rest[0] - p.x, dz = PED.rest[1] - p.z, d = Math.hypot(dx, dz);
      if (d < 0.05) { this.pedState = 'rest'; this.ped.rotation.y = -Math.PI / 2; return; }
      p.x += (dx / d) * 1.0 * dt; p.z += (dz / d) * 1.0 * dt; this.ped.rotation.y = Math.atan2(dx, dz); animateWorker(this.ped, this.time, 1);
      return;
    }
    animateWorker(this.ped, this.time, 0.08);
  }
  // Distance from the pedestrian to the truck body (0 = touching).
  pedGap() {
    const f = this.f, d = new THREE.Vector3().subVectors(this.ped.position, new THREE.Vector3(this.x, 0, this.z));
    const along = d.x * f.x + d.z * f.z, side = d.x * Math.sin(this.yaw) + d.z * Math.cos(this.yaw);
    const ax = Math.max(0, Math.abs(along - 0.1) - 5.0), sx = Math.max(0, Math.abs(side) - 1.3);
    return Math.hypot(ax, sx);
  }

  crane(dt) {
    const h = this.world.hang;
    if (this.lightState === 'red') h.position.y = this.y0 - 1.0 + 0.7 * Math.cos(this.time * 0.45);   // landing, just above cab height
    else { this.lift = Math.min(1, this.lift + dt * 0.5); h.position.y += (this.y0 + 1.4 - h.position.y) * Math.min(1, dt * 2); }
    this.light.set(this.lightState);
  }

  tick(dt) {
    this.time += dt;
    this.drive(dt); this.pedestrian(dt); this.crane(dt);
    this.rec.tick(dt);
    this.camera_(dt);
    const fr = this.front();
    // 1 · radar
    if (this.idx === 0 && fr.x < RADAR_X) {
      if (Math.abs(this.v) > LIMIT + 0.28) return this.failSpeed();
      this.pass(0, `${kmh(this.v)} ${this.t(M.kmh)}`);
    }
    // 2 · zebra: the checker is in our lane while the truck spans the crossing, or we touch him
    if (this.idx === 1) {
      const rr = this.rear(); const spans = Math.min(fr.x, rr.x) < ZEBRA && Math.max(fr.x, rr.x) > -ZEBRA;
      const inLane = this.pedState === 'cross' && Math.abs(this.ped.position.z - this.z) < 3.4;
      if (this.pedGap() < 0.35 || (spans && inLane)) return this.failZebra();
      if (fr.x < -4 && this.z > 12) this.pass(1);
    }
    // 3 · RTG bay: wait at the line until the light goes green
    if (this.idx === 2) {
      const atLine = fr.z < STOP_Z + 6 && fr.z > RED_Z && Math.abs(this.x + 3.5) < 6;
      if (this.lightState === 'red' && atLine && Math.abs(this.v) < 0.3) { this.waited += dt; if (this.waited > 2.5) this.lightState = 'green'; }
      if (this.lightState === 'red' && fr.z < RED_Z && Math.abs(this.x) < 7) return this.failRtg();
      if (fr.z < -20) this.pass(2);
    }
    const tgt = [[RADAR_X, LANE_Z], [0, LANE_Z], [-3.5, STOP_Z + 1]][this.idx];
    if (tgt) { this.world.setBeacon(tgt[0], tgt[1], true); this.ui.setObjectiveNote(`${Math.max(0, Math.hypot(fr.x - tgt[0], fr.z - tgt[1]) - 1).toFixed(0)} m`); }
    else this.world.setBeacon(0, 0, false);
    this.ui.setTimer(this.elapsed);
    this.gauge();
  }

  gauge() {
    const sp = kmh(this.v), over = Math.abs(this.v) > LIMIT + 0.28;
    const light = this.idx === 2 ? `<div class="row"><span>${this.t(M.light)}</span><b class="${this.lightState === 'red' ? 'bad' : 'ok'}">${this.t(M[this.lightState])}</b></div>` : '';
    this.ui.setGauge(`<div class="big ${over ? 'over' : ''}">${sp}<small>${this.t(M.kmh)}</small></div>
      <div class="row"><span>${this.t(M.limit)}</span><b>15 ${this.t(M.kmh)}</b></div>
      <div class="row"><span>${this.t(M.gear)}</span><b>${this.v < -0.1 ? 'R' : Math.abs(this.v) < 0.1 ? 'N' : 'D'}</b></div>${light}`);
  }

  ghost(lead, opts) {
    this.world.setBeacon(0, 0, false);
    return makeGhost({
      world: this.world, frames: this.rec.clip(lead), apply: (s) => this.apply(s),
      focus: (s) => new THREE.Vector3(s.x, 0, s.z), tele: (s) => `${kmh(s.v)} ${this.t(M.kmh)} · ${this.t(M.limit).toLowerCase()} 15`,
      ...opts,
    });
  }
  // What-if: a checker steps out just beyond what a 15 km/h stop would need.
  failSpeed() {
    const v = Math.abs(this.v), L = this.ui.lang;
    const fr = this.front(), f = this.f, D = stopDist(LIMIT) + 1.2;
    const P = fr.clone().addScaledVector(f, D);
    const w = makeWorker(0xff8c1a); w.position.set(P.x, 0, LANE_Z + 2.4); w.rotation.y = Math.PI; this.world.scene.add(w);
    const strip = (len, color, off) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.5), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(fr.x + f.x * len / 2, 0.08, LANE_Z + off); this.world.scene.add(m); return m; };
    const red = strip(stopDist(v), 0xff3b3b, -1.6), green = strip(stopDist(LIMIT), 0x3ccf7a, 1.6);
    red.visible = green.visible = false;
    // distance travelled k seconds after the worker appears: reaction, then braking
    const s = (k) => (k < REACT ? v * k : v * REACT + Math.min(v * (k - REACT) - (DECEL / 2) * (k - REACT) ** 2, (v * v) / (2 * DECEL)));
    let kHit = null; for (let k = 0; k < 6; k += 0.01) if (s(k) >= D - 0.4) { kHit = k; break; }
    const hit = kHit !== null;
    const t = (en, id) => (L === 'id' ? id : en);
    const lead = 3.2;
    const r = this.ghost(lead, {
      after: 4.2, impactAfter: hit ? kHit : 3,
      aftermath: (k, last) => {
        red.visible = green.visible = true;
        const d = s(k); this.x = last.x + f.x * d; this.z = last.z + f.z * d; this.place();
        if (k < 0.6) { w.position.z = LANE_Z + 2.4 - k * 3; animateWorker(w, k, 1); }
        if (hit && k > kHit) { const q = k - kHit; w.position.x = P.x + f.x * Math.min(q * 7, 6); w.position.y = Math.max(0.3, 1.6 * q - 2.5 * q * q); w.rotation.z = -Math.min(Math.PI / 2, q * 4); }
      },
      focusAfter: () => new THREE.Vector3(P.x, 0, LANE_Z),
      captions: [
        { t: 0, text: t(`Radar: ${kmh(v)} km/h in a 15 zone.`, `Radar: ${kmh(v)} km/jam di zona 15.`) },
        { t: lead, text: t(`What if a checker steps out ${D.toFixed(1)} m ahead?`, `Bagaimana kalau checker muncul ${D.toFixed(1)} m di depan?`) },
        { t: lead + 1.0, text: t(`Red: your stop at ${kmh(v)} km/h, ${stopDist(v).toFixed(1)} m. Green: at 15, ${stopDist(LIMIT).toFixed(1)} m.`, `Merah: jarak hentimu di ${kmh(v)} km/jam, ${stopDist(v).toFixed(1)} m. Hijau: di 15, ${stopDist(LIMIT).toFixed(1)} m.`) },
        { t: lead + 2.6, text: hit ? t('At 15 km/h he walks away. At your speed he does not.', 'Di 15 km/jam dia selamat. Di kecepatanmu, tidak.') : t('You stop just short. That was luck, not distance.', 'Kamu berhenti tepat sebelum dia. Itu keberuntungan, bukan jarak.') },
      ],
      dispose: () => this.world.scene.remove(w, red, green),
    });
    this.fail(0, r, () => this.reset(0));
  }
  failZebra() {
    const L = this.ui.lang, t = (en, id) => (L === 'id' ? id : en);
    const gap = this.pedGap(), hit = gap < 0.35, v = Math.abs(this.v), seen = this.pedSeenAt ?? 18;
    const f = this.f; const lead = 4.5;
    const r = this.ghost(lead, {
      after: 2.8,
      aftermath: (k, last) => {
        const d = Math.min(v * k, (v * v) / 8 + v * 0.2); this.x = last.x + f.x * d; this.z = last.z + f.z * d; this.place();
        const p = this.ped;
        if (hit) { p.position.x = last.px + f.x * Math.min(k * 7, 6); p.position.y = Math.max(0.3, 1.5 * k - 2.4 * k * k); p.rotation.z = -Math.min(Math.PI / 2, k * 4); p.rotation.x = -Math.min(Math.PI / 2, k * 3); }
        else { p.rotation.y = Math.atan2(-f.x, -f.z); p.userData.arms[0].rotation.x = -2.6; p.userData.arms[1].rotation.x = -2.2; }
      },
      captions: [
        { t: 0, text: t(`He stepped onto the crossing when your bumper was ${seen.toFixed(0)} m away.`, `Dia melangkah ke zebra saat bumper-mu ${seen.toFixed(0)} m darinya.`) },
        { t: lead - 1.4, text: t(`${kmh(v)} km/h. Stopping distance ${stopDist(v).toFixed(1)} m.`, `${kmh(v)} km/jam. Jarak henti ${stopDist(v).toFixed(1)} m.`) },
        { t: lead + 0.2, text: hit ? t('Struck on the zebra. 25 t does not stop for a crossing.', 'Tertabrak di zebra. 25 t tidak berhenti karena garis.') : t(`Through the crossing with him on it, ${gap.toFixed(1)} m from your truck.`, `Menerobos zebra saat dia di atasnya, ${gap.toFixed(1)} m dari truk.`) },
      ],
    });
    this.fail(1, r, () => this.reset(1));
  }
  failRtg() {
    const L = this.ui.lang, t = (en, id) => (L === 'id' ? id : en);
    const f = this.f, last0 = this.capture(), vv = Math.max(2, Math.abs(this.v));
    const targetZ = -12 + 3.7;                             // cab centre under the box
    const dist = Math.max(0, (last0.z - targetZ) * Math.sign(-f.z || -1));
    const tArrive = dist / vv, drop = 1.1;
    const lead = 4.5;
    const r = this.ghost(lead, {
      after: tArrive + drop + 1.8, impactAfter: tArrive + drop,
      aftermath: (k, last) => {
        const d = Math.min(k, tArrive) * vv; this.x = last.x + f.x * d; this.z = last.z + f.z * d; this.place();
        const h = this.world.hang; const yHit = this.y0 - 2.95;   // box bottom ends on the crushed cab
        if (k > tArrive) { const q = Math.min(1, (k - tArrive) / drop); h.position.y = last.hy + (yHit - last.hy) * q * q; }
        if (k > tArrive + drop && this.cab) { this.cab.scale.y = 0.42; this.cab.position.y = 1.65; }
      },
      focusAfter: () => new THREE.Vector3(this.x, 0, this.z), angle: 0.3, sweep: 0, radius: 15, height: 6.5,
      captions: [
        { t: 0, text: t('Red light. The RTG is landing a 30 t box in this bay.', 'Lampu merah. RTG sedang menurunkan box 30 t di bay ini.') },
        { t: lead * 0.6, text: t('From the crane cab the operator sees the spreader, not the ground under it.', 'Dari kabin crane operator melihat spreader, bukan tanah di bawahnya.') },
        { t: lead + tArrive + drop, text: t('30 t onto the cab roof. The cab is built for a rollover, not for this.', '30 t menimpa atap kabin. Kabin dibuat untuk terguling, bukan untuk ini.') },
      ],
    });
    this.fail(2, r, () => this.reset(2));
  }
  afterCard() { this.snap = true; this.camera_(0); }
}
