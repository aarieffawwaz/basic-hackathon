import * as THREE from 'three';
import { ModeBase } from './base.js';
import { Recorder, makeGhost } from './ghost.js';
import { CraneSim, CX, TRUCK_Z, CHASSIS } from './cranesim.js';
import { propBag, ring, groundLine } from './props.js';
import { makeWorker, animateWorker } from '../world.js';
import { M } from './scenarios.js';

// Signaller (banksman). You are on foot; an AI operator moves the RTG only on your hand
// signals, with a short reaction delay, and stops the moment you stop signalling.
const BOX = { x: -9, z: -30, r: 1.5 };           // signaller box: seen from the cab, out of the path
const GAP_Z = -19.05, BOX_HALF = 2.6;
const DRIVER = { at: [CX + 0.4, -22.0], safe: [-9.4, -27.4] };
const LAG = 0.35;                                   // operator reaction to a new signal

export class SignalMode extends ModeBase {
  constructor(ctx, role) { super(ctx, role); this.usesPlayer = true; }
  setup() {
    const w = this.world;
    this.sim = new CraneSim(w);
    this.bag = propBag(w.scene);
    this.boxRing = ring(this.bag, BOX.x, BOX.z, BOX.r, 0x3ccf7a);
    groundLine(this.bag, BOX.x, BOX.z, BOX.r * 1.9, BOX.r * 1.9, 0x3ccf7a, 0.25);
    groundLine(this.bag, CX, -18, 7.6, 16, 0xff3b3b, 0.18);           // load path
    this.intruder = this.bag.add(makeWorker(0x2a6fb0));
    this.driver = this.bag.add(makeWorker(0xf5c518));
    this.truckCol = { minX: CX + 1.5 - 4.9, maxX: CX + 1.5 + 5.1, minZ: TRUCK_Z - 1.3, maxZ: TRUCK_Z + 1.3 };
    w.colliders.push(this.truckCol);
    this.rec = new Recorder(() => this.capture(), 10);
    this.ui.setHint({ en: M.signalHint.en, id: M.signalHint.id });
    this.time = 0;
    this.reset(0);
  }
  teardown() {
    this.sim?.dispose(); this.bag?.clear();
    const i = this.world.colliders.indexOf(this.truckCol); if (i >= 0) this.world.colliders.splice(i, 1);
    this.player.setBodyVisible(true);
  }
  jumpTo(i) { for (let k = 0; k < i; k++) { (this.resolved ||= new Set()).add(k); this.results[k] = 'pass'; } this.syncHud(); this.reset(i); }

  reset(i) {
    this.sim.reset({ gz: i >= 2 ? TRUCK_Z + 12 - 0.6 : 0, h: i >= 2 ? -1 : 0 });
    this.it = { state: i >= 2 ? 'gone' : 'wait', x: i >= 2 ? -12.6 : 5.0, z: GAP_Z };
    this.dv = { state: 'cab', x: DRIVER.at[0], z: DRIVER.at[1] };
    this.sig = null; this.applied = null; this.pending = null; this.estop = false; this.cantSeeT = 0;
    if (i === 0) this.player.setPosition(-8, -2, 0); else this.player.setPosition(BOX.x, BOX.z + 0.3, 0);
    this.player.enabled = true; this.rec.reset();
    for (const w of [this.intruder, this.driver, this.player.body]) if (w) { w.rotation.x = 0; w.position.y = 0; }
    this.place();
  }
  place() {
    this.intruder.position.set(this.it.x, 0, this.it.z); this.intruder.rotation.y = -Math.PI / 2;
    this.driver.position.set(this.dv.x, 0, this.dv.z); this.driver.rotation.y = this.dv.state === 'cab' ? Math.PI : Math.atan2(DRIVER.safe[0] - this.dv.x, DRIVER.safe[1] - this.dv.z);
  }
  capture() { return { ...this.sim.capture(), px: this.player.pos.x, pz: this.player.pos.z, pyaw: this.player.yaw, ix: this.it.x, is: this.it.state, dx: this.dv.x, dz: this.dv.z, ds: this.dv.state }; }
  apply(s) {
    this.sim.restore(s);
    this.it.x = s.ix; this.it.state = s.is; this.dv.x = s.dx; this.dv.z = s.dz; this.dv.state = s.ds; this.place();
    const b = this.player.body; if (b) { b.visible = true; b.position.set(s.px, 0, s.pz); b.rotation.y = s.pyaw + Math.PI; animateWorker(b, performance.now() / 1000, 0.1); }
  }

