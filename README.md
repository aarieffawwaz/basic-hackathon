# K3 Sim — First Shift

A browser-only 3D safety-training sim. You are a new worker on your first shift at a container terminal. Walk the yard, make five calls a new worker makes every day. Get one wrong and the sim does not tell you — it shows you what would have happened, then the rule.

No headset, no account, no server. Built for the Build With AI: Basics hackathon (Devpost Learn).

## Try it

```
pnpm install
pnpm dev        # open http://localhost:5173
```

WASD to walk, mouse to look, Esc releases the mouse, click to re-lock. Follow the yellow beacon.

Recording / debugging helpers: `?at=2` opens checkpoint 2 directly, `?at=2&replay=1` also plays its consequence replay, `?shot=1` skips the start screen.

## The five checkpoints

| # | Checkpoint | Regulation referenced |
|---|---|---|
| 1 | PPE at the gate | Permenaker No. 8/2010 |
| 2 | Crossing the truck lane | UU No. 1/1970 (pedestrian–vehicle segregation) |
| 3 | Suspended load under the RTG | Permenaker No. 8/2020 |
| 4 | Seal check on a two-high stack | Permenaker No. 9/2016 |
| 5 | Reporting a near miss | PP No. 50/2012 (SMK3) |

Regulation names are real; the one-line summaries are paraphrased and have not been reviewed by a K3 practitioner. Do not use this for actual compliance training without that review.

## Planning docs

`devpost/scope.md`, `devpost/prd.md`, `devpost/spec.md`, `devpost/checklist.md` — the Devpost Learn workflow (scope → PRD → spec → build → ship).

## Stack

Vite 8, three.js r186, plain JavaScript. The yard is built from primitives; replays are scripted animations. One runtime dependency.
