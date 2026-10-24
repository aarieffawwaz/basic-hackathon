---
doc: spec
status: approved
---

# ShiftReplay — First Shift — Technical Spec

## How This Works, In Plain Language
The whole app is one web page. Three.js draws a container yard out of boxes and cylinders — no downloaded 3D models. You walk around it with the keyboard and mouse like a first-person game. A list of **checkpoints** lives in one data file: where each one is in the yard, what it asks, the three choices, the explanation, and the regulation. A small **runner** watches your position; when you step into a checkpoint it pauses the yard and shows the card. If you choose wrong, a **replay** script moves a dummy worker and a truck or container through a short scripted accident while the camera watches from the side, then hands you back to the card. There is no server and no login: everything runs in the browser, so the link opens for anyone.

Why this shape: the kernel is the replay, so the budget went there. Primitives instead of models and scripted motion instead of a physics engine kept the build to a weekend and the repo to a single dependency.

## The Core Journey Through the System
1. Start → `ui.js` hides the overlay, `player.js` requests pointer lock, `hazards.js` enables walking and shows checkpoint 1's objective and beacon (`world.setBeacon`).
2. Walking → every frame `player.update` moves the camera and pushes it out of any collider box; `hazards.update` measures distance to the current checkpoint zone.
3. Inside the zone → `runner.trigger()` pauses `world`, releases the mouse, and `ui.showPrompt()` renders the card from `scenario.js`.
4. Choice → `runner.choose(i)`. Correct: record `pass`/`near`, `ui.showFeedback(correct)`. Wrong: `createReplay(id)` from `replay.js` adds actors to the scene; `runner.update` advances replay time at 0.55×, moves the camera along `cam(t)`, updates captions, flashes at `impactAt`, then `endReplay()` removes actors and shows the near-miss card; **Choose again** reopens the card with that option disabled.
5. Continue → `runner.advance()` moves to the next checkpoint, re-locks the mouse, updates beacon and HUD. After the fifth, `ui.showEnd()` renders the shift report from `results[]`.
PRD ref: `prd.md > The Core Journey`.

