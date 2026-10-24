import * as THREE from 'three';

// Own-run replay. Hands-on modes record their state every frame; when the player causes an
// incident, the last few seconds are played back from outside, slowed down, exactly as they
// happened — then an `aftermath(k)` finishes the consequence. Returns the same shape as
// replay.js, so the runner loop treats both the same way.

export class Recorder {
  constructor(capture, seconds = 12) { this.capture = capture; this.max = seconds; this.reset(); }
  reset() { this.frames = []; this.t = 0; }
  tick(dt) {
    this.t += dt;
    this.frames.push({ t: this.t, s: this.capture() });
    while (this.frames.length > 2 && this.t - this.frames[0].t > this.max) this.frames.shift();
  }
  // The last `lead` seconds, re-timed so the clip starts at 0.
  clip(lead) {
    const t0 = this.t - lead;
    const out = this.frames.filter((f) => f.t >= t0).map((f) => ({ t: f.t - t0, s: f.s }));
    if (!out.length && this.frames.length) out.push({ t: 0, s: this.frames.at(-1).s });
    return out;
  }
}

export function stateAt(frames, t) {
  if (!frames.length) return null;
  let lo = 0, hi = frames.length - 1;
  if (t <= frames[0].t) return frames[0].s;
  if (t >= frames[hi].t) return frames[hi].s;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (frames[m].t <= t) lo = m; else hi = m; }
  return frames[lo].s;
}

// frames: from Recorder.clip. apply(s): put the scene in state s. focus(s) → Vector3 the camera orbits.
// after: seconds of aftermath. aftermath(k, last): scripted consequence, k from 0 to `after`.
// impactAfter: flash/thud this many seconds into the aftermath (default: the moment the clip ends).
// focusAfter(k): where the camera looks during the aftermath, when something keeps moving.
// angle/sweep: orbit start (radians, 0 = from +z) and speed; keep sweep low inside the stack corridor.
// captions [{t,text}] in replay seconds. tele(s) → short telemetry string shown in the banner.
export function makeGhost({ world, frames, apply, focus, after = 2, aftermath, captions, tele, trail = true, radius = 16, height = 7, angle = 0.6, sweep = 0.12, impactAfter = 0, focusAfter, dispose: extraDispose }) {
  const lead = frames.length ? frames.at(-1).t : 0;
  const last = frames.length ? frames.at(-1).s : null;
  const actors = [];
  if (trail && frames.length > 1) {
    const pts = frames.map((f) => { const p = focus(f.s); return new THREE.Vector3(p.x, 0.12, p.z); });
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xff5a5a, transparent: true, opacity: 0.9, depthTest: false }));
    line.renderOrder = 9; world.scene.add(line); actors.push(line);
  }
  const look = new THREE.Vector3(), camPos = new THREE.Vector3();
  let snapped = false, lastS = last;
  return {
    dur: lead + after, impactAt: lead + impactAfter, lead, captions, own: true,
    tele: (t) => (tele && lastS ? tele(lastS, t, lead) : ''),
    update(t) {
      if (t <= lead) { lastS = stateAt(frames, t); if (lastS) apply(lastS); }
      else aftermath?.(t - lead, last);
    },
    cam(t) {
      const s = t <= lead ? stateAt(frames, t) : last;
      const f = t > lead && focusAfter ? focusAfter(t - lead) : s ? focus(s) : new THREE.Vector3();
      if (!snapped) { look.copy(f); snapped = true; } else look.lerp(f, 0.08);
      const a = angle + t * sweep;
      camPos.set(look.x + Math.sin(a) * radius, height, look.z + Math.cos(a) * radius);
      return { pos: camPos, look: new THREE.Vector3(look.x, 1.4, look.z) };
    },
    dispose() { for (const a of actors) { world.scene.remove(a); a.geometry?.dispose(); } extraDispose?.(); },
  };
}
