import * as THREE from 'three';
import { makeContainer, makeTruck } from '../world.js';

// RTG physics shared by the crane-operator and signaller modes.
// The gantry travels along z on its tyres, the hoist moves the spreader, and the load swings
// as a pendulum (gantry acceleration + wind). For these modes the RTG is moved over the
// corridor centre (x = -3.5) and carries a 20-ft box so it can land on a tractor chassis.
const G = 9.81;
export const CX = -3.5;                 // corridor centre, where the RTG works in these modes
export const BOX0 = 5.15;               // box bottom when hoist offset h = 0
export const TRUCK_Z = -24, CHASSIS = 1.02;
const TROLLEY_Y = 12.55, SPREADER_TOP = 8.25;

export class CraneSim {
  constructor(world) {
    this.world = world;
    const { rtg, hang, hangBox } = world;
    // remember what we change so teardown restores the yard exactly
    this.saved = { rtgX: rtg.position.x, rtgZ: rtg.position.z, hang: hang.position.clone(), hangRot: hang.rotation.clone(), boxVisible: hangBox.visible, kids: hang.children.map((c) => ({ c, p: c.position.clone(), s: c.scale.clone(), r: c.rotation.clone() })) };
    world.craneManual = true;
    rtg.position.x = CX; hangBox.visible = false;
    this.cables = hang.children.slice(0, 4); this.cableZ = this.cables.map((c) => c.position.z);
    for (const c of this.cables) c.position.x = Math.sign(c.position.x) * 2.8;
    const beam = hang.children[4]; beam.scale.x = 0.5;
    for (const e of hang.children.slice(5, 7)) e.position.x = Math.sign(e.position.x) * 2.95;
    // the 20-ft box: hang-local while attached, re-parented to the scene when it falls or rests
    this.box = makeContainer(6.06, 0xb03a2e, 0, BOX0, -12, hang);
    this.truck = makeTruck(0x1b2340);
    const tc = this.truck.children.find((c) => c.isGroup && Math.abs(c.position.x + 1.5) < 0.01); if (tc) this.truck.remove(tc);
    this.truck.position.set(CX + 1.5, 0, TRUCK_Z); world.scene.add(this.truck);
    this.wind = { base: 7, gust: 0 }; this.t = 0;
    this.reset();
  }
  dispose() {
    const { rtg, hang, hangBox } = this.world, s = this.saved;
    hang.remove(this.box); this.world.scene.remove(this.box, this.truck);
    rtg.position.x = s.rtgX; rtg.position.z = s.rtgZ; hang.position.copy(s.hang); hang.rotation.copy(s.hangRot); hangBox.visible = s.boxVisible;
    for (const k of s.kids) { k.c.position.copy(k.p); k.c.scale.copy(k.s); k.c.rotation.copy(k.r); }
    this.world.craneManual = false;
  }
  // grounded: box resting on the ground under the spreader with locks open. Otherwise hanging, locked.
  reset({ grounded = false, gz = 0, h = 0 } = {}) {
    this.reattach(); this.rest = null; this.box.rotation.set(0, 0, 0);
    this.gz = gz; this.vz = 0; this.az = 0;
    this.th = 0; this.om = 0;
    this.lockT = grounded ? 0 : 1.2; this.lockFrozen = !grounded; this.engaging = false;
    this.attached = true; this.falling = null;
    this.h = grounded ? -BOX0 : h; this.vh = 0; this.landedAt = null;
    this.cmd = { travel: 0, hoist: 0, estop: false };
    this.apply();
  }
  get locks() { return Math.min(4, Math.floor(this.lockT / 0.3)); }
  get loadZ() { return -12 + this.gz + this.dz; }
  get dz() { return this.L * Math.sin(this.th); }
  get L() { return TROLLEY_Y - (BOX0 + this.h + 1.3); }
  get bottom() { return BOX0 + this.h; }
  // What the box would rest on right now: the chassis when it is over the truck, else the ground.
  floor() { return Math.abs(this.loadZ - TRUCK_Z) < 1.3 ? CHASSIS : 0; }
  overTruck() { return Math.abs(this.loadZ - TRUCK_Z); }
  windSpeed() { return this.wind.base + this.wind.gust; }

  get carrying() { return this.attached && this.locks > 0; }
  // Spreader sits on the box and the box sits on something: the only time locks may turn.
  seated() {
    if (this.carrying) return this.bottom <= this.floor() + 0.02;
    return !!this.rest && Math.abs(this.rest.z - (-12 + this.gz)) < 0.5 && this.h <= this.rest.y - BOX0 + 0.05;
  }
  toggleLocks() {
    if (!this.seated()) return 'interlock';
    if (this.locks > 0 || this.engaging) { this.lockT = 0; this.engaging = false; this.lockFrozen = false; return 'open'; }
    this.engaging = true; this.lockFrozen = false; return 'engage';
  }