  inBox() { return Math.hypot(this.player.pos.x - BOX.x, this.player.pos.z - BOX.z) < BOX.r; }
  inPath() { const p = this.player.pos; return Math.abs(p.x - CX) < BOX_HALF && p.z < -9 && p.z > -27; }
  signal() {
    const k = this.keys;
    if (k.Space) return 'stop';
    if (k.Digit1) return 'travel'; if (k.Digit4) return 'away'; if (k.Digit2) return 'lower'; if (k.Digit3) return 'raise';
    return null;
  }
  onKey(e) {
    if (e.code === 'KeyF' && this.dv.state === 'cab' && Math.hypot(this.player.pos.x - this.dv.x, this.player.pos.z - this.dv.z) < 25) { this.dv.state = 'leaving'; this.audio?.click(); }
  }

  // The operator: obeys what he can see, after a short delay; stops immediately when signals stop.
  operator(dt) {
    const s = this.signal(), seen = this.inBox() || this.inPath();
    if (s && !seen) { this.cantSeeT = 1.5; }
    const want = seen ? s : null;
    if (want !== this.sig) { this.sig = want; this.pending = want && want !== 'stop' ? { cmd: want, at: this.time + LAG } : null; this.applied = want === 'stop' ? 'stop' : null; }
    if (this.pending && this.time >= this.pending.at) { this.applied = this.pending.cmd; this.pending = null; }
    const a = this.applied, c = this.sim.cmd;
    c.estop = a === 'stop'; c.stopDecel = 1.1;          // a signaller's stop is braked harder than a coast
    c.travel = a === 'travel' ? -1 : a === 'away' ? 1 : 0;
    // the operator creeps the last 1.5 m himself
    c.hoist = a === 'lower' ? (this.sim.bottom - this.sim.floor() < 1.5 ? -0.35 : -1) : a === 'raise' ? 1 : 0;
    if (a && a !== 'stop' && this.inBox() && this.idx === 0) this.pass(0);
    this.cantSeeT = Math.max(0, this.cantSeeT - dt);
  }
  people(dt) {
    const it = this.it, s = this.sim;
    if (it.state === 'wait' && this.idx >= 1 && s.loadZ < -13.5) it.state = 'cross';
    if (it.state === 'cross') { it.x -= 1.1 * dt; animateWorker(this.intruder, this.time, 1); if (it.x < -12.6) { it.state = 'gone'; if (this.idx === 1) this.pass(1); } }
    else animateWorker(this.intruder, this.time, 0.1);
    const d = this.dv;
    if (d.state === 'leaving') {
      const dx = DRIVER.safe[0] - d.x, dz = DRIVER.safe[1] - d.z, l = Math.hypot(dx, dz);
      if (l < 0.1) d.state = 'safe'; else { d.x += (dx / l) * 1.4 * dt; d.z += (dz / l) * 1.4 * dt; }
      animateWorker(this.driver, this.time, 1);
    } else animateWorker(this.driver, this.time, 0.1);
    this.place();
  }

