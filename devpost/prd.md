---
doc: prd
status: approved
---

# K3 Sim — First Shift — Product Requirements

One line: a browser 3D sim where a new container-terminal worker walks a shift, decides at five checkpoints, and watches the consequence of each wrong call before learning the rule. Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`.

## The Core Journey
1. Open the URL. A start panel explains the controls in four bullets. Click **Start shift**; the mouse locks to the sim.
2. You are standing on the green walkway outside the gate. The HUD shows the objective ("Walk to the gate and clear the PPE check") and a yellow beacon marks the checkpoint.
3. Walk into the beacon. The sim pauses, releases the mouse, and a decision card appears: situation text and three choices.
4. Pick a choice.
   - Safe call: a green **SAFE CALL** card with one paragraph of why and the regulation name + one-line summary. **Continue** re-locks the mouse and sets the next objective.
   - Wrong call: the card disappears, the camera cuts to a third-person angle, a red **REPLAY** banner narrates in two or three captions while the accident plays in slow motion, the screen flashes at impact. Then a red **NEAR MISS** card with the why + regulation, and **Choose again** returns to the card with the wrong option struck out.
5. Repeat across five checkpoints: gate PPE → truck-lane crossing → suspended load under the RTG → seal check at height → near-miss report at the site office.
6. **Shift report**: clean calls out of five, near misses replayed, shift time, one row per checkpoint with the regulation, and **Run the shift again**. (`scope.md > What "Working" Looks Like`)

## Screens and Layout
- **Start overlay** — title, four-bullet how-to, Start button, EN/ID toggle (top right, visible on every screen).
- **Yard (main surface)** — full-screen 3D. HUD: objective (top left), progress dots + near-miss count (top right), crosshair, hint pill (bottom).
- **Decision card** — bottom-centre glass card over the paused yard.
- **Replay** — HUD hidden, red banner top-centre with the caption.
- **Shift report overlay** — same panel style as start.

## Look and Feel
Industrial and calm, not game-y. Dark glass panels, yellow hazard accent (#f5c518), system sans. Red is reserved for the replay banner, the impact flash, and near-miss verdicts. Low-poly flat-shaded yard in daylight with soft shadows and distance fog. Copy is short, second person, no exclamation marks. (`scope.md > Inspiration & Identity`)

## Features and Behavior

### Walking the yard
- WASD / arrows to move, mouse to look, Esc releases the mouse, click re-locks. Cannot walk through container stacks, crane legs, the office, or the fence.
- Terminal tractors loop in the truck lane; the suspended container sways gently. These are atmosphere; they do not collide with the player.
- One yellow beacon (ring + light pillar) marks the next checkpoint. Entering its radius triggers the checkpoint.

### Checkpoints
Each checkpoint has: a trigger zone, an objective line, a title, situation text, three options (exactly one correct), a "why" paragraph, and one regulation (name + one-line summary), in both EN and ID.
- [ ] Entering the zone pauses the world and shows the card.
- [ ] A correct choice records `pass` if it was the first attempt, otherwise `near`.
- [ ] A wrong choice plays its consequence replay, then the near-miss card, then the card again with that option disabled.
- [ ] After the last checkpoint, the shift report appears.

### Consequence replays
- [ ] `ppe` — a loose twist-lock falls 11 m onto a helmetless worker at the gate.
- [ ] `cross` — a terminal tractor strikes a worker crossing the lane; captions give speed and stopping distance.
- [ ] `load` — the RTG's suspended container drops on a worker passing beneath.
- [ ] `height` — a worker steps off a wet container roof from 5.2 m.
- [ ] `report` — the `cross` replay with a different worker and "seven days later" captions.
- Each replay: ~5 s at 0.55× speed, fixed cinematic camera with slow dolly, two or three captions, one red flash at impact. Live trucks are hidden during lane replays.

### Language
- EN default, ID toggle. Persisted in `localStorage`. Switching mid-walk updates the HUD; cards render in the current language when opened.

## States and Boundaries
- **First use** — start overlay; nothing is stored except the language choice.
- **Paused** — any card or replay pauses trucks and crane sway and disables walking.
- **Mouse released (Esc)** — hint changes to "Click to resume"; the sim keeps rendering.
- **Shift complete** — report overlay; restart resets position, results, and timer.
- **Nothing persists between sessions** except language. No accounts, no server.

## Product Decisions
- Replay before rule, always — the replay is the kernel; a rule shown first would let the user skip the replay mentally.
- Three options, one correct — enough to make the wrong ones tempting ("40 m is plenty"), few enough to decide in ten seconds.
- Wrong options stay visible but struck out — the user sees what they already chose; the card is a record, not a quiz reset.
- First-try tracking, not points — a near miss you learned from still counts as learned; the report just says "replayed".
- EN default — the judges read English; ID is a toggle because the audience is Indonesian.

## What We're Building
Everything under Features and Behavior, plus the start overlay, shift report, and a `?at=N` / `?replay=` URL helper for recording the demo video.

## Deferred From the POC
- Additional scenes (plant, mine) — the hazard JSON format supports them; the yard proves the kernel.
- AI-generated situations/debriefs — nice, but would add an API key and a network dependency to a link that must open without sign-in.
- Audio — would improve the replay; cut for time.

## Possible Later Enhancements
- Instructor view with cohort results.
- A "safety card" PDF at the end of the shift.
- Mobile touch controls.

## Non-Goals
- No VR/WebXR — Molca's lane; our point is no headset.
- No physics engine — scripted replays read the same to a viewer.
- No legal-grade regulation text — paraphrased and labelled.
- No leaderboard — nothing to prove.

## Open Questions
- Should the replay be skippable after the first viewing? (Can wait; default no.)
- Regulation paraphrases need a K3 practitioner's read before any real training use. (After the hackathon.)
