import * as THREE from 'three';
import { buildWorld, makeWorker } from './world.js';
import { Player } from './player.js';
import { ROLES } from './scenario.js';
import { HazardRunner } from './hazards.js';
import { UI } from './ui.js';
import { PortAudio } from './audio.js';

const app = document.getElementById('app');
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.72;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 1200);
const world = buildWorld(scene, renderer);
const player = new Player(camera, renderer.domElement, world.colliders);
const body = makeWorker(0xff8c1a); scene.add(body); player.setBody(body);
const ui = new UI();
const audio = new PortAudio();
const runner = new HazardRunner({ camera, world, player, ui, audio });

ui.onRole = (role) => { audio.start(); ui.hideStart(); runner.setRole(role); runner.begin(); player.lock(); };
ui.onLang = () => { if (runner.role) runner.syncHud(); };
ui.onSound = () => { audio.setEnabled(!audio.enabled); ui.setSound(audio.enabled); };
ui.onView = () => player.toggleView();
player.onView = (v) => ui.setView(v);
ui.setView(player.view);
renderer.domElement.addEventListener('click', () => { if (runner.state === 'walk' || runner.state === 'action') player.lock(); });
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

// Recording / debug helpers.
//   ?role=checker|operator|lashing   pick a role without the start screen
//   ?at=N        jump to checkpoint N (1-based) and open it     ?replay=T  also play the first wrong option's replay from time T
//   ?action=1    open checkpoint N's action step instead         ?end=1     show the shift report   ?shot=1  just skip the start screen
const q = new URLSearchParams(location.search);
if (q.has('at') || q.has('shot') || q.has('end') || q.has('role')) {
  const role = ROLES.find((r) => r.id === q.get('role')) || ROLES[0];
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

const clock = new THREE.Clock();
function frame() {
  const dt = Math.min(0.05, clock.getDelta());
  world.update(dt); player.update(dt); runner.update(dt);
  ui.setHeading(player.yaw);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
