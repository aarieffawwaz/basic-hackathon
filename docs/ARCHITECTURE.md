# Architecture

ShiftReplay is two static pages sharing one world module. There is no server, no build-time data, and one runtime dependency (three.js).

```
                      ┌──────────────── index.html (landing) ────────────────┐
                      │  src/landing.js: orbiting camera over the same yard   │
                      └───────────────────────────┬───────────────────────────┘
                                                  │ imports
                      ┌──────────────── play/index.html (sim) ───────────────┐
                      │ src/main.js                                            │
                      │   renderer (ACES, PCF soft shadows)                    │
                      │   world   ← src/world.js ← src/textures.js             │
                      │   player  ← src/player.js                              │
                      │   ui      ← src/ui.js     ← src/scenario.js (data)     │
                      │   audio   ← src/audio.js                               │
                      │   runner  ← src/hazards.js ← src/replay.js             │
                      └────────────────────────────────────────────────────────┘
```

## Modules

### `world.js` — the terminal
Builds everything visible from `BoxGeometry`, `CylinderGeometry`, `PlaneGeometry` and canvas textures:

- Sky: `three/examples/jsm/objects/Sky` with the sun at 24° elevation; a PMREM of the sky is the scene environment (`environmentIntensity 0.55`) so steel and puddles pick up the sky.
- Ground: asphalt colour + roughness maps (noise, grime, cracks), concrete apron, painted walkway and lane markings with wear, tyre tracks, puddles (`metalness 0.9, roughness 0.05`).
- Containers: `makeContainer(len, color, x, y, z, parent)`. Six-material box (side/side/top/bottom/door/door). Side maps carry corrugation, grime, rust streaks, a fictional shipping line and a box number; a bump map carries the corrugation. The ~1,500 corner castings of the static yard go into one `InstancedMesh`.
- RTG crane with tyred legs, hazard-striped feet, trolley, four cables and a suspended container (`world.hang`, used by the `load` replay).
- Quay: edge, bollards, a mooring line, a gangway, four STS cranes, a hull with stacked boxes, water, distant warehouses.
- Trucks (`makeTruck`), NPC workers on short paths, nine birds, a sun sprite, a beacon (ring + light pillar) at the next checkpoint.
- Workers: `makeWorker(vest, helmet)` returns a rig with hip and shoulder pivots and a face texture; `animateWorker(w, t, amount)` swings limbs.
- `colliders`: AABBs for stacks, crane legs, gate, fence, office, bollards. Player push-out is done in `player.js`.
- `update(dt)`: beacon pulse, truck loop + beacon blink, crane sway, NPC walk, birds, water roughness. Honors `world.paused`.

### `textures.js`
Every texture is a `CanvasTexture` drawn at startup with a seeded PRNG so the yard is identical each load. ~2 MB of GPU textures, zero network requests.

### `player.js`
Pointer-lock yaw/pitch, WASD relative to view, head bob, AABB push-out along the thinnest penetration axis. `enabled` is the single switch the runner flips.

### `scenario.js` — data only
```
ROLES[] ─ { id, name{en,id}, tag, blurb, spawn{x,z,yaw}, hazards[] }
hazard  ─ { id, zone{x,z,r}, objective, title, situation, options[3], action?, why, rule{name,en,id} }
option  ─ { en, id, correct, replay?, captions?{en[],id[]} }
action  ─ { type:'hold', key, seconds, label } | { type:'timing', key, window:[a,b], label }
STRINGS ─ all UI copy, {en,id}
```

### `hazards.js` — the state machine
```
walk ──(enter zone)──▶ prompt ──(wrong)──▶ replay ──▶ feedback(bad) ──▶ prompt (option struck)
                          └───(right)──▶ feedback(ok) ──▶ action ──▶ walk … ──▶ done
```
State: `idx`, `results[]` (`'pass' | 'near'`), `disabled` (Set), `firstTry`, `replayT`, `progress` (hold), `timingT` (timing). Keyboard: 1/2/3 or A/B/C choose; action key from the hazard. Audio hooks: click on prompt, success on right call / action done, impact at `replay.impactAt`.

### `replay.js`
`createReplayFor(id, world, lang, captions?)` → `{ dur, captions[{t,text}], impactAt, cam(t)→{pos,look}, update(t), dispose(), hideTrucks? }`. Five scenes: `ppe`, `cross` (also `report`), `load`, `height`, `snapback`. The runner advances `t` at 0.55× real time, drives the camera from `cam(t)`, flashes and thuds at `impactAt`, and disposes actors at `dur`. Caption overrides let a hazard retell the same physics for a different role.

### `ui.js`
DOM only. Mission panel (role, objective, distance, milestone list), status (timer, near misses, sound, language), full-screen decision with A/B/C cards, action bar (fill for hold, marker + green window for timing), replay banner, impact flash, shift report with role switch.

### `audio.js`
WebAudio graph created on the first click: brown-noise wind through a wandering low-pass, three detuned sawtooth diesel oscillators, scheduled gull chirps (triangle sweeps), ship horn (two sawtooths), reversing beeper (square), impact (sine drop + square burst). No files.

## Render budget
- Draw calls ≈ 700 (containers 6-material boxes dominate; castings batched).
- Shadow map 4096², one directional light, PCF soft. Pixel ratio capped at 1.5.
- 60 fps on an M-series laptop; ~30–45 fps on integrated graphics at 1080p. Drop `sun.shadow.mapSize` to 2048 for low-end machines.

## Failure modes
| Breaks | User sees |
|---|---|
| Pointer lock refused / Esc | Hint flips to "Click to resume"; the world keeps rendering |
| WebGL unavailable | Start overlay on a blank background (no fallback message yet) |
| Audio blocked | Silent; everything else works. `♪` toggles |
