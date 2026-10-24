import * as THREE from 'three';
import { buildWorld } from './world.js';
import { setupPost } from './post.js';
import { play, frameHTML } from 'ascii-magic-art/runtime/player.js';
import { Grid, bigText } from 'ascii-magic-art/lib/kit.js';
import * as dottedRule from 'ascii-magic-art/pieces/dotted-rule.js';
import * as terminalPiece from './ascii/terminal.js';
import * as wordmarkPiece from './ascii/wordmark.js';

// Hero background: the real yard. Same world module as the sim, so the landing page never shows
// something the product does not have. The hero is pinned for 320vh; scroll position drives the
// camera from a wide orbit down to first person at the gate, the truck lane and the crane block.
const canvas = document.getElementById('hero3d');
const hero = document.querySelector('.hero');
const nav = document.querySelector('.nav');
const heroInner = document.querySelector('.hero-inner');
const steps = [...document.querySelectorAll('.hero-step')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.85;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 1200);
const world = buildWorld(scene, renderer);
const post = setupPost(renderer, scene, camera, { bloom: 0.22 });
world.setBeacon(0, 43, true);
world.setShadowCenter(0, 20);

function size() { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); post.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
size(); addEventListener('resize', size);

// Camera path. Layout from world.js: gate z=40, truck lane z 14..22, RTG crane z=-12.
// Key 0 is the orbit (time based), the rest are fixed shots. Progress 0..1 across the pinned hero.
const KEYS = [
  { at: 0.00, pos: null, look: [0, 4, -8] },                       // wide orbit (position computed per frame)
  { at: 0.28, pos: [0, 1.7, 47], look: [0, 1.6, 36] },             // 01 at the gate, first person
  { at: 0.52, pos: [0, 1.7, 26.5], look: [-9, 2.4, 12] },           // 02 the truck lane, looking up the lane for the tractor
  { at: 0.74, pos: [7, 4.5, 21], look: [0, 1, 17] },               // 03 third person, replay angle
  { at: 1.00, pos: [0, 1.7, 3], look: [0, 7, -12] },               // 04 under the RTG
];
const STEP_AT = [0.18, 0.44, 0.66, 0.88]; // when each caption lands

const smooth = (x) => x * x * (3 - 2 * x);
const v = { a: new THREE.Vector3(), b: new THREE.Vector3(), pos: new THREE.Vector3(), look: new THREE.Vector3() };
function orbitPos(t, out) { const a = t * 0.06; return out.set(Math.sin(a) * 42, 14 + Math.sin(t * 0.2) * 2, 10 + Math.cos(a) * 42); }
function sample(p, t) {
  let i = 0; while (i < KEYS.length - 2 && p > KEYS[i + 1].at) i++;
  const k0 = KEYS[i], k1 = KEYS[i + 1];
  const u = smooth(THREE.MathUtils.clamp((p - k0.at) / (k1.at - k0.at), 0, 1));
  (k0.pos ? v.a.fromArray(k0.pos) : orbitPos(t, v.a));
  v.b.fromArray(k1.pos);
  v.pos.lerpVectors(v.a, v.b, u);
  v.look.lerpVectors(v.a.fromArray(k0.look), v.b.fromArray(k1.look), u);
}

// Scroll progress, smoothed with a critically damped follow so a fast flick does not teleport the camera.
let scrollY = 0, progress = 0, shown = -1;
addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
function heroProgress() { const track = hero.offsetHeight - innerHeight; return track > 0 ? THREE.MathUtils.clamp(scrollY / track, 0, 1) : 0; }

const clock = new THREE.Clock(); let t = 0;
function frame() {
  const dt = Math.min(0.05, clock.getDelta()); t += dt;
  const target = reduceMotion ? 0 : heroProgress();
  progress += (target - progress) * (1 - Math.exp(-dt * 7));
  if (Math.abs(target - progress) < 0.0005) progress = target;

  // chrome: nav material, hero text fade, step captions
  nav.classList.toggle('scrolled', scrollY > 40);
  hero.classList.toggle('past', progress > 0.04);
  const fade = 1 - THREE.MathUtils.clamp(progress / 0.16, 0, 1);
  heroInner.style.opacity = fade; heroInner.style.transform = `translateY(${(1 - fade) * -24}px)`;
  heroInner.style.pointerEvents = fade < 0.2 ? 'none' : '';
  let cur = -1; for (let i = 0; i < STEP_AT.length; i++) if (progress >= STEP_AT[i]) cur = i;
  if (cur !== shown) { steps.forEach((s, i) => s.classList.toggle('on', i === cur)); shown = cur; }

  if (scrollY < hero.offsetHeight) {
    world.update(dt);
    sample(progress, t);
    camera.position.copy(v.pos);
    if (progress < 0.28) camera.position.y += scrollY * 0.004 * (1 - progress / 0.28);
    camera.lookAt(v.look);
    post.render();
  }
  requestAnimationFrame(frame);
}
frame();

// Footer: animated ASCII terminal (plays only while on screen, still frame under reduced motion)
// and the block-letter wordmark, rendered once as text.
play(document.getElementById('ascii-terminal'), terminalPiece, { maxFps: 12 });
play(document.getElementById('ascii-wordmark'), wordmarkPiece, { maxFps: 24 });

// Section rules: the library's dotted rule, drawn in one colour so it sits in our palette.
for (const pre of document.querySelectorAll('.ascii-rule')) play(pre, dottedRule, { look: { mono: true }, maxFps: 24 });

// Step numbers in the kit's 3x5 block digits.
for (const pre of document.querySelectorAll('.digit[data-n]')) {
  const g = new Grid(8, 5);
  bigText(g, 0, 0, pre.dataset.n, '0');
  pre.innerHTML = frameHTML(g.frame(), { 0: '#f5c518' });
}
