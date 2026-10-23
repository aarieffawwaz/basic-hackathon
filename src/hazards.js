import * as THREE from 'three';
import { createReplayFor } from './replay.js';

// Drives a shift for one role: walk → checkpoint prompt → verdict → (replay on wrong) → action step → next.
export class HazardRunner {
  constructor({ camera, world, player, ui, audio }) {
    Object.assign(this, { camera, world, player, ui, audio });
    this.role = null; this.hazards = []; this.state = 'idle';
    addEventListener('keydown', (e) => this.onKey(e));
    addEventListener('keyup', (e) => { if (this.action?.type === 'hold' && e.code === this.action.key) this.holding = false; });
  }
  setRole(role) {
    this.role = role; this.hazards = role.hazards;
    this.player.setPosition(role.spawn.x, role.spawn.z, role.spawn.yaw || 0);
    this.reset();
  }
  reset() {
    this.idx = 0; this.results = []; this.state = 'walk'; this.disabled = new Set(); this.firstTry = true;
    this.replay = null; this.action = null; this.startedAt = performance.now();
    this.syncHud();
  }
  get elapsed() { return (performance.now() - this.startedAt) / 1000; }
  syncHud() {
    const h = this.hazards[this.idx];
    this.ui.setMission(this.role, this.hazards, this.results, this.idx);
    if (h) this.world.setBeacon(h.zone.x, h.zone.z, true); else this.world.setBeacon(0, 0, false);
  }
  begin() { this.state = 'walk'; this.player.enabled = true; this.ui.setHint('walk'); }

  trigger(i = this.idx) {
    this.idx = i;
    const h = this.hazards[this.idx];
    this.state = 'prompt'; this.player.enabled = false; this.player.unlock();
    this.world.paused = true; this.world.setBeacon(0, 0, false);
    this.audio?.click();
    this.ui.showPrompt(h, this.disabled, (c) => this.choose(c));
  }
  choose(choice) {
    const h = this.hazards[this.idx]; const opt = h.options[choice];
    if (this.state !== 'prompt') return;
    if (opt.correct) {
      this.results[this.idx] = this.firstTry ? 'pass' : 'near';
      this.state = 'feedback'; this.audio?.success();
      this.ui.showFeedback(h, true, () => this.startAction(h));
      return;
    }
    this.firstTry = false; this.disabled.add(choice); this.ui.hideCard();
    this.startReplay(opt.replay, h, opt.captions);
  }
  startReplay(id, h, captions) {
    this.state = 'replay';
    this.replay = createReplayFor(id, this.world, this.ui.lang, captions);
    this.replayT = 0; this.flashed = false;
    if (this.replay.hideTrucks) this.world.setTrucksVisible(false);
    this.ui.replayBanner(true, this.replay.captions[0]?.text ?? '');
    this.ui.setHudVisible(false);
    this.afterReplay = () => {
      this.state = 'feedback';
      this.ui.showFeedback(h, false, () => { this.state = 'prompt'; this.ui.showPrompt(h, this.disabled, (c) => this.choose(c)); });
    };
  }
  endReplay() {
    this.replay.dispose(); this.world.setTrucksVisible(true); this.replay = null;
    this.ui.replayBanner(false); this.ui.setHudVisible(true); this.player.applyCamera();
    this.afterReplay();
  }

  // Action step: a physical thing to do after the right call (hold a key, or hit a timing window).
  startAction(h) {
    this.ui.hideCard();
    if (!h.action) return this.advance();
    this.state = 'action'; this.action = h.action; this.progress = 0; this.holding = false; this.timingT = 0; this.timingDone = false;
    this.world.paused = false;
    this.ui.showAction(h.action);
    this.player.lock();
  }
  onKey(e) {
    if (this.state === 'prompt' && ['Digit1', 'Digit2', 'Digit3', 'KeyA', 'KeyB', 'KeyC'].includes(e.code)) {
      const i = { Digit1: 0, Digit2: 1, Digit3: 2, KeyA: 0, KeyB: 1, KeyC: 2 }[e.code];
      if (!this.disabled.has(i)) this.choose(i);
      return;
    }
    if (this.state !== 'action' || !this.action) return;
    if (this.action.type === 'hold' && e.code === this.action.key) this.holding = true;
    if (this.action.type === 'timing' && e.code === this.action.key && !this.timingDone) {
      const [a, b] = this.action.window; const k = this.timingT % 1;
      if (k >= a && k <= b) this.finishAction(true);
      else { this.timingDone = true; this.ui.actionMiss(); setTimeout(() => { this.timingDone = false; }, 900); }
    }
  }
  finishAction(ok) {
    this.audio?.success();
    this.ui.actionDone();
    this.action = null;
    setTimeout(() => this.advance(), 700);
  }
  advance() {
    this.ui.hideCard(); this.ui.hideAction();
    this.idx += 1; this.disabled = new Set(); this.firstTry = true; this.world.paused = false;
    if (this.idx >= this.hazards.length) {
      this.state = 'done'; this.player.enabled = false; this.player.unlock();
      this.ui.showEnd({ role: this.role, hazards: this.hazards, results: this.results, seconds: this.elapsed }, () => this.restart(), () => this.ui.showRoles());
      return;
    }
    this.state = 'walk'; this.syncHud(); this.player.enabled = true; this.player.lock(); this.ui.setHint('walk');
  }
  restart() { this.ui.hideEnd(); this.setRole(this.role); this.world.paused = false; this.begin(); this.player.lock(); }

  update(dt) {
    if (this.state === 'walk') {
      const h = this.hazards[this.idx];
      const d = Math.hypot(this.player.pos.x - h.zone.x, this.player.pos.z - h.zone.z);
      this.ui.setDistance(d, this.elapsed);
      if (d < h.zone.r) this.trigger();
      this.ui.setHint(this.player.locked ? 'walk' : 'click');
      return;
    }
    if (this.state === 'action' && this.action) {
      if (this.action.type === 'hold') {
        this.progress = Math.max(0, this.progress + (this.holding ? dt / this.action.seconds : -dt * 0.6));
        this.ui.actionProgress(this.progress);
        if (this.progress >= 1) this.finishAction(true);
      } else {
        this.timingT += dt * 0.45;
        this.ui.actionTiming(this.timingT % 1, this.action.window);
      }
      return;
    }
    if (this.state === 'replay' && this.replay) {
      const r = this.replay; this.replayT += dt * 0.55; const t = this.replayT;
      r.update(t); const c = r.cam(t); this.camera.position.copy(c.pos); this.camera.lookAt(c.look);
      const cap = [...r.captions].reverse().find((x) => t >= x.t); if (cap) this.ui.replayBanner(true, cap.text);
      if (!this.flashed && t >= r.impactAt) { this.flashed = true; this.ui.flash(); this.audio?.impact(); }
      if (t >= r.dur) this.endReplay();
    }
  }
}
