---
doc: scope
status: approved
---

# ShiftReplay — First Shift

One line: a browser-only 3D safety-training sim where a new terminal worker picks a job, walks their first shift, makes the calls that job demands, and sees the accident each wrong call would have caused.

(Working title during scoping was "K3 Sim"; renamed ShiftReplay before shipping because the kernel is in the name.)

## The Unique Kernel
When you make the wrong call, the sim does not say "incorrect". It cuts to a third-person slow-motion **consequence replay** of what would have happened to you — the tractor, the dropped container, the fall — and only then shows the rule. The lesson is the replay, not the quiz. Delete the replay and this is a multiple-choice K3 test with a 3D background; keep it and it is the thing people remember.

## Who It's For
Dimas, 22, hired last week as a yard checker at a container terminal in Surabaya. He has watched the K3 induction slideshow and signed the form. He has never stood next to a moving terminal tractor. Today, companies like Molca (molca.id) run VR safety patrols for Pelindo — but that needs headsets, a vendor, and a training room. Dimas gets a laptop and a login.

## The Core Loop
Open the link → click Start → walk the yard with WASD toward the yellow beacon → reach a checkpoint → read the situation, pick what you would do → safe call: short "why" + the regulation, keep walking; wrong call: consequence replay, the regulation, choose again → five checkpoints → shift report. Replay to get five clean calls.

## Inspiration & Identity
- Molca (https://www.molca.id/) — VR Safety Patrol & JSA for Pelindo ports; the market proof. We are the no-headset version.
- Hackathon winners that showed a hidden mechanism in one visual beat (Sim Francisco's backtest, Tekton's evidence chain).
- Devpost's own scope example: the to-do app that confronts you with past excuses. Same move: the product shows you something uncomfortable about your own choice.
- Mood: industrial, calm, legible. Yellow hazard accent on dark glass HUD. Low-poly yard, not a game. The replay banner is the only red thing on screen.

## Why This Matters to the Learner
I grew up around people who work field jobs — ports, plants, mines — and the K3 training they describe is a slideshow and a signature. I wanted to see if a coding agent could get a 3D sim that teaches something real into a browser in a weekend, with no 3D asset pipeline.

## What "Working" Looks Like
Open the link, click Start, walk to the truck lane, choose "cross now", and watch the tractor hit you in slow motion with the stopping-distance caption, then the Permenaker reference. That is the "oh" beat. Then five checkpoints end in a shift report listing each call, first try or replayed.

## The POC Boundary
- One scene: a container terminal with yard and quay, built from primitives and procedurally drawn textures (no model or image files).
- Three roles: yard checker (5 checkpoints), reach stacker operator (3), lashing crew (3). Eleven checkpoints in total.
- Five consequence replays (`ppe`, `cross`, `load`, `height`, `snapback`); roles retell the same physics with different captions.
- An action step after each right call: hold E, or time SPACE.
- Procedural port ambience (WebAudio), birds, sky, sun.
- English and Bahasa Indonesia toggle. Shift report at the end. A landing page. No accounts, no server, no API keys.

## Later
- More scenes (petrochemical plant, mine haul road) driven by the same JSON hazard format.
- An AI "safety officer" that generates a fresh situation text and debrief per run.
- Instructor dashboard: which checkpoints a cohort gets wrong.

## Explicitly Cut
- **VR / WebXR** — the whole point is laptop-only; headsets are Molca's lane.
- **Physics engine** — replays are scripted animations; a physics engine would cost a day and add nothing the viewer can tell apart.
- **Real 3D assets / GLTF** — primitives are enough to read "yard", and keep the repo dependency-free beyond three.js.
- **Scoring persistence / leaderboard** — nothing to prove about the kernel.
- **Verified legal text** — rule names are real regulations; the wording is paraphrased and flagged as such in the spec. A compliance review is a later step, not a weekend one.
