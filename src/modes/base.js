import { STRINGS } from '../scenario.js';

// Shared shell for the hands-on modes. A mode supplies setup/teardown/tick and its checkpoints
// (role.hazards: { id, objective, title, why, rule }); this class keeps score, plays replays,
// shows the verdict card and the shift report. Checkpoints may resolve in any order; the
// mission panel always points at the first one still open.
export class ModeBase {
  constructor(ctx, role) {
    Object.assign(this, ctx);
    this.role = role; this.hazards = role.hazards;
    this.usesPlayer = false; this.state = 'idle'; this.results = []; this.idx = 0;
    this.keys = {};
    this._kd = (e) => {
      if (e.repeat && this.keys[e.code]) return;
      this.keys[e.code] = true;
      if (this.state === 'prompt' && this._prompt) {
        const i = { Digit1: 0, Digit2: 1, Digit3: 2, KeyA: 0, KeyB: 1, KeyC: 2 }[e.code];
        if (i !== undefined && !this._prompt.disabled.has(i)) this._choose(i);
        return;
      }
      if (this.state === 'replay' && e.code === 'Enter') { this.replayT = this.replay.dur; return; }
      this.onKey?.(e);
    };
    this._ku = (e) => { this.keys[e.code] = false; this.onKeyUp?.(e); };
    addEventListener('keydown', this._kd); addEventListener('keyup', this._ku);
  }
  key(...codes) { return codes.some((c) => this.keys[c]); }
  t(o) { return this.ui.t(o); }
  get elapsed() { return (performance.now() - this.startedAt) / 1000; }

  begin() {
    this.results = []; this.idx = 0; this.startedAt = performance.now(); this.state = 'run';
    this.world.setBeacon(0, 0, false);
    this.setup(); this.syncHud();
  }
  restart() { this.ui.hideEnd(); this.ui.hideCard(); this.teardown(); this.begin(); }
  dispose() {
    removeEventListener('keydown', this._kd); removeEventListener('keyup', this._ku);
    if (this.replay) { this.replay.dispose(); this.replay = null; this.ui.replayBanner(false); this.ui.setHudVisible(true); }
    this.ui.hideCard(); this.ui.hideAction(); this.ui.setGauge(''); this.teardown();
  }
  syncHud() {
    const open = this.hazards.findIndex((_, i) => this.results[i] !== 'pass' && !this.resolved?.has(i));
    this.idx = open < 0 ? this.hazards.length : open;
    this.ui.setMission(this.role, this.hazards, this.results, this.idx);
  }

  // A checkpoint passed. A checkpoint that already needed a replay stays a near miss.
  pass(i, note) {
    (this.resolved ||= new Set()).add(i);
    if (this.results[i] !== 'near') this.results[i] = 'pass';
    this.audio?.success(); this.ui.toast(this.hazards[i], true, note);
    this.syncHud();
    if (this.resolved.size >= this.hazards.length) setTimeout(() => this.finish(), 1400);
  }

  // A checkpoint failed: play the replay, then the rule, then `onRetry` puts the player back.
  fail(i, replay, onRetry, why) {
    this.results[i] = 'near'; this.syncHud();
    this.startReplay(replay, () => {
      const h = this.hazards[i];
      this.ui.showFeedback(why ? { ...h, why } : h, false, () => { this.ui.hideCard(); onRetry?.(); this.state = 'run'; this.afterCard?.(); }, this.t(STRINGS.tryAgain));
    });
  }
  startReplay(replay, after) {
    this.state = 'replay'; this.replay = replay; this.replayT = 0; this.flashed = false; this._after = after;
    this.ui.hideAction(); this.player.unlock();
    if (replay.hideTrucks) this.world.setTrucksVisible(false);
    this.ui.replayBanner(true, replay.captions[0]?.text ?? '', replay.own);
    this.ui.setHudVisible(false); this.ui.setGauge('');
  }
  updateReplay(dt) {
    const r = this.replay; this.replayT += dt * 0.55; const t = this.replayT;
    r.update(Math.min(t, r.dur)); const c = r.cam(Math.min(t, r.dur)); this.camera.position.copy(c.pos); this.camera.lookAt(c.look);
    const cap = [...r.captions].reverse().find((x) => t >= x.t); if (cap) this.ui.replayBanner(true, cap.text, r.own, r.tele?.(t));
    if (!this.flashed && t >= r.impactAt) { this.flashed = true; this.ui.flash(); this.audio?.impact(); }
    if (t >= r.dur) {
      r.dispose(); this.replay = null; this.world.setTrucksVisible(!this.hideWorldTrucks);
      this.ui.replayBanner(false); this.ui.setHudVisible(true);
      this.state = 'feedback'; this._after?.();
    }
  }

  // A/B/C decision inside a hands-on mode. options[i].replay(i) builds the replay for a wrong pick.
  prompt(i, onCorrect) {
    const h = this.hazards[i];
    this._prompt = { i, h, onCorrect, disabled: this._prompt?.i === i ? this._prompt.disabled : new Set() };
    this.state = 'prompt'; this.player.unlock(); if (this.usesPlayer) this.player.enabled = false; this.audio?.click();
    this.ui.showPrompt(h, this._prompt.disabled, (c) => this._choose(c));
  }
  _choose(c) {
    const p = this._prompt; const opt = p.h.options[c];
    if (opt.correct) { this.ui.hideCard(); this._prompt = null; this.state = 'run'; p.onCorrect(); return; }
    p.disabled.add(c); this.results[p.i] = 'near'; this.syncHud(); this.ui.hideCard();
    this.startReplay(this.buildReplay(p.i, c), () => this.ui.showFeedback(p.h, false, () => this.prompt(p.i, p.onCorrect)));
  }

  // Hold-a-key step that runs while the mode keeps going (radio a call, clip in, ...).
  hold(a, onDone) { this._hold = { ...a, p: 0, onDone }; this.ui.showAction(a); }
  updateHold(dt) {
    const a = this._hold; if (!a) return;
    a.p = Math.max(0, a.p + (this.keys[a.key] ? dt / a.seconds : -dt * 0.6));
    this.ui.actionProgress(a.p);
    if (a.p >= 1) { this._hold = null; this.ui.actionDone(); setTimeout(() => this.ui.hideAction(), 700); a.onDone(); }
  }

  finish() {
    if (this.state === 'done') return;
    this.state = 'done'; this.player.unlock(); this.ui.hideAction(); this.ui.setGauge('');
    this.ui.showEnd({ role: this.role, hazards: this.hazards, results: this.results, seconds: this.elapsed }, () => this.restart(), () => this.ui.showRoles());
  }

  update(dt) {
    if (this.state === 'replay' && this.replay) return this.updateReplay(dt);
    if (this.state === 'run') { this.tick(dt); this.updateHold(dt); }
    else this.idle?.(dt);
  }
  wantsLock() { return this.usesPlayer && this.state === 'run'; }
}