  tick(dt) {
    this.time += dt;
    this.operator(dt); this.sim.update(dt); this.people(dt);
    this.rec.tick(dt);
    const s = this.sim, p = this.player.pos;
    this.boxRing.material.opacity = 0.6 + Math.sin(this.time * 4) * 0.3;
    // load over or onto the signaller
    if (this.inPath() && Math.abs(s.loadZ - p.z) < 1.22 + 0.6 && s.bottom > 1.9 && (Math.abs(s.vz) > 0.05 || s.vh < -0.05)) return this.failStand();
    if (this.it.state === 'cross' && Math.abs(this.it.x - CX) < BOX_HALF && Math.abs(s.loadZ - this.it.z) < 1.22 + 0.6) return this.failIntruder();
    if (this.idx === 2 || (this.idx === 1 && this.it.state === 'gone')) {
      if (this.dv.state === 'cab' && s.vh < -0.05 && s.overTruck() < 2.5 && s.bottom < 4.2) return this.failDriver();
      if (s.impact && s.impact.floor === CHASSIS) { if (s.overTruck() > 0.45) return this.failDriver('edge'); if (this.idx === 2) this.pass(2); }
    }
    const target = this.idx === 0 ? [BOX.x, BOX.z] : [CX, TRUCK_Z];
    this.world.setBeacon(target[0], target[1], this.idx < 3);
    this.ui.setObjectiveNote(this.cantSeeT > 0 ? this.t(M.cantSee) : this.idx >= 1 ? `${Math.abs(s.loadZ - TRUCK_Z).toFixed(1)} m ${this.t(M.toTruck)}` : '');
    this.ui.setTimer(this.elapsed); this.ui.setHint(this.player.locked ? { en: M.signalHint.en, id: M.signalHint.id } : 'click');
    this.gauge();
  }
  gauge() {
    const s = this.sim, a = this.applied;
    const label = { travel: M.sigTravel, away: M.sigAway, lower: M.sigLower, raise: M.sigRaise, stop: M.sigStop }[this.sig] || M.sigNone;
    const dSafe = this.dv.state !== 'cab';
    this.ui.setGauge(`<div class="k">${this.t(M.signal)}</div><div class="sig" style="color:${this.sig === 'stop' ? 'var(--bad)' : a ? 'var(--ok)' : 'var(--ink)'}">${this.t(label)}</div>
      <div class="row"><span>${this.t(this.inBox() ? M.inBox : M.outBox)}</span><b class="${this.inBox() ? 'ok' : 'bad'}">${this.inBox() ? '✓' : '✕'}</b></div>
      <div class="big">${s.bottom.toFixed(1)}<small>m · ${this.t(M.hoist).toLowerCase()}</small></div>
      <div class="row"><span>${this.t(M.sway)}</span><b class="${Math.abs(s.dz) > 0.35 ? 'bad' : 'ok'}">${Math.abs(s.dz).toFixed(2)} m</b></div>
      <div class="row"><span>${this.t(M.driverSafe)}</span><b class="${dSafe ? 'ok' : 'bad'}">${this.t(dSafe ? M.safe : M.atRisk)}</b></div>`);
  }