  update(dt) {
    this.t += dt;
    // wind: slow base drift plus gusts
    this.wind.gust = 2.2 * Math.sin(this.t * 0.31) + 1.4 * Math.sin(this.t * 0.83 + 1.7) + (Math.sin(this.t * 0.13) > 0.85 ? 3.5 : 0);
    if (this.engaging && !this.lockFrozen) { this.lockT = Math.min(1.2, this.lockT + dt); if (this.lockT >= 1.2) this.engaging = false; }
    // gantry
    const vzT = this.cmd.travel * 1.1, prev = this.vz;
    this.vz += Math.sign(vzT - this.vz) * Math.min(Math.abs(vzT - this.vz), (this.cmd.estop ? 2.5 : this.cmd.travel === 0 ? this.cmd.stopDecel ?? 0.55 : 0.55) * dt);
    this.gz = Math.max(-14, Math.min(0, this.gz + this.vz * dt));
    if (this.gz === -14 || this.gz === 0) this.vz = 0;
    this.az = (this.vz - prev) / Math.max(dt, 1e-4);
    // hoist
    const vhT = this.cmd.estop ? 0 : this.cmd.hoist * 0.8;          // cmd.hoist may be fractional (creep)
    this.vh += Math.sign(vhT - this.vh) * Math.min(Math.abs(vhT - this.vh), 1.4 * dt);
    const carrying = this.carrying, fl = this.floor();
    // lowest the spreader can go: the box on its support, or an empty spreader on the resting box
    let support = fl;
    if (!carrying && this.rest && Math.abs(this.rest.z - (-12 + this.gz)) < 1.3) support = this.rest.y;
    const minH = support - BOX0;
    let nh = this.h + this.vh * dt; this.impact = null;
    if (nh < minH) { if (carrying && this.h > minH + 1e-6) this.impact = { speed: -this.vh, floor: fl, at: this.loadZ }; nh = minH; this.vh = 0; }
    this.h = Math.min(3.2, nh);
    if (carrying && this.bottom > fl + 0.03) this.lockFrozen = true;
    // pendulum: only while hanging free
    if (this.seated() || this.h <= minH + 0.001) { this.th *= Math.max(0, 1 - dt * 6); this.om = 0; }
    else {
      const L = Math.max(2.5, this.L);
      const windAcc = 0.0018 * this.windSpeed() ** 2 * (Math.sin(this.t * 0.9) + 0.6 * Math.sin(this.t * 2.1 + 1));
      const al = -(G / L) * Math.sin(this.th) - (this.az / L) * Math.cos(this.th) - 0.35 * this.om + windAcc / L;
      this.om += al * dt; this.th += this.om * dt;
    }
    this.apply();
  }

  apply() {
    const { rtg, hang } = this.world;
    rtg.position.z = this.gz;
    const dz = this.dz;
    hang.position.set(0, this.h, dz);
    const dy = TROLLEY_Y - this.h - SPREADER_TOP, dzc = -dz, len = Math.hypot(dy, dzc);
    this.cables.forEach((c, i) => { c.position.y = SPREADER_TOP + dy / 2; c.position.z = this.cableZ[i] + dzc / 2; c.scale.y = len / 4.6; c.rotation.x = Math.atan2(dzc, dy); });
    if (this.falling) return;
    // a box that is not locked stays where it was put
    if (!this.carrying) {
      const rest = this.rest ||= { y: this.bottom, z: this.loadZ };
      this.box.position.set(0, rest.y - this.h, rest.z - this.gz - dz);
    } else { this.rest = null; this.box.position.set(0, BOX0, -12); }
  }

  // Let go of the box at its current place; it falls under gravity in fall(k).
  drop() {
    const p = new THREE.Vector3(); this.box.getWorldPosition(p);
    this.world.hang.remove(this.box); this.box.position.copy(p); this.world.scene.add(this.box);
    this.falling = { y0: p.y, z0: p.z, x0: p.x, vz: this.vz + this.om * this.L };
  }
  fall(k) {
    const f = this.falling; if (!f) return;
    const y = Math.max(0, f.y0 - 0.5 * G * k * k);
    this.box.position.set(f.x0, y, f.z0 + f.vz * Math.min(k, 1));
    this.box.rotation.x = y > 0 ? Math.min(0.5, k * 0.5) : 0.18; this.box.rotation.z = y > 0 ? k * 0.15 : 0.05;
  }
  // Put a fallen box back on the spreader.
  reattach() {
    if (!this.falling) return;
    this.world.scene.remove(this.box); this.box.rotation.set(0, 0, 0); this.world.hang.add(this.box);
    this.falling = null; this.rest = null;
  }
  capture() { return { gz: this.gz, h: this.h, th: this.th, lockT: this.lockT, rest: this.rest ? { ...this.rest } : null, vz: this.vz, vh: this.vh }; }
  restore(s) { this.gz = s.gz; this.h = s.h; this.th = s.th; this.lockT = s.lockT; this.rest = s.rest ? { ...s.rest } : null; this.vz = s.vz; this.vh = s.vh; this.apply(); }
}
