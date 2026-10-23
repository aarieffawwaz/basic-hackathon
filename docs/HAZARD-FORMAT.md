# Hazard format

All content lives in `src/scenario.js`. No code changes are needed to add a checkpoint to a role.

## Role
```js
{
  id: 'operator',                                  // used by ?role=
  name: { en: 'Reach stacker operator', id: 'Operator reach stacker' },
  tag:  { en: 'Heavy equipment · 3 checkpoints', id: '…' },
  blurb:{ en: 'One line on the start card', id: '…' },
  spawn:{ x: 0, z: 48, yaw: 0 },                   // metres; yaw 0 faces -z (north, toward the stacks)
  hazards: [ /* in play order */ ],
}
```

## Checkpoint
| Field | Type | Notes |
|---|---|---|
| `id` | string | unique within the role |
| `zone` | `{x, z, r}` | trigger circle on the ground; put it on the walkway so the beacon is reachable |
| `objective` | `{en,id}` | mission panel line while walking there |
| `title` | `{en,id}` | decision headline |
| `situation` | `{en,id}` | 1–3 sentences; include the tempting reason to do the wrong thing |
| `options` | 3 × option | exactly one `correct: true` |
| `action` | optional | what the player physically does after the right call |
| `why` | `{en,id}` | one paragraph, physics before policy |
| `rule` | `{name, en, id}` | real regulation name; summary is paraphrase |

### Option
```js
{ en: '…', id: '…', correct: false,
  replay: 'cross',                                   // ppe | cross | load | height | snapback
  captions: { en: ['beat 1', 'beat 2', 'beat 3'], id: [...] } }   // optional, replaces the replay's captions by index
```

### Action
```js
{ type: 'hold',   key: 'KeyE',  seconds: 1.6, label: { en: 'Hold E — …', id: '…' } }
{ type: 'timing', key: 'Space', window: [0.58, 0.74], label: { en: 'Press SPACE when …', id: '…' } }
```
`window` is a fraction of the marker's sweep (0–1). Narrower = harder. A miss shows "too early / too late" and lets the player try again; it does not count as a near miss.

## Replay
Add a branch to `createReplay` in `src/replay.js` that returns:
```js
{ dur: 5, impactAt: 2.3, hideTrucks: false,
  captions: [{ t: 0, text }, { t: 2.3, text }, { t: 3.4, text }],
  cam: (t) => ({ pos: Vector3, look: Vector3 }),
  update: (t) => { /* move actors; t is replay seconds, runner advances at 0.55× */ },
  dispose: () => { /* remove actors you added */ } }
```
Use `makeWorker`, `makeTruck`, `makeContainer`, `animateWorker` from `world.js`. Keep it under five seconds; the banner reads one caption per beat.

## Scene
A scene is `src/world.js`. Keep the exports (`buildWorld`, `makeContainer`, `makeTruck`, `makeWorker`, `animateWorker`) and the `world` object shape (`colliders`, `hang`, `setBeacon`, `setTrucksVisible`, `paused`, `update`). Roles reference positions in metres, so a new scene means new zones.
