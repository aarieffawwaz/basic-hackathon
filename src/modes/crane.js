import * as THREE from 'three';
import { ModeBase } from './base.js';
import { Recorder, makeGhost } from './ghost.js';
import { CraneSim, CX, BOX0, TRUCK_Z, CHASSIS } from './cranesim.js';
import { makeWorker, animateWorker } from '../world.js';
import { M } from './scenarios.js';

// RTG crane operator. Lock the box, hoist, travel the gantry down the block to a waiting
// tractor while a checker steps out between the stacks, and land 30 t on the chassis.
const GAP_Z = -19.05;                       // gap between two stack rows the checker steps out of
const BOX_HALF = 2.6;                      // inside the box footprint, not just brushing it

export class CraneMode extends ModeBase {
  setup() {
    this.sim = new CraneSim(this.world);
    this.player.setBodyVisible(false);
    this.checker = makeWorker(0xff8c1a); this.world.scene.add(this.checker);
    this.rec = new Recorder(() => this.capture(), 10);
    this.camPos = new THREE.Vector3(); this.snap = true; this.time = 0;
    this.ui.setHint({ en: M.craneKeys.en.map(([k, l]) => `${k} ${l}`).join(' · '), id: M.craneKeys.id.map(([k, l]) => `${k} ${l}`).join(' · ') });
    this.reset(0);
  }
  teardown() { this.sim?.dispose(); this.world.scene.remove(this.checker); this.player.setBodyVisible(true); }
  jumpTo(i) { for (let k = 0; k < i; k++) { (this.resolved ||= new Set()).add(k); this.results[k] = 'pass'; } this.syncHud(); this.reset(i); }

  reset(i) {
    if (i === 0) this.sim.reset({ grounded: true });
    else if (i === 1) this.sim.reset({ gz: 0, h: -1.6 });
    else this.sim.reset({ gz: TRUCK_Z + 12, h: 0 });
    this.ck = { state: i >= 2 ? 'gone' : 'wait', x: i >= 2 ? -12.6 : 5.0, z: GAP_Z };
    this.horned = false; this.note = ''; this.rec.reset(); this.snap = true;
    this.checker.rotation.x = 0; this.checker.position.y = 0; this.checker.userData.arms[1].rotation.x = 0;
    this.placeChecker();
  }
  placeChecker() { this.checker.position.set(this.ck.x, 0, this.ck.z); this.checker.rotation.set(0, this.ck.state === 'back' ? Math.PI / 2 : -Math.PI / 2, 0); }
  capture() { return { ...this.sim.capture(), cx: this.ck.x, cs: this.ck.state }; }
  apply(s) { this.sim.restore(s); this.ck.x = s.cx; this.ck.state = s.cs; this.placeChecker(); animateWorker(this.checker, performance.now() / 1000, s.cs === 'cross' || s.cs === 'back' ? 1 : 0.1); }

  onKey(e) {
    if (e.code === 'KeyV') { this.cab_ = !this.cab_; this.snap = true; }
    if (e.code === 'KeyH') { this.audio?.horn(); this.horned = true; if (this.ck.state === 'cross') this.ck.state = 'look'; }
    if (e.code === 'Space') {
      const r = this.sim.toggleLocks();
      if (r === 'interlock') this.flashNote(this.t(M.interlock)); else this.audio?.click();
    }
  }
  flashNote(text) { this.note = text; clearTimeout(this._nt); this._nt = setTimeout(() => { this.note = ''; }, 2500); }

  controls() {
    const k = this.keys;
    this.sim.cmd.travel = (k.KeyW || k.ArrowUp ? -1 : 0) + (k.KeyS || k.ArrowDown ? 1 : 0);
    this.sim.cmd.hoist = ((k.KeyR ? 1 : 0) - (k.KeyF ? 1 : 0)) * (k.ShiftLeft || k.ShiftRight ? 0.3 : 1);
  }
  checkerMove(dt) {
    const c = this.ck, s = this.sim;
    if (c.state === 'wait' && this.idx >= 1 && s.loadZ < -12.4) c.state = 'cross';
    if (c.state === 'cross') { c.x -= 1.0 * dt; if (c.x < -12.6) c.state = 'gone'; }
    if (c.state === 'look') { this.lookT = (this.lookT || 0) + dt; if (this.lookT > 0.8) { c.state = 'back'; this.lookT = 0; } }
    if (c.state === 'back') { c.x += 1.5 * dt; if (c.x > 5.0) c.state = 'held'; }
    if (c.state === 'held' && s.loadZ < GAP_Z - 2.6) c.state = 'cross';
    this.placeChecker();
    if (c.state === 'look') this.checker.rotation.y = 0;
    animateWorker(this.checker, this.time, c.state === 'cross' || c.state === 'back' ? 1 : 0.1);
    if (c.state === 'look') { this.checker.userData.arms[1].rotation.x = -2.4; }
  }
  checkerUnderLoad() {
    const c = this.ck;
    return (c.state === 'cross' || c.state === 'look' || c.state === 'back') && Math.abs(c.x - CX) < BOX_HALF && Math.abs(this.sim.loadZ - c.z) < 1.22 + 0.6 && this.sim.carrying && this.sim.bottom > 1.9;
  }