  ghost(lead, focusPlayer, opts) {
    this.world.setBeacon(0, 0, false); this.player.enabled = false;
    return makeGhost({
      world: this.world, frames: this.rec.clip(lead), apply: (st) => this.apply(st),
      focus: (st) => (focusPlayer ? new THREE.Vector3(st.px, 0, st.pz) : new THREE.Vector3(CX, 0, -12 + st.gz)), radius: 17, height: 11, angle: 0.12, sweep: 0.02,
      tele: () => `${this.sim.bottom.toFixed(1)} m · ${Math.abs(this.sim.vz).toFixed(1)} m/s`,
      dispose: () => this.player.setBodyVisible(true),
      ...opts,
    });
  }
  t2(en, id) { return this.ui.lang === 'id' ? id : en; }
  // Drop the box; slide = sideways speed toward the person (m/s), since a tipping box does not fall straight.
  crush(target, slide) { let dropped = false; return (k) => { if (!dropped) { dropped = true; this.sim.drop(); if (slide) this.sim.falling.vz = slide; } this.sim.fall(k); if (k > 0.9 && target) { target.rotation.x = -Math.min(Math.PI / 2, (k - 0.9) * 4); target.position.y = 0.2; } }; }
  failStand() {
    const lead = 5;
    const r = this.ghost(lead, true, {
      after: 2.8, impactAfter: 1.0, aftermath: this.crush(this.player.body),
      captions: [
        { t: 0, text: this.t2('You signalled from inside the load path, to see the truck better.', 'Kamu memberi isyarat dari dalam jalur beban, supaya truk lebih terlihat.') },
        { t: lead - 1.2, text: this.t2('The operator did exactly what you asked: brought 30 t toward you.', 'Operator melakukan persis yang kamu minta: membawa 30 t ke arahmu.') },
        { t: lead + 0.4, text: this.t2('The person with stop authority was standing where the load would fall.', 'Orang yang berwenang menghentikan berdiri di tempat beban akan jatuh.') },
      ],
    });
    this.fail(0, r, () => this.reset(0));
  }
  failIntruder() {
    const lead = 5, v = Math.abs(this.sim.vz), sig = this.sig;
    const r = this.ghost(lead, false, {
      after: 2.8, impactAfter: 1.0, aftermath: this.crush(this.intruder),
      captions: [
        { t: 0, text: this.t2('A checker cuts through the gap between the stacks.', 'Seorang checker memotong lewat celah tumpukan.') },
        { t: lead - 1.4, text: sig === 'travel' ? this.t2(`You were still signalling TRAVEL. Load at ${v.toFixed(1)} m/s.`, `Kamu masih memberi isyarat JALAN. Beban ${v.toFixed(1)} m/s.`) : this.t2(`Signal released too late: the gantry was still rolling at ${v.toFixed(1)} m/s.`, `Isyarat dilepas terlambat: gantry masih bergerak ${v.toFixed(1)} m/s.`) },
        { t: lead + 0.4, text: this.t2('The operator cannot see the corridor. You were his eyes.', 'Operator tidak bisa melihat koridor. Kamulah matanya.') },
      ],
    });
    this.fail(1, r, () => this.reset(1));
  }
  failDriver(kind) {
    const lead = 4.5;
    const r = this.ghost(lead, false, {
      after: 2.8, impactAfter: 1.0, aftermath: this.crush(kind === 'edge' ? null : this.driver, Math.sign(this.dv.z - this.sim.loadZ) * 1.8),
      captions: kind === 'edge' ? [
        { t: 0, text: this.t2('Lowering onto the chassis.', 'Menurunkan ke chassis.') },
        { t: lead - 0.3, text: this.t2(`${(this.sim.overTruck() * 100).toFixed(0)} cm off centre. The box lands on the chassis edge.`, `${(this.sim.overTruck() * 100).toFixed(0)} cm dari tengah. Box mendarat di tepi chassis.`) },
        { t: lead + 0.5, text: this.t2('Stop high, square it up, then call it down slowly.', 'Berhenti di atas, luruskan, baru turunkan pelan.') },
      ] : [
        { t: 0, text: this.t2('The driver is out of the cab, standing at the chassis to watch the box come down.', 'Pengemudi turun dari kabin, berdiri di samping chassis menonton box turun.') },
        { t: lead - 1.2, text: this.t2('You called LOWER with him still in the landing zone.', 'Kamu memberi isyarat TURUN saat dia masih di zona pendaratan.') },
        { t: lead + 0.4, text: this.t2('A swinging corner, a slipped lock: he is between 30 t and the trailer.', 'Sudut yang berayun, kunci yang tergelincir: dia di antara 30 t dan trailer.') },
      ],
    });
    this.fail(2, r, () => this.reset(2));
  }
  afterCard() { this.player.lock(); }
}
