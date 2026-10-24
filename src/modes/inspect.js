import * as THREE from 'three';
import { ModeBase } from './base.js';
import { createReplayFor } from '../replay.js';
import { propBag } from './props.js';
import { makeWorker, makeTruck } from '../world.js';
import { M } from './scenarios.js';

// HSE inspector: the yard is frozen at 07:42. Walk it, look at what is wrong, press F.
// Whatever you miss plays out as its consequence replay before the report.
const TIME = 90;

export class InspectMode extends ModeBase {
  constructor(ctx, role) { super(ctx, role); this.usesPlayer = true; }
  setup() {
    const w = this.world, bag = this.bag = propBag(w.scene);
    w.paused = true;
    const worker = (vest, helmet, x, y, z, yaw) => { const m = bag.add(makeWorker(vest, helmet)); m.position.set(x, y, z); m.rotation.y = yaw; return m; };
    // one actor per checkpoint, in the order of role.hazards
    const noHelmet = worker(0xff8c1a, false, 3.0, 0, 37.6, Math.PI);
    const phone = worker(0x38c172, true, 0.9, 0, 18.4, Math.PI / 2);
    phone.userData.arms[1].rotation.x = -1.9; phone.userData.head.rotation.x = 0.4;
    const ph = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.02), new THREE.MeshStandardMaterial({ color: 0x111111 })); ph.position.set(0, -0.6, 0.06); phone.userData.arms[1].add(ph);
    const under = worker(0xff8c1a, true, 1.6, 0, -11.2, -Math.PI / 2);
    const roof = worker(0xff8c1a, true, 5.1, 5.2, -23.4, -Math.PI / 2);
    const truck = bag.add(makeTruck(0x2e8b57)); truck.position.set(-20, 0, 29.5);
    const shade = worker(0x2a6fb0, true, -21.5, -0.42, 31.1, Math.PI);
    for (const l of shade.userData.legs) l.rotation.x = -1.45;
    this.actors = [noHelmet, phone, under, roof, shade];
    this.decoy = worker(0xff8c1a, true, -9.2, 0, 31.6, Math.PI);
    // invisible hit volumes for the look-and-press check
    this.hits = [...this.actors, this.decoy].map((a, i) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 1.4), new THREE.MeshBasicMaterial({ visible: false }));
      m.position.copy(a.position).add(new THREE.Vector3(0, a === shade ? 0.6 : 1, 0)); m.userData.i = i; bag.add(m); return m;
    });
    this.tags = [];
    this.ray = new THREE.Raycaster(); this.ray.far = 32;
    this.player.setPosition(0, 47, 0); this.player.enabled = true;
    this.left = TIME; this.decoyHit = false; this.missQueue = null;
    this._md = (e) => { if (e.button === 0 && this.player.locked && this.state === 'run') this.look(); };
    addEventListener('mousedown', this._md);
    this.ui.setHint({ en: M.inspectHint.en, id: M.inspectHint.id });
  }
  teardown() { this.bag?.clear(); this.world.paused = false; removeEventListener('mousedown', this._md); }
  syncHud() {
    const open = this.hazards.findIndex((_, i) => !this.resolved?.has(i));
    this.idx = open < 0 ? this.hazards.length : open;
    const masked = this.hazards.map((h, i) => (this.resolved?.has(i) || this.state === 'done' ? h : { ...h, title: { en: `Hazard ${i + 1} · ?`, id: `Bahaya ${i + 1} · ?` } }));
    this.ui.setMission(this.role, masked, this.results, this.idx < this.hazards.length ? this.idx : -1);
  }
  onKey(e) { if (e.code === 'KeyF') this.look(); if (e.code === 'Enter' && this.state === 'run') this.timeUp(); }

  look() {
    this.ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const hit = this.ray.intersectObjects(this.hits, false)[0]; if (!hit) return;
    const i = hit.object.userData.i;
    if (i === this.actors.length) {                  // the decoy
      if (!this.decoyHit) { this.decoyHit = true; this.left -= 5; this.ui.toast({ title: { en: 'Not a hazard', id: 'Bukan bahaya' } }, false, this.t(M.decoy)); }
      return;
    }
    if (this.resolved?.has(i)) return;
    this.tag(this.actors[i]);
    this.pass(i);
  }
  tag(a) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 8, 32), new THREE.MeshBasicMaterial({ color: 0x3ccf7a }));
    m.position.copy(a.position).add(new THREE.Vector3(0, 2.6, 0)); this.bag.add(m); this.tags.push(m);
  }

  tick(dt) {
    this.left -= dt;
    for (const [k, m] of this.tags.entries()) m.rotation.y += dt * 2 + k * 0;
    this.ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const aim = this.ray.intersectObjects(this.hits, false)[0];
    document.getElementById('crosshair').style.transform = aim ? 'scale(2.2)' : '';
    this.ui.setHint(this.player.locked ? { en: M.inspectHint.en, id: M.inspectHint.id } : 'click');
    if (this.left <= 0) return this.timeUp();
    const found = this.resolved?.size ?? 0;
    this.ui.setObjectiveNote(`${found}/${this.hazards.length} ${this.t(M.found)}`);
    this.ui.setTimer(this.elapsed);
    this.ui.setGauge(`<div class="big ${this.left < 15 ? 'over' : ''}">${Math.max(0, Math.ceil(this.left))}<small>s ${this.t(M.timeLeft)}</small></div>
      <div class="row"><span>${this.t(M.found)}</span><b>${found} / ${this.hazards.length}</b></div>
      <div class="meter"><i style="width:${(found / this.hazards.length) * 100}%"></i></div>`);
  }
  timeUp() { if (this.state === 'run') this.finish(); }

  // Before the report, every missed hazard plays out. The actors step aside for the scripted scene.
  finish() {
    if (this.state === 'done' || this.missQueue) return;
    document.getElementById('crosshair').style.transform = '';
    this.missQueue = this.hazards.map((h, i) => i).filter((i) => !this.resolved?.has(i));
    for (const i of this.missQueue) this.results[i] = 'near';
    this.player.enabled = false;
    this.nextMiss();
  }
  nextMiss() {
    for (const a of this.actors) a.visible = true;
    const i = this.missQueue.shift();
    if (i === undefined) { this.missQueue = null; this.state = 'run'; for (const h of this.tags) h.visible = false; this.player.setBodyVisible(true); return super.finish(); }
    const h = this.hazards[i];
    this.actors[i].visible = false;
    if (h.id === 'shade') this.actors[2].visible = this.actors[1].visible = false;
    this.ui.toast(h, false, this.t(M.missedTitle));
    this.startReplay(createReplayFor(h.replay, this.world, this.ui.lang, h.captions), () => this.nextMiss());
  }
}