  camera_(dt) {
    const s = this.sim, cam = this.camera;
    const look = new THREE.Vector3(CX, s.bottom + 1.0, s.loadZ - 1.5);
    let want;
    if (this.cab_) want = new THREE.Vector3(CX + 5.6, 11.4, -12 + s.gz + 0.6);
    else want = new THREE.Vector3(CX + 2.5, 12.5, -12 + s.gz + 15);      // up the corridor, behind the gantry
    if (this.snap) { this.camPos.copy(want); this.snap = false; } else this.camPos.lerp(want, 1 - Math.exp(-dt * 5));
    cam.position.copy(this.camPos); cam.lookAt(look);
  }

  tick(dt) {
    this.time += dt;
    this.controls(); this.sim.update(dt); this.checkerMove(dt);
    this.rec.tick(dt); this.camera_(dt);
    const s = this.sim;
    if (this.idx === 0 && s.carrying) {
      if (s.locks < 4 && s.bottom > 2.0) return this.failLocks();
      if (s.locks === 4 && s.bottom > 1.0) this.pass(0);
    }
    if (this.idx === 0 && !s.carrying && s.h > -BOX0 + 0.5) this.note = this.t(M.emptySpreader);
    if (this.checkerUnderLoad()) return this.failPeople();
    if (this.idx === 1 && s.carrying && s.overTruck() < 0.7) this.pass(1, this.horned ? this.t({ en: 'Horn used, path clear', id: 'Klakson dipakai, jalur kosong' }) : '');
    if (this.idx === 2) {
      if (s.impact && s.impact.floor === CHASSIS) {
        if (s.impact.speed > 0.6) return this.failLand('hard', s.impact.speed);
        if (s.overTruck() > 0.45) return this.failLand('edge', s.overTruck());
        this.pass(2, `${s.impact.speed.toFixed(2)} m/s · ${(s.overTruck() * 100).toFixed(0)} cm`);
      } else if (s.carrying && s.floor() === 0 && s.overTruck() < 2.9 && s.bottom < 1.6) return this.failLand('edge', s.overTruck());
    }
    const tz = this.idx >= 1 ? TRUCK_Z : -12;
    this.world.setBeacon(CX, tz, this.idx >= 1);
    this.ui.setObjectiveNote(this.note || (this.idx >= 1 ? `${Math.abs(s.loadZ - TRUCK_Z).toFixed(1)} m ${this.t(M.toTruck)}` : ''));
    this.ui.setTimer(this.elapsed);
    this.gauge();
  }

  gauge() {
    const s = this.sim, sway = Math.abs(s.dz), w = s.windSpeed();
    const lights = [0, 1, 2, 3].map((i) => `<i class="${i < s.locks ? 'on' : ''}"></i>`).join('');
    this.ui.setGauge(`<div class="k">${this.t(M.locks)}</div><div class="lights">${lights}</div>
      <div class="big">${s.bottom.toFixed(1)}<small>m · ${this.t(M.hoist).toLowerCase()}</small></div>
      <div class="row"><span>${this.t(M.sway)}</span><b class="${sway > 0.35 ? 'bad' : sway > 0.15 ? 'warn' : 'ok'}">${sway.toFixed(2)} m</b></div>
      <div class="row"><span>${this.t(M.travel)}</span><b>${s.vz.toFixed(1)} m/s</b></div>
      <div class="row"><span>${this.t(M.wind)}</span><b class="${w > 14 ? 'bad' : 'ok'}">${w.toFixed(0)} m/s</b></div>`);
  }

