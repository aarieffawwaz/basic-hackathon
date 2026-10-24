GOAL:    A hackathon judge understands in the first ten seconds that a wrong call plays the accident,
         believes every screen is the real product, and wants to click Start shift.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps
TIME:    89.3 s x 30 = 2680 frames. Prologue 13.6 s before the hook; the rest of the schedule shifts by 13.6 s.
         Sound: the sim's own port ambience (src/audio.js rendered offline) alone under the prologue; music enters
         2.1 s before the hook, about 96 BPM, with its energy spread 150 Hz-8 kHz so it survives a phone speaker.
LOOK:    Ground: the recorded product itself (the sim at /play/ and the landing at /), never a void.
         Chrome: the product's own panel, rgba(14,17,22,0.92) with a 1 px rgba(255,255,255,0.12) line, radius 14 px.
         Ink #f5f7fa, secondary #c9d1da, muted #9aa5b1. Accent #f5c518 on one word per title, the cursor rim, the end card.
         Red #ff5a5a only where the product shows it (replay banner, near-miss verdict, report row).
         Display: Inter 700, 96 px (8.9% of height), tracking -0.02em, line-height 1.02. Captions: Inter 600, 40 px.
         Mono: JetBrains Mono 500, 30 px for the URL and key caps.
         Medium: screen recording at 1:1 and 1.6x punch-ins; a 2 px dark edge on footage when it is scaled below 100%.
         Depth: none faked; the sim has its own fog and shadows. No grain, no vignette, no blur on footage.
OBJECTS: The decision card (dark glass, three option buttons A/B/C, situation text). The terminal tractor (orange cab,
         blue chassis). The near-miss card (red verdict pill, the rule in a dark box). The yellow beacon (ring + pillar).
         The action bar (marker sweeping over a green window). The shift report (rows with pass / near miss).
         The cursor: a 72 px tall dark arrow with a 3 px #f5c518 rim, drop shadow 0 6 px 14 px 45%.
         The mark: public/logo.svg (yellow rounded square, dark replay arrow). Wordmark "ShiftReplay" Inter 800.
MOTION:  Title enter: per word, blur 6 px -> 0 and opacity 0 -> 1 in 0.13 s, words 0.067 s apart, no translate.
         Title exit: blur 0 -> 8 px and opacity -> 0 in 0.15 s, whole line. Landed titles are dead still.
         Caption enter: opacity 0 -> 1 in 0.2 s, power2.out, no translate; exit 0.12 s.
         Punch-in: scale 1 -> 1.6 on a wrapper in 0.5 s power2.inOut, then hold. Pull-out mirrored.
         Cursor: enters from off-frame in 0.6 s expo.out, moves 0.5 s power3.inOut, click = scale 0.86 for 3 frames.
         Whip cut: 0.2 s horizontal smear, incoming lands blurred and sharpens in 0.13 s.
         Dip cut: outgoing darkens 40% for 3 frames, then hard cut.
         End card: the mark drops in with a spring at damping 0.8 (back.out(1.2), 0.5 s), fill rises through it 0.4 s,
         wordmark wipes in with clip-path 0.4 s power3.out, the Start shift button pops 0.3 s, URL types over 0.8 s.
