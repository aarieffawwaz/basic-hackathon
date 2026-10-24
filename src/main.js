import * as THREE from 'three';
import { buildWorld, makeWorker } from './world.js';
import { Player } from './player.js';
import { ROLES } from './scenario.js';
import { HazardRunner } from './hazards.js';
import { UI } from './ui.js';
import { PortAudio } from './audio.js';
import { setupPost } from './post.js';
import { createMode } from './modes/index.js';

const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.72;
app.appendChild(renderer.domElement);

// Loading bar on the start panel: the HDRI and PBR sets all go through three's default manager.
// The cards stay clickable meanwhile; each surface keeps its procedural fallback until its file lands.
const loading = document.getElementById('loading'), loadFill = document.getElementById('loading-fill');
THREE.DefaultLoadingManager.onProgress = (_, done, total) => { loadFill.style.transform = `scaleX(${0.1 + (0.9 * done) / total})`; };
THREE.DefaultLoadingManager.onLoad = () => loading.classList.add('done');
setTimeout(() => loading.classList.add('done'), 20000);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(64, innerWidth / innerHeight, 0.1, 1200);
const world = buildWorld(scene, renderer);
const post = setupPost(renderer, scene, camera, { bloom: 0.16 });
const player = new Player(camera, renderer.domElement, world.colliders);
const body = makeWorker(0xff8c1a); scene.add(body); player.setBody(body);
const ui = new UI();
const audio = new PortAudio();
const runner = new HazardRunner({ camera, world, player, ui, audio });

// One controller owns the shift: the walk-and-decide runner, or a hands-on mode (src/modes).
let active = runner;
function startRole(role) {
  if (active !== runner) active.dispose();
  runner.state = 'idle'; ui.hideCard(); ui.hideAction(); ui.hideEnd();
  world.paused = false; world.craneManual = false; world.setTrucksVisible(true);
  player.setBodyVisible(true); player.enabled = false;
  if (role.mode) { active = createMode(role, { camera, world, player, ui, audio }); active.begin(); }
  else { active = runner; runner.setRole(role); runner.begin(); }
  if (active.usesPlayer !== false) player.lock();
}
ui.onRole = (role) => { audio.start(); ui.hideStart(); startRole(role); };
ui.onLang = () => { if (active.role) active.syncHud(); };
ui.onSound = () => { audio.setEnabled(!audio.enabled); ui.setSound(audio.enabled); };
ui.onView = () => player.toggleView();
player.onView = (v) => ui.setView(v);
ui.setView(player.view);
renderer.domElement.addEventListener('click', () => { if (active === runner ? (runner.state === 'walk' || runner.state === 'action') : active.wantsLock()) player.lock(); });
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); post.setSize(innerWidth, innerHeight); });

// Recording / debug helpers.
//   ?role=checker|operator|lashing   pick a role without the start screen
//   ?at=N        jump to checkpoint N (1-based) and open it     ?replay=T  also play the first wrong option's replay from time T
//   ?action=1    open checkpoint N's action step instead         ?end=1     show the shift report   ?shot=1  just skip the start screen
const q = new URLSearchParams(location.search);
const qRole = ROLES.find((r) => r.id === q.get('role'));
if (qRole?.mode) { ui.hideStart(); startRole(qRole); if (q.has('at')) active.jumpTo?.(Number(q.get('at')) - 1, q.has('replay')); }
else if (q.has('at') || q.has('shot') || q.has('end') || q.has('role')) {
  const role = qRole || ROLES[0];
  ui.hideStart(); runner.setRole(role); runner.begin();
  const n = Math.max(1, Math.min(role.hazards.length, Number(q.get('at') || 1))) - 1;
  const h = role.hazards[n];
  for (let i = 0; i < n; i++) runner.results[i] = 'pass';
  runner.idx = n; runner.syncHud();
  if (q.has('at')) {
    player.setPosition(h.zone.x, h.zone.z + 6, 0);
    if (q.has('action')) { runner.results[n] = 'pass'; runner.startAction(h); }
    else {
      runner.trigger(n);
      if (q.has('replay')) { const wrong = h.options.findIndex((o) => !o.correct); runner.choose(wrong); if (q.get('replay') !== '1') runner.replayT = Number(q.get('replay')); }
    }
  }
  if (q.has('end')) { runner.results = role.hazards.map((_, i) => (i % 2 ? 'near' : 'pass')); ui.showEnd({ role, hazards: role.hazards, results: runner.results, seconds: 212 }, () => runner.restart(), () => ui.showRoles()); }
}

// Dev only: step the active controller from the console (window.__sim.step(seconds)).
if (import.meta.env.DEV) window.__sim = { get active() { return active; }, world, player, step(sec, dt = 1 / 60) { for (let t = 0; t < sec; t += dt) { world.update(dt); if (active.usesPlayer !== false) player.update(dt); active.update(dt); } } };

const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(0.05, clock.getDelta());
  world.update(dt);
  if (active.usesPlayer !== false) player.update(dt);
  active.update(dt);
  world.setShadowCenter(camera.position.x, camera.position.z);
  ui.setHeading(player.yaw);
  post.render();
  requestAnimationFrame(frame);
}
frame();
