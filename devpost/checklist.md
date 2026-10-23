---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. You can walk the yard and reach the first checkpoint**
  Becomes usable: Start screen → pointer lock → walk a primitive container yard → beacon marks checkpoint 1 → card appears.
  Why now: Proves renderer, controls, collision, HUD, and the trigger loop end to end; everything else hangs off it.
  PRD ref: `prd.md > The Core Journey` (steps 1-3)
  Spec ref: `spec.md > Components`, `spec.md > File Structure`
  Build: Scaffold Vite + three, build `world.js`, `player.js`, `ui.js`, `hazards.js` trigger path, five checkpoints' data.
  Verify (mechanical): `pnpm build` passes; headless screenshots of start, yard, and `?at=2` card render without console errors.
  Learner check: Open the app, click Start, walk to the gate, see the PPE card.
  Commit: `Add yard, first-person walk, and checkpoint cards`

- [x] **2. A wrong call plays its consequence replay, then the rule**
  Becomes usable: Choosing a wrong option cuts to the slow-motion replay with captions and flash, then the near-miss card, then the card again with that option struck out.
  Why now: This is the kernel; it has to exist before anything is polished.
  PRD ref: `prd.md > Consequence replays`
  Spec ref: `spec.md > Components > src/replay.js`
  Build: `replay.js` with four scripted scenes, runner replay clock and camera, banner + flash in `ui.js`.
  Verify (mechanical): headless screenshots at `?at=N&replay=T` for N=1..4 show the staged actors mid-replay; no console errors.
  Learner check: At the truck lane choose "Cross now" and say whether the replay makes you flinch.
  Commit: `Add consequence replays for all four hazards`

- [x] **3. Five checkpoints end in a shift report, in EN or ID**
  Becomes usable: Completing all checkpoints shows the report; the EN/ID toggle switches all copy.
  Why now: Closes the loop for the demo video.
  PRD ref: `prd.md > The Core Journey` (step 6), `prd.md > Language`
  Spec ref: `spec.md > Components > src/ui.js`
  Build: `showEnd`, restart, language toggle with persistence.
  Verify (mechanical): `?at=5` → choose correct → report renders with 5 rows; toggle ID re-renders start copy.
  Learner check: Finish a shift and read the report; flip to ID and check the cards read naturally.
  Commit: `Add shift report and EN/ID toggle`

- [x] **4. Three roles, action steps, big decisions, mission panel**
  Becomes usable: Role select on start; operator and lashing roles with their own checkpoints on the quay; hold-E and timing-SPACE actions; full-screen A/B/C decision with keyboard; mission/milestone panel and status.
  Why now: Learner feedback after slice 3 asked for interaction beyond walking, more interface, and bigger decisions.
  PRD ref: `prd.md > The Core Journey` (steps 1, 4, 5), `prd.md > Action steps`
  Spec ref: `spec.md > Components > src/hazards.js`, `spec.md > Data Model`
  Build: `ROLES` in scenario.js, action state in hazards.js, new ui.js, play/index.html.
  Verify (mechanical): real-browser screenshots of `?role=lashing&shot=1`, `?at=2`, `?at=1&action=1`, `?end=1` render; no console errors.
  Learner check: Pick Lashing crew, walk to the snap-back zone, choose wrong, watch, then time SPACE on the winch.
  Commit: `Add roles, action steps, full-screen decisions, mission panel`

- [x] **5. Realism pass: sky, textures, rigged workers, birds, sound**
  Becomes usable: Sky with sun, env-lit materials, corrugated/grimy containers with shipping lines, asphalt and concrete, puddles, STS cranes and vessel, rigged workers with faces and walk cycles, birds, procedural port ambience.
  Why now: Learner asked for a more realistic yard; still no asset downloads so the repo stays dependency-free.
  PRD ref: `prd.md > Look and Feel`, `prd.md > Ambience`
  Spec ref: `spec.md > Components > src/textures.js`, `src/audio.js`
  Build: textures.js, world.js rewrite, audio.js, InstancedMesh castings.
  Verify (mechanical): `pnpm build` passes; GPU screenshots show textures, sky, quay; exposure tuned after an overexposed first render.
  Learner check: Stand at the gate and look around; say whether it reads as a port.
  Commit: `Realism pass: procedural textures, sky, rigged workers, birds, audio`

- [x] **6. Landing page, docs, deploy**
  Becomes usable: `/` landing with live hero, README with screenshots, docs/, Vercel at shiftreplay.vercel.app.
  Why now: Submission needs a link that explains itself and a repo a stranger can read.
  PRD ref: `prd.md > Screens and Layout`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`
  Build: index.html, landing.css/js, vite multi-page config, README, docs/, screenshots.
  Verify (mechanical): `pnpm build` emits both pages; live URL returns 200 and renders.
  Learner check: Open the live URL on your laptop, click Start shift, play one role.
  Commit: `Add landing page, docs, screenshots; deploy`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 3 the learner reviewed the running app and gave direction (roles, actions, bigger decisions, interface, realism, sound). Recorded under Revisions; shaped slices 4–6.
- [ ] Final kick-the-tires exploration and feedback completed — pending: learner plays one full role on the live URL and reports what to change.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship
  - Open: learner hands-on run of each role; confirm the lane replay "flinch" test (spec > Decisions and Open Issues).

## Code Tour and App Map

- App map generated at `devpost/app-map.html` (reference route, not toured interactively). Activity: focused alternative prepared — the "content as data, behaviour as a state machine" decision with evidence from slice 4. Reflection question not yet offered. Learner has not confirmed the wrap-up; nothing is claimed as learned.

## Revisions
- Fixed: shadow swimming (shadow camera now follows the player in a 110 m box, texel-snapped; GTAO denoise widened) and the worker face rendering on the back of the head (stray 180° head rotation).
- Learner: "looks like Roblox". Cinematic pass: GTAO + SMAA post stack, instanced container frames (posts/rails), capsule-limbed workers, asphalt normal map, rounded truck cab with headlights, FOV 64, film grain. Bloom tried and reverted to opt-in (whited out the sky).
- Learner asked for a third-person view option: body rig follows the player, orbit camera, V key + HUD button, persisted in localStorage. Hidden during replays. Crosshair hidden in third person.
- Slices 1–3 were built in one session by the agent from the approved spec; headless verification replaced the per-slice learner check.
- After slice 3 the learner asked for: role selection with different flows, interaction beyond walking (keys to perform actions), a richer interface (mission/milestones), bigger decision text, sky, faces and limb animation, port sounds, birds, a better sun, a landing page in the style of modern product sites, and fuller documentation. Scope, PRD and spec were updated; slices 4–6 added.
- Renamed from "K3 Sim" to "ShiftReplay".
- npm 10.8 on Node 20 failed to resolve Vite 8 peers; switched to pnpm (recorded in spec > Stack).
- three r186 removed `PCFSoftShadowMap`; using `PCFShadowMap`.
- First GPU render was overexposed (sun 2.4 + env 0.55 + exposure 0.95); tuned to sun 1.7, env 0.3, exposure 0.72, darker asphalt. Roughness-map grime produced specular ovals; flattened.
- Headless Chrome (SwiftShader) could not render the v2 scene in reasonable time; verification moved to the real browser via the Chrome extension on the LAN address.