## Stack
- Two static pages (`index.html` landing, `play/index.html` sim) built by Vite's multi-page input.
- **Vite 8** (dev server + build) — https://vite.dev — zero config, instant reload.
- **three.js r186** — https://threejs.org/docs — the only runtime dependency. Chosen over a game engine because the scene is simple and the engine would dominate the repo.
- Plain JavaScript modules, no framework — the UI is five DOM panels; React would be weight without benefit.
- Package manager: **pnpm** (npm 10.8 on Node 20 hit an arborist bug resolving Vite 8's peer set; pnpm resolved it).
- Node 20+.

## Where It Runs and How Someone Tries It
Runs entirely in the browser (desktop, mouse + keyboard; pointer lock needs a click).
```
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # static output in dist/
```
Demo recording: open `http://localhost:5173`, click **Start shift**, walk to the truck lane, choose "Cross now", let the replay play, choose the safe option, continue to the end. URL helpers for recording: `?at=2` opens checkpoint 2 directly; `?at=2&replay=1` also plays its replay; `?shot=1` skips the start screen.
Deployed as static `dist/` on Cloudflare Pages at https://shiftreplay.pages.dev (no env vars; see `docs/DEPLOY.md`). The old Vercel URL still serves the same build.
Hands-on modes: `?role=driver|crane|signal|inspect|evac`. On a touch-only device `?force=1` skips the device notice.

## Look and Feel
Dark glass HUD panels (`rgba(16,19,24,.88)`) with a yellow accent (`#f5c518`) for objective, beacon, lane lines, and primary buttons. Red (`#ef4444`) only for the replay banner, the impact flash, and near-miss verdicts; green only for safe calls. System sans-serif. Yard is flat-shaded Lambert materials, warm directional sun with soft shadows, light-blue sky and fog. Copy: second person, short, no exclamation marks. Honors `prd.md > Look and Feel` fully; three.js imposes no constraint on the DOM styling.

## Components

### `src/world.js` — the yard
Builds ground, markings, gate + PPE rack, container blocks (seeded pseudo-random heights so the layout is stable), the RTG crane with its suspended container (`world.hang`), two looping terminal tractors, NPC workers, the beacon, and skyline fillers. Exposes `colliders` (AABBs), `setBeacon`, `setTrucksVisible`, `paused`, and `update(dt)`. Also exports `makeWorker`, `makeTruck`, `makeContainer` for replays.
PRD ref: `prd.md > Walking the yard`.

### `src/player.js` — first-person controller
Pointer-lock yaw/pitch, WASD relative to view, AABB push-out against `colliders`, head bob. `enabled` is the single switch the runner flips.
PRD ref: `prd.md > Walking the yard`.

### `src/scenario.js` — checkpoint data
`HAZARDS[]` (zone, objective, title, situation, options, why, rule, replay id) and `STRINGS` for all UI copy, each as `{ en, id }`.
PRD ref: `prd.md > Checkpoints`, `prd.md > Language`.

### `src/hazards.js` — the runner
State machine `walk → prompt → (replay →) feedback → walk … → done`. Owns `results[]`, first-try tracking, disabled options, replay clock, camera during replays.
PRD ref: `prd.md > Checkpoints`, `prd.md > Consequence replays`.

### `src/replay.js` — consequence replays
`createReplay(id, world, lang)` returns `{ dur, captions, impactAt, cam(t), update(t), dispose(), hideTrucks? }`. Four scripted scenes; `report` reuses `cross` with different captions.
PRD ref: `prd.md > Consequence replays`.

### `src/ui.js` — HUD and cards
Renders start overlay (role list + preview card from `PREVIEW` in `scenario.js`), objective, progress dots, decision card, feedback card, replay banner, flash, shift report. Holds `lang`.
PRD ref: `prd.md > Screens and Layout`.

### `src/main.js` — wiring
Renderer (ACES tone mapping, PCF shadows), scene, camera, frame loop, resize, URL helpers (`?role= ?at= ?replay= ?action= ?end= ?shot=`).

### `src/textures.js` — procedural textures
Canvas-drawn corrugation + bump, grime, rust, asphalt colour/roughness, concrete, painted lines, hazard stripes, text signs, vests, faces. Seeded PRNG so the yard is identical on every load.

### `src/audio.js` — ambience
WebAudio graph: brown-noise wind, detuned sawtooth diesel, scheduled gulls/horn/beeper, impact thud. Created on the first click (autoplay policy).

### `src/boot.js` — device gate
Entry point for `/play/`. Checks WebGL and whether the only pointer is touch before importing `main.js`, so an unsupported device gets the `#overlay-unsupported` panel (EN/ID, link back to the landing page) instead of a black canvas. The static loading bar in `play/index.html` is on screen while the main chunk downloads; `main.js` then drives it from `THREE.DefaultLoadingManager` while the HDRI and PBR files arrive.
PRD ref: `prd.md > States and Boundaries`.

### `src/modes/` — hands-on modes
`base.js` is the shared shell (score, verdict card, shift report, replays). `drive.js` (tractor: speed, braking distance, radar, zebra, RTG red light), `cranesim.js` (RTG gantry, hoist, pendulum load driven by gantry acceleration and wind, twist-locks that only turn when seated) used by `crane.js` and `signal.js`, `inspect.js` (frozen yard, flag hazards against a 90 s clock), `evac.js` (ammonia plume as a pure function of time and wind). `ghost.js` records each mode's state every frame and plays the last seconds back from outside at 0.55× on an incident, returning the same shape as `replay.js` so the frame loop treats both alike. Checkpoint copy lives in `modes/scenarios.js`.
PRD ref: `prd.md > Hands-on modes`.

### `src/landing.js` — landing hero
Same `buildWorld`, orbiting camera, renders only while the hero is on screen.

## Data Model
No database. `ROLES[]` → `hazards[]` in `scenario.js` (see `docs/HAZARD-FORMAT.md`). In-memory state in `HazardRunner`: `role`, `idx`, `results[]` (`'pass' | 'near'`), `disabled` (Set), `firstTry`, `startedAt`, `progress` (hold action), `timingT` (timing action). `localStorage['k3-lang']` is the only thing that survives a reload.

## File Structure
```
basic-hackathon/
├── index.html            # landing page
├── play/index.html       # sim: HUD, decision, action bar, overlays
├── public/screenshots/   # README + landing images
├── docs/                 # ARCHITECTURE, HAZARD-FORMAT, DEMO-GUIDE, DEPLOY
├── src/
│   ├── boot.js           # device + WebGL gate, then imports main.js
│   ├── main.js           # renderer + loop + URL helpers, loading bar
│   ├── modes/            # hands-on modes + own-run replay (ghost.js)
│   ├── assets.js         # Poly Haven HDRI + PBR loaders
│   ├── world.js          # yard + quay geometry, sky, trucks, workers, birds, colliders
│   ├── textures.js       # procedural canvas textures
│   ├── audio.js          # WebAudio ambience
│   ├── landing.js        # landing hero orbit
│   ├── player.js         # first-person controls + collision
│   ├── scenario.js       # HAZARDS + STRINGS (EN/ID)
│   ├── hazards.js        # checkpoint state machine
│   ├── replay.js         # consequence replay scripts
│   ├── ui.js             # DOM rendering
│   ├── style.css         # sim
│   └── landing.css       # landing
├── devpost/              # Devpost Learn workspace (scope, prd, spec, checklist)
├── .agents/skills/       # hackathon skill pack (installed by npx skills add)
└── package.json
```

## External Services and Dependencies
None at runtime. No API keys, no network calls after the page loads.

## Important Failure Modes
- **Pointer lock refused or released (Esc, alt-tab)** → hint pill switches to "Click to resume"; clicking the canvas re-locks. The sim keeps rendering.
- **WebGL unavailable** → `boot.js` detects it before three.js loads and shows a panel explaining what is needed.
- **Touch-only device** → pointer lock and WASD are unavailable; `boot.js` shows a notice with a link to the landing page and a "Continue anyway" button.
- **Slow or failed texture download** → every surface renders its procedural fallback first; the loading bar fills as files arrive and hides after the last one or after 20 s.
- **Walking into a replay zone from an odd angle** → zones are circles with radius 2.6 m on the walkway; the beacon marks them, and triggering only depends on distance, so approach angle does not matter.

## What Was Simplified and Why
- **Scripted replays** instead of a physics engine — identical on screen for a 5 s clip; a physics engine would add a dependency and a day of tuning.
- **Primitive geometry** instead of GLTF models — reads as a yard, zero asset licensing, instant load.
- **Circle trigger zones + beacon** instead of interact-to-trigger — fewer controls to explain in a 1–3 min video.
- **Paraphrased regulations** instead of quoted legal text — regulation names are real (Permenaker 8/2010, 8/2020, 9/2016; UU 1/1970; PP 50/2012); the one-line summaries are the learner's paraphrase and must be reviewed by a K3 practitioner before real training use.

## Decisions and Open Issues
- **Roles share one scene** (learner choice, after seeing the first build): three jobs give the demo range without a second world; the lashing role uses the quay end of the same terminal.
- **Action steps are two primitives** (hold, timing) rather than per-checkpoint minigames — enough to make the safe behaviour physical, cheap to add to any checkpoint.
- **Sound is synthesised** — no audio files keeps the repo asset-free and the link instant; the cost is that gulls sound like synth gulls.
- **Replay time runs at 0.55×** (learner choice: slow enough to read captions, short enough not to bore in a demo). Tradeoff: real speeds in captions, slowed motion on screen — the banner says REPLAY so it is not mistaken for real-time.
- **Live trucks hidden during lane replays** (implementation detail) so the staged tractor is the only vehicle in frame.
- **Learner uncertainty discussed:** whether "first-person in the browser without a headset" is enough presence for the lesson to land. Agreed evidence: the lane-crossing replay must make a first-time viewer flinch in the demo recording; if it does not, add a camera shake and a closer angle before shipping.
- Open: skippable replays on repeat runs (carried from PRD, default no).
- Resolved: "Operator role is still played on foot" — the learner asked to drive and lift; the hands-on modes (slice 7) add a tractor and an RTG under the player's control, each with a hand-written model rather than a physics engine.