SHOTS:   f0-408 (0-13.6 s) PROLOGUE, the K3 problem before the product. Shot 1 walk.mp4 from 0: the sim's First
           Shift card, the gate, "Hold E" PPE check, slow push 1.0 -> 1.06. Shot 2 landing.mp4 from 20.8 s: the
           truck lane, a tractor coming, then passing close in third person. Four titles on the product's panel,
           Inter 700 76 px, left 120 / top 600, each on by word and off as a line:
           1.7-4.15 "SURABAYA · DAY ONE" (mono 30) + "Dimas, 22. / New yard checker."  4.45-7.15 "His K3 induction: /
           a slideshow and a signature."  7.95-11.15 "He has never stood / next to a moving tractor."
           11.45-13.35 "Today he does." as the tractor fills the frame. Whip out at 13.4 into the open lane card.
           Sound: ambience only at 1.0, a gull, the beeper; music fades in from 11.5 s at 0.4.
         Every time below is hook-relative; add 13.6 s for the film.
         f0-105 (0-3.5 s) HOOK. cross.mp4 from the open card, pushed 1.0 -> 1.25 on the options over 1.2 s. Cursor
           enters bottom-right, lands on A "Cross now. 40 m is plenty.", clicks at 3.5 s. Sound: bed at 0.35, click.
         f105-405 (3.5-13.5 s) TENSION. The replay: third-person lane, tractor at 32 km/h, captions from the sim,
           impact flash at about 7.7 s. Bed ducks to 0.08 at 3.5 s. impact-bass-1 on the flash.
           Title at 8.6 s, two lines, "See the accident / before it happens." (accent "before"), holds to 13.2 s.
         f405-525 (13.5-17.5 s) REVEAL. Near-miss card: "NEAR MISS — THIS IS WHAT WOULD HAVE HAPPENED", the why,
           UU No. 1/1970. Punch 1.0 -> 1.3 on the rule box at 15.5 s. Caption bottom: "A wrong call plays the
           consequence, then the rule." Bed back to 0.3 at 13.5 s.
         f525-645 (17.5-21.5 s) NAME. Whip to landing.mp4 orbit. Lower-left lockup: mark 72 px + "ShiftReplay",
           line 2 "Browser-only K3 safety sim. No headset." whoosh-short.
         f645-810 (21.5-27 s) PROOF 1. roles-walk.mp4 start screen; cursor clicks "Yard checker". Caption "Pick a job."
         f810-990 (27-33 s) PROOF 2. First-person walk toward the beacon; HUD objective visible. Caption "Walk the yard. Follow the beacon."
           Punch 1.4 on the mission panel at 29 s for 1.5 s, then out.
         f990-1140 (33-38 s) PROOF 3. cross.mp4 "choose again": A struck out, cursor clicks C, SAFE CALL card.
           Caption "Choose again. The wrong option stays struck out."
         f1140-1320 (38-44 s) PROOF 4. Action bar: marker sweeps, SPACE in the green window, check mark.
           Punch 1.6 on the bar. Caption "Then do the safe thing." click-soft on the hit.
         f1320-1590 (44-53 s) RANGE. load.mp4 (2.67 s), snapback.mp4 (2.66 s), height.mp4 (2.67 s), hard cuts inside, whips only on the seams, the sim's
           own red banners. Caption "Three jobs. Eleven calls. Five replays."
         f1590-1860 (53-62 s) PAYOFF. end.mp4 shift report; punch 1.5 onto the near-miss row at 55 s. Caption
           "The shift report keeps the call you replayed."
         f1860-2070 (62-69 s) CLAIM. landing.mp4 from 28.5 s (third person, then under the RTG); both titles on the panel. Title "The replay
           is the lesson." then line 2 "No headset. No account. No server." (from the README).
         f2070-2400 (69-80 s) END CARD. Dip to #0b0e12. riser from 59 s peaks at 69 s: mark lands with impact-bass-2,
           wordmark wipes in, button "Start shift →" (the product's yellow button), URL shiftreplay.vercel.app/play/.
           Holds 2070-2400 with nothing moving after 72.5 s.
BANNED:  a black or navy void with small UI floating in it; glow, bloom, particles; purple/blue gradients; glass cards
         other than the product's own panel; cream paper + serif; everything centred; fade-and-slide-up entrances;
         titles that drift after landing; three cards in a row; a title over a dimmed screenshot; the logo docked in a
         corner before the end card; a typed prompt as the opener; invented UI of any kind; product UI tilted in 3D;
         a voiceover (the maker narrates live).
QA:      f0 card readable, cursor off-frame. f105 cursor on A, pressed. f231 (7.7 s) flash frame. f300 title landed,
         replay behind. f450 near-miss card, rule readable. f600 landing orbit + lockup. f700 cursor on Yard checker.
         f1000 A struck out. f1200 marker inside window. f1400 snap-back banner. f1700 report row punched.
         f2000 claim line 2. f2250 end card complete, nothing moving. 360 px sheet: every caption readable.
