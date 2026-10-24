// Procedural port ambience with WebAudio — no audio files.
// wind (filtered noise), diesel idle (low oscillators), reverse beeper, gulls, distant horn, impact thud.
export class PortAudio {
  constructor() { this.ctx = null; this.enabled = true; this.nodes = {}; }
  start() {
    if (this.ctx) { this.ctx.resume(); return; }
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const master = this.master = ctx.createGain(); master.gain.value = 0.6; master.connect(ctx.destination);
    // wind: brown-ish noise through a slowly wandering lowpass
    const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate); const d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const noise = ctx.createBufferSource(); noise.buffer = buf; noise.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
    const windGain = ctx.createGain(); windGain.gain.value = 0.35;
    noise.connect(lp).connect(windGain).connect(master); noise.start();
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07; const lfoG = ctx.createGain(); lfoG.gain.value = 220; lfo.connect(lfoG).connect(lp.frequency); lfo.start();
    // diesel idle: two detuned low oscillators + noise
    const dieselGain = ctx.createGain(); dieselGain.gain.value = 0.08; dieselGain.connect(master);
    for (const f of [38, 57, 76]) { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; const g = ctx.createGain(); g.gain.value = 1 / 3; const f2 = ctx.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = 160; o.connect(f2).connect(g).connect(dieselGain); o.start(); }
    this.nodes = { windGain, dieselGain };
    this.schedule();
  }
  // periodic one-shots
  schedule() {
    const loop = () => {
      if (!this.ctx) return;
      if (this.enabled) { const r = Math.random(); if (r < 0.45) this.gull(); else if (r < 0.6) this.horn(); }
      this.timer = setTimeout(loop, 4000 + Math.random() * 9000);
    };
    this.timer = setTimeout(loop, 2500);
    const beep = () => { if (!this.ctx) return; if (this.enabled && Math.random() < 0.5) this.beeper(); this.beepTimer = setTimeout(beep, 9000 + Math.random() * 14000); };
    this.beepTimer = setTimeout(beep, 6000);
  }
  tone(freq, dur, { type = 'sine', gain = 0.1, attack = 0.01, slideTo = null, pan = 0 } = {}) {
    const ctx = this.ctx; if (!ctx) return;
    const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(gain, ctx.currentTime + attack); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    const p = ctx.createStereoPanner(); p.pan.value = pan;
    o.connect(g).connect(p).connect(this.master); o.start(); o.stop(ctx.currentTime + dur + 0.05);
  }
  gull() { const pan = Math.random() * 1.6 - 0.8; const n = 2 + Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) setTimeout(() => this.tone(1500 + Math.random() * 500, 0.35, { type: 'triangle', gain: 0.035, slideTo: 900, pan }), i * 380); }
  horn() { this.tone(110, 2.2, { type: 'sawtooth', gain: 0.05, attack: 0.3, slideTo: 100, pan: Math.random() - 0.5 }); this.tone(165, 2.2, { type: 'sawtooth', gain: 0.03, attack: 0.3, slideTo: 150 }); }
  beeper() { const pan = Math.random() * 1.4 - 0.7; for (let i = 0; i < 5; i++) setTimeout(() => this.tone(1050, 0.25, { type: 'square', gain: 0.025, pan }), i * 600); }
  impact() { if (!this.ctx) return; this.tone(60, 0.9, { type: 'sine', gain: 0.5, slideTo: 30 }); this.tone(200, 0.15, { type: 'square', gain: 0.15, slideTo: 80 }); }
  click() { this.tone(900, 0.06, { type: 'square', gain: 0.03 }); }
  success() { this.tone(660, 0.12, { type: 'triangle', gain: 0.06 }); setTimeout(() => this.tone(990, 0.2, { type: 'triangle', gain: 0.06 }), 110); }
  // Plant alarm: a slow two-tone wail, on until siren(false).
  siren(on) {
    const ctx = this.ctx; if (!ctx) return;
    if (!on) { if (this.sirenNodes) { for (const n of this.sirenNodes) n.stop(); this.sirenNodes = null; } return; }
    if (this.sirenNodes) return;
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 640;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.45; const lg = ctx.createGain(); lg.gain.value = 170; lfo.connect(lg).connect(o.frequency);
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.value = 0.028;
    o.connect(f).connect(g).connect(this.master); o.start(); lfo.start();
    this.sirenNodes = [o, lfo];
  }
  setEnabled(v) { this.enabled = v; if (this.master) this.master.gain.setTargetAtTime(v ? 0.6 : 0, this.ctx.currentTime, 0.05); }
}
