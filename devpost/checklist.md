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

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2, learner tries the lane-crossing replay
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

## Revisions
- Slices 1–3 were built in one session by the agent from the approved spec; headless verification replaced the per-slice learner check. Learner hands-on review is pending (see Hands-on Checkpoints).
