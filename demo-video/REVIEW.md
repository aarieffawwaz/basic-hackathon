# ShiftReplay demo film — review and delivery note (cut 2)

File: `shiftreplay-demo.mp4`, 1920x1080, 30 fps, H.264 + AAC 48 kHz, 89.33 s, 118.6 MB.

## What changed from cut 1

- A 13.6 s prologue tells the K3 problem before the product: Dimas at the gate (the sim's own First
  Shift card and PPE check), "His K3 induction: a slideshow and a signature.", "He has never stood next
  to a moving tractor." over the landing page's truck-lane shot, "Today he does." as the tractor passes,
  then the open lane card and the click. Every later beat moved 13.6 s later. The claim beat now uses the
  landing's third-person and under-the-RTG section so the lane shot is not seen twice.
- Sound rebuilt. The first bed was a MusicGen loop with nothing above 150 Hz (1-4 kHz band at -50 dB RMS),
  which plays as rumble or nothing on a laptop speaker. Replaced by a second MusicGen take picked by band
  energy (150 Hz-1 kHz -38, 1-4 kHz -40, over 4 kHz -36 dB RMS), looped with 1 s crossfades, normalised,
  entering 2.1 s before the hook. Under the prologue the only sound is the sim's own port ambience
  (`src/audio.js` ported to an offline renderer: wind, diesel idle, gulls, reverse beeper). The sim's own
  thud sits under the impact and its confirm tone marks the safe call. Whooshes cut from 8 to 7, all on
  scene seams, two takes rotated, at 0.25-0.35.
- Lint: templates renamed `*.tpl` so the `@@` placeholders are never linted; nested clips carry
  `data-hf-media-start-basis="local"`. `check` passes with 0 errors, 0 warnings (info only: intended
  overflow on the camera wrappers, hidden words before their reveal).

## Frames looked at

Prologue 1.3 / 2.6 / 5.6 / 8.6 / 12.3 / 13.3 s, hook card 15 s, impact 21.8 s, name 32.5 s, proof 38-54 s,
range 59.6 / 61 s, payoff 67 s, claim 74.6 / 76.2 / 78.5 s, end card 84 / 86.6 s. All titles on the
product's panel read against the yard; no title collides with the sim HUD or the landing's caption cards.
Known: the first 0.6 s of the prologue is the sim's own fade from its start card (bright sky), kept as is.

## Sound, measured (not heard)

| Section | Integrated | Peak |
| --- | --- | --- |
| whole film | -15.9 LUFS, LRA 8.2 LU | -1.0 dBFS |
| prologue (ambience only) | -20.4 LUFS | -4.9 |
| lane card, music entering | -16.5 LUFS | -5.0 |
| replay, bed ducked | -24.5 LUFS | -11.3 |
| impact | -9.7 LUFS | -3.2 |
| the shift | -15.1 LUFS | -2.4 |
| range | -16.3 LUFS | -2.8 |
| end card | -15.6 LUFS | -1.4 |

The renderer peak-normalises the master, so the riser and the claim whoosh were lowered to let the mix
sit at the social target. Impact sits about 15 dB over the ducked bed; clicks and the confirm tone 3-6 dB
over the bed.

## Not done

- Nobody has listened to the mix; the numbers above are the check. Play it once before upload.
- `assets/clips/` (about 100 MB) and the rendered MP4 should stay out of git.
