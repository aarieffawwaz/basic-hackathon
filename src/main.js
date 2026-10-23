import * as THREE from 'three';
import { buildWorld } from './world.js';
import { Player } from './player.js';
import { HAZARDS } from './scenario.js';
import { HazardRunner } from './hazards.js';
import { UI } from './ui.js';

const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd6e8);
scene.fog = new THREE.Fog(0xbfd6e8, 70, 190);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 400);

const world = buildWorld(scene);
const player = new Player(camera, renderer.domElement, world.colliders);
const ui = new UI();
const runner = new HazardRunner({ camera, world, player, ui, hazards: HAZARDS });

ui.onStart(() => { ui.hideStart(); player.lock(); runner.begin(); });
ui.onLang = () => { if (runner.state === 'walk') runner.syncHud(); };

// click anywhere on the canvas to re-lock the mouse after Esc
renderer.domElement.addEventListener('click', () => { if (runner.state === 'walk') player.lock(); });

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Dev / recording helpers: ?at=N jumps to checkpoint N (1-based) and triggers it.
// ?replay=1 additionally plays the first wrong option's replay. ?shot=1 skips the start screen.
const q = new URLSearchParams(location.search);
if (q.has('at') || q.has('shot')) {
  const n = Math.max(1, Math.min(HAZARDS.length, Number(q.get('at') || 1))) - 1;
  const h = HAZARDS[n];
  ui.hideStart();
  runner.begin();
  for (let i = 0; i < n; i++) runner.results[i] = 'pass';
  runner.idx = n;
  player.setPosition(h.zone.x, h.zone.z + 6, 0);
  runner.syncHud();
  if (q.has('at')) {
    runner.trigger(n);
    if (q.has('replay')) {
      const wrong = h.options.findIndex((o) => !o.correct);
      runner.choose(wrong);
      if (q.get('replay') !== '1') runner.replayT = Number(q.get('replay'));
    }
  }
}

// ?end=1 renders the shift report directly (for screenshots).
if (q.has("end")) {
  ui.hideStart();
  runner.results = ["pass", "near", "pass", "pass", "near"];
  ui.showEnd({ hazards: HAZARDS, results: runner.results, seconds: 212 }, () => runner.restart());
}

const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(0.05, clock.getDelta());
  world.update(dt);
  player.update(dt);
  runner.update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
