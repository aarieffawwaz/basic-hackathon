import * as THREE from 'three';
import { createReplay } from './replay.js';

// Drives the shift: detect checkpoint entry → prompt → verdict → (replay on wrong) → next.
export class HazardRunner {
  constructor({ camera, world, player, ui, hazards }) {
    Object.assign(this, { camera, world, player, ui, hazards });
    this.reset();
  }
  reset() {
    this.idx = 0;
    this.results = [];          // 'pass' | 'near' per hazard
    this.state = 'walk';        // walk | prompt | replay | feedback | done
    this.disabled = new Set();
    this.firstTry = true;
    this.replay = null;
    this.startedAt = performance.now();
    this.syncHud();
  }
  syncHud() {
    const h = this.hazards[this.idx];
    this.ui.setProgress(this.results, this.hazards.length, this.idx);
    if (h) { this.ui.setObjective(h.objective); this.world.setBeacon(h.zone.x, h.zone.z, true); }
    else this.world.setBeacon(0, 0, false);
  }
  begin() { this.player.enabled = true; this.ui.setHint('walk'); }

  trigger(i = this.idx) {
    this.idx = i;
    const h = this.hazards[this.idx];
    this.state = 'prompt';
    this.player.enabled = false;
    this.player.unlock();
    this.world.paused = true;
    this.world.setBeacon(0, 0, false);
    this.ui.showPrompt(h, this.disabled, (choice) => this.choose(choice));
  }

  choose(choice) {
    const h = this.hazards[this.idx];
    const opt = h.options[choice];
    if (opt.correct) {
      this.results[this.idx] = this.firstTry ? 'pass' : 'near';
      this.state = 'feedback';
      this.ui.showFeedback(h, true, () => this.advance());
      return;
    }
    this.firstTry = false;
    this.disabled.add(choice);
    this.ui.hideCard();
    this.startReplay(opt.replay, h);
  }

  startReplay(id, h) {
    this.state = 'replay';
    this.replay = createReplay(id, this.world, this.ui.lang);
    this.replayT = 0;
    this.flashed = false;
    if (this.replay.hideTrucks) this.world.setTrucksVisible(false);
    this.ui.replayBanner(true, this.replay.captions[0]?.text ?? '');
    this.ui.setHint('walk');
    document.getElementById('hud').classList.add('hidden');
    this.afterReplay = () => {
      this.state = 'feedback';
      this.ui.showFeedback(h, false, () => {
        this.state = 'prompt';
        this.ui.showPrompt(h, this.disabled, (c) => this.choose(c));
      });
    };
  }

  endReplay() {
    this.replay.dispose();
    this.world.setTrucksVisible(true);
    this.replay = null;
    this.ui.replayBanner(false);
    document.getElementById('hud').classList.remove('hidden');
    this.player.applyCamera();
    this.afterReplay();
  }

  advance() {
    this.ui.hideCard();
    this.idx += 1;
    this.disabled = new Set();
    this.firstTry = true;
    this.world.paused = false;
    if (this.idx >= this.hazards.length) {
      this.state = 'done';
      this.ui.showEnd({ hazards: this.hazards, results: this.results, seconds: (performance.now() - this.startedAt) / 1000 }, () => this.restart());
      return;
    }
    this.state = 'walk';
    this.syncHud();
    this.player.enabled = true;
    this.player.lock();
    this.ui.setHint('walk');
  }

  restart() {
    this.ui.hideEnd();
    this.player.setPosition(0, 48, 0);
    this.reset();
    this.world.paused = false;
    this.begin();
    this.player.lock();
  }

  update(dt) {
    if (this.state === 'walk') {
      const h = this.hazards[this.idx];
      const d = Math.hypot(this.player.pos.x - h.zone.x, this.player.pos.z - h.zone.z);
      if (d < h.zone.r) this.trigger();
      this.ui.setHint(this.player.locked ? 'walk' : 'click');
      return;
    }
    if (this.state === 'replay' && this.replay) {
      const r = this.replay;
      this.replayT += dt * 0.55;                       // slow motion
      const t = this.replayT;
      r.update(t);
      const c = r.cam(t);
      this.camera.position.copy(c.pos);
      this.camera.lookAt(c.look);
      const cap = [...r.captions].reverse().find((x) => t >= x.t);
      if (cap) this.ui.replayBanner(true, cap.text);
      if (!this.flashed && t >= r.impactAt) { this.flashed = true; this.ui.flash(); }
      if (t >= r.dur) this.endReplay();
    }
  }
}
