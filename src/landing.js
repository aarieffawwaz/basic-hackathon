import * as THREE from 'three';
import { buildWorld } from './world.js';
import { setupPost } from './post.js';

// Hero background: the real yard, slow orbit. Same world module as the sim, so the landing page
// never shows something the product does not have.
const canvas = document.getElementById('hero3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.65;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 1200);
const world = buildWorld(scene, renderer);
const post = setupPost(renderer, scene, camera, { bloom: 0.22 });
world.setBeacon(0, 0, false);
world.setShadowCenter(0, -6);

function size() { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); post.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
size(); addEventListener('resize', size);

const clock = new THREE.Clock(); let t = 0;
let scrollY = 0; addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
function frame() {
  const dt = Math.min(0.05, clock.getDelta()); t += dt;
  world.update(dt);
  const a = t * 0.06;
  camera.position.set(Math.sin(a) * 42, 14 + Math.sin(t * 0.2) * 2 + scrollY * 0.02, 10 + Math.cos(a) * 42);
  camera.lookAt(0, 4, -8);
  if (scrollY < innerHeight) post.render();
  requestAnimationFrame(frame);
}
frame();

// Cursor-tracking glow on role cards.
for (const card of document.querySelectorAll('.role')) {
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
}