  ghost(lead, opts) {
    this.world.setBeacon(0, 0, false);
    return makeGhost({
      world: this.world, frames: this.rec.clip(lead), apply: (st) => this.apply(st),
      focus: (st) => new THREE.Vector3(CX, 0, -12 + st.gz), radius: 17, height: 11, angle: 0.12, sweep: 0.02,
      tele: () => `${this.sim.bottom.toFixed(1)} m · ${this.sim.locks}/4 · ${Math.abs(this.sim.dz).toFixed(2)} m`,
      ...opts,
    });
  }
  t2(en, id) { return this.ui.lang === 'id' ? id : en; }
  failLocks() {
    const n = this.sim.locks; const lead = 5;
    let dropped = false; const h0 = { v: 0 };
    const r = this.ghost(lead, {
      after: 3.2, impactAfter: 1.0,
      aftermath: (k) => { if (!dropped) { dropped = true; h0.v = this.sim.bottom; this.sim.drop(); } this.sim.fall(k); },
      captions: [
        { t: 0, text: this.t2(`Twist-locks: ${n} of 4 seated. Indicator was not green.`, `Twist-lock: ${n} dari 4 terkunci. Indikator belum hijau.`) },
        { t: lead - 1.2, text: this.t2(`You hoisted anyway. ${4 - n} corner${4 - n > 1 ? 's' : ''} hanging on nothing.`, `Kamu tetap mengangkat. ${4 - n} sudut tidak menahan apa pun.`) },
        { t: lead + 0.4, text: this.t2('The unseated corner lets go. 30 t comes down on the walkway.', 'Sudut yang tidak terkunci lepas. 30 t jatuh ke jalur pejalan.') },
      ],
    });
    this.fail(0, r, () => this.reset(0));
  }
  failPeople() {
    const lead = 5, v = Math.abs(this.sim.vz);
    let dropped = false;
    const r = this.ghost(lead, {
      after: 3.0, impactAfter: 1.1,
      aftermath: (k) => {
        if (!dropped) { dropped = true; this.sim.drop(); } this.sim.fall(k);
        if (k > 1.0) { this.checker.rotation.x = -Math.min(Math.PI / 2, (k - 1) * 4); this.checker.position.y = 0.2; }
      },
      captions: [
        { t: 0, text: this.t2('A checker steps out between the stacks.', 'Seorang checker keluar dari celah tumpukan.') },
        { t: lead - 1.5, text: this.horned ? this.t2(`Horn sounded, but the load kept travelling at ${v.toFixed(1)} m/s.`, `Klakson dibunyikan, tapi beban tetap berjalan ${v.toFixed(1)} m/s.`) : this.t2(`No horn. 30 t travelling over him at ${v.toFixed(1)} m/s.`, `Tanpa klakson. 30 t berjalan di atasnya ${v.toFixed(1)} m/s.`) },
        { t: lead + 0.3, text: this.t2('If anything lets go now (a lock, a rope, the sway), there is no time to step aside.', 'Kalau ada yang lepas sekarang (kunci, tali, ayunan), tidak ada waktu untuk menghindar.') },
      ],
    });
    this.fail(1, r, () => this.reset(1));
  }
  failLand(kind, val) {
    const lead = 4.5; const s = this.sim; let started = false;
    const side = Math.sign(s.loadZ - TRUCK_Z) || 1;
    const r = this.ghost(lead, {
      after: 2.6, impactAfter: kind === 'hard' ? 0.05 : 0.7,
      aftermath: (k) => {
        if (kind === 'hard') { s.box.rotation.x = Math.sin(k * 14) * 0.05 * Math.max(0, 1 - k); s.truck.position.y = -Math.abs(Math.sin(k * 16)) * 0.08 * Math.max(0, 1 - k); return; }
        if (!started) { started = true; s.drop(); s.falling.vz = side * 1.2; }
        s.fall(k); s.box.rotation.x = side * Math.min(0.9, k * 0.9);
      },
      captions: kind === 'hard' ? [
        { t: 0, text: this.t2('Coming down onto the chassis, driver in the cab.', 'Turun ke chassis, pengemudi di kabin.') },
        { t: lead - 0.3, text: this.t2(`Contact at ${val.toFixed(2)} m/s. Limit 0.6.`, `Kontak pada ${val.toFixed(2)} m/s. Batas 0,6.`) },
        { t: lead + 0.5, text: this.t2('30 t shock-loads the trailer. Pins shear, the cab takes the jolt.', '30 t menghentak trailer. Pin patah, kabin menerima hentakan.') },
      ] : [
        { t: 0, text: this.t2('Lowering with the box still swinging.', 'Menurunkan saat box masih berayun.') },
        { t: lead - 0.3, text: this.t2(`${(val * 100).toFixed(0)} cm off the chassis centre.`, `${(val * 100).toFixed(0)} cm dari tengah chassis.`) },
        { t: lead + 0.6, text: this.t2('One side catches the chassis edge. The box tips toward the cab.', 'Satu sisi menyangkut tepi chassis. Box miring ke arah kabin.') },
      ],
      dispose: () => { s.truck.position.y = 0; },
    });
    this.fail(2, r, () => this.reset(2));
  }
  afterCard() { this.snap = true; }
}
