import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { containerMaps, containerDoorMaps, asphaltMaps, concreteMaps, paintedMaps, hazardStripe, signText, vestMaps, paintText, contactShadow, waterNormal } from './textures.js';

// Container terminal built from primitives + procedural textures. No model files.
// Layout (metres): spawn z=48 facing -z. Gate z=40. Truck lane z 14..22.
// Container blocks either side of the corridor (|x| < 4.4) from z=-6 to z=-34.
// RTG straddles the corridor at z=-12 holding a container. Site office z=-46. Quay + STS cranes z≈-120.

const C = { line: 0xf5c518, walk: 0x2f9e5b, white: 0xf2f2f2, steel: 0x2f4fd6, steelDark: 0x1b2340, cabin: 0xe4e8ee, tyre: 0x15171a,
  containers: [0x9e3a30, 0x2f5f8f, 0x3a7d5c, 0xb8912a, 0x6b7177, 0xb5652a, 0x5c4a86, 0x2c6a70] };

let SCENE, STD;
const std = (opts) => new THREE.MeshStandardMaterial({ roughness: 0.75, metalness: 0.15, ...opts });
function box(w, h, d, mat, x, y, z, { shadow = true, parent } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof mat === 'number' ? std({ color: mat }) : mat);
  m.position.set(x, y, z); m.castShadow = shadow; m.receiveShadow = true;
  (parent || SCENE).add(m); return m;
}
function plane(w, d, mat, x, z, y = 0.01, parent) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), typeof mat === 'number' ? std({ color: mat }) : mat);
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true;
  (parent || SCENE).add(m); return m;
}

// ---- Containers -------------------------------------------------------------------
const containerMats = [];
function containerMaterial(idx) {
  if (!containerMats[idx]) {
    const color = C.containers[idx % C.containers.length];
    const side = containerMaps(color, idx), door = containerDoorMaps(color);
    const sideMat = std({ map: side.map, bumpMap: side.bump, bumpScale: 0.35, roughness: 0.52, metalness: 0.4, envMapIntensity: 0.9 });
    const endMat = std({ map: door.map, roughness: 0.55, metalness: 0.4, envMapIntensity: 0.9 });
    const topMat = std({ map: side.map, bumpMap: side.bump, bumpScale: 0.3, roughness: 0.7, metalness: 0.3 });
    // BoxGeometry material order: +x, -x, +y, -y, +z, -z
    containerMats[idx] = [endMat, endMat, topMat, topMat, sideMat, sideMat];
  }
  return containerMats[idx];
}
const castingGeo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
const castingMat = std({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.5 });
let castings; const castingPos = [];
// frame members (corner posts, long rails, end rails) — darkened steel that catches AO and edge light
const frameMat = std({ color: 0x1e2126, roughness: 0.5, metalness: 0.6 });
const postGeo = new THREE.BoxGeometry(0.2, 2.6, 0.2), railLGeo = new THREE.BoxGeometry(12.19, 0.16, 0.16), railSGeo = new THREE.BoxGeometry(0.16, 0.16, 2.44);
const framePos = { post: [], railL: [], railS: [] };
function frameParts(len) {
  const parts = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) parts.push(['post', sx * (len / 2 - 0.1), 1.3, sz * 1.12]);
  for (const sy of [0.08, 2.52]) for (const sz of [-1, 1]) parts.push(['railL', 0, sy, sz * 1.14]);
  for (const sy of [0.08, 2.52]) for (const sx of [-1, 1]) parts.push(['railS', sx * (len / 2 - 0.08), sy, 0]);
  return parts;
}
export function makeContainer(len, color, x, y, z, parent) {
  const idx = Math.max(0, C.containers.indexOf(color)) || (typeof color === 'number' ? Math.abs(color) % C.containers.length : 0);
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(len, 2.6, 2.44), containerMaterial(idx));
  body.position.y = 1.3; body.castShadow = true; body.receiveShadow = true; g.add(body);
  // corner castings — for the static yard they are batched into one InstancedMesh; replays/trucks get plain meshes
  for (const sx of [-1, 1]) for (const sy of [0, 1]) for (const sz of [-1, 1]) {
    const p = [sx * (len / 2 - 0.15), sy * 2.45 + 0.15, sz * 1.07];
    if (parent === undefined && castings === null) castingPos.push([x + p[0], y + p[1], z + p[2]]);
    else { const m = new THREE.Mesh(castingGeo, castingMat); m.position.set(...p); g.add(m); }
  }
  for (const [kind, px, py, pz] of frameParts(len)) {
    if (parent === undefined && castings === null) framePos[kind].push([x + px, y + py, z + pz]);
    else if (Math.abs(len - 12.19) < 0.01) { const geo = { post: postGeo, railL: railLGeo, railS: railSGeo }[kind]; const m = new THREE.Mesh(geo, frameMat); m.position.set(px, py, pz); g.add(m); }
  }
  g.position.set(x, y, z); (parent || SCENE).add(g); return g;
}

// ---- Worker rig: head with face, helmet, vest, pivoting arms and legs -------------------
const skinMat = std({ color: 0xc98e63, roughness: 0.9 });
const vestCache = {};
function faceTexture() {
  const c = document.createElement('canvas'); c.width = 128; c.height = 64; const ctx = c.getContext('2d');
  ctx.fillStyle = '#c98e63'; ctx.fillRect(0, 0, 128, 64);
  ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(52, 28, 3.2, 0, 7); ctx.arc(76, 28, 3.2, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(46, 18, 14, 2.5); ctx.fillRect(70, 18, 14, 2.5);  // brows
  ctx.strokeStyle = '#5a2e1c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(56, 44); ctx.quadraticCurveTo(64, 48, 72, 44); ctx.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.offset.x = 0.25; return t;
}
let FACE;
export function makeWorker(vest = 0xff8c1a, helmet = true) {
  FACE ||= faceTexture();
  const g = new THREE.Group();
  const vestMat = vestCache[vest] ||= std({ map: vestMaps(vest).map, roughness: 0.9 });
  const legMat = std({ color: 0x2b3a67, roughness: 0.95 });
  const mk = (geo, mat, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };
  // legs pivot at the hip (y=0.85)
  const legs = [];
  for (const sx of [-0.12, 0.12]) {
    const hip = new THREE.Group(); hip.position.set(sx, 0.85, 0); g.add(hip);
    mk(new THREE.CapsuleGeometry(0.095, 0.62, 4, 10), legMat, 0, -0.4, 0, hip);
    mk(new THREE.BoxGeometry(0.19, 0.12, 0.3), std({ color: 0x1a1a1a }), 0, -0.78, 0.04, hip);   // boot
    legs.push(hip);
  }
  const torso = mk(new THREE.CapsuleGeometry(0.21, 0.34, 4, 12), vestMat, 0, 1.18, 0); torso.scale.set(1, 1, 0.68);
  mk(new THREE.BoxGeometry(0.46, 0.08, 0.28), std({ color: 0xd9d9d9, emissive: 0x9a9a9a, emissiveIntensity: 0.25 }), 0, 1.3, 0);  // reflective band
  const arms = [];
  for (const sx of [-0.3, 0.3]) {
    const sh = new THREE.Group(); sh.position.set(sx, 1.42, 0); g.add(sh);
    mk(new THREE.CapsuleGeometry(0.065, 0.42, 4, 10), std({ color: 0x3a4a78 }), 0, -0.27, 0, sh);
    mk(new THREE.SphereGeometry(0.07, 8, 6), skinMat, 0, -0.57, 0, sh);                           // hand
    arms.push(sh);
  }
  const head = mk(new THREE.SphereGeometry(0.19, 16, 12), std({ map: FACE, roughness: 0.9 }), 0, 1.72, 0);
  // body front is +z (boots point +z); the face texture is centred on +z via its offset, so no head rotation
  if (helmet) {
    mk(new THREE.SphereGeometry(0.225, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: 0xf5c518, roughness: 0.4 }), 0, 1.74, 0);
    mk(new THREE.CylinderGeometry(0.26, 0.26, 0.02, 14), std({ color: 0xf5c518, roughness: 0.4 }), 0, 1.74, 0.02);
  }
  g.userData = { legs, arms, torso, head, phase: Math.random() * 6 };
  return g;
}
// Swing arms/legs; amount 0 = standing. Call every frame for anyone who moves.
export function animateWorker(w, t, amount = 1) {
  const u = w.userData; if (!u.legs) return;
  const s = Math.sin((t * 6) + u.phase) * 0.55 * amount;
  u.legs[0].rotation.x = s; u.legs[1].rotation.x = -s;
  u.arms[0].rotation.x = -s * 0.8; u.arms[1].rotation.x = s * 0.8;
  u.torso.position.y = 1.18 + Math.abs(Math.sin(t * 12 + u.phase)) * 0.015 * amount;
}

// ---- Trucks -----------------------------------------------------------------------
export function makeTruck(color) {
  const g = new THREE.Group();
  box(9.5, 0.45, 2.5, std({ color: 0x1b2340, metalness: 0.4 }), 0, 0.8, 0, { parent: g });
  const cab = new THREE.Mesh(new RoundedBoxGeometry(2.4, 2.3, 2.5, 3, 0.18), std({ color: C.cabin, roughness: 0.35, metalness: 0.35, envMapIntensity: 1.0 })); cab.position.set(3.7, 2.15, 0); cab.castShadow = true; g.add(cab);
  for (const z of [-0.9, 0.9]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.25, 0.4), new THREE.MeshStandardMaterial({ color: 0xfff6d5, emissive: 0xfff2c0, emissiveIntensity: 1.6 })); hl.position.set(4.92, 1.6, z); g.add(hl); }
  box(1.2, 0.9, 2.3, std({ color: 0x0f1a2e, roughness: 0.1, metalness: 0.6 }), 4.35, 2.55, 0, { parent: g });   // windscreen
  box(0.2, 0.3, 0.4, 0x222, 4.9, 2.3, 1.35, { parent: g }); box(0.2, 0.3, 0.4, 0x222, 4.9, 2.3, -1.35, { parent: g }); // mirrors
  box(1.0, 0.4, 2.3, 0xd9d9d9, 4.6, 1.3, 0, { parent: g });   // bumper
  makeContainer(6.06, color, -1.5, 1.02, 0, g);
  const tyre = std({ color: C.tyre, roughness: 0.95 }), hub = std({ color: 0x8a8f96, metalness: 0.6, roughness: 0.4 });
  for (const [x, z] of [[3.4, 1.2], [3.4, -1.2], [-2.4, 1.2], [-2.4, -1.2], [-3.8, 1.2], [-3.8, -1.2]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.42, 16), tyre); w.rotation.x = Math.PI / 2; w.position.set(x, 0.52, z); w.castShadow = true; g.add(w);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.44, 12), hub); h.rotation.x = Math.PI / 2; h.position.set(x, 0.52, z); g.add(h);
  }
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb000 })); b.position.set(3.7, 3.4, 0); g.add(b);
  g.userData.beacon = b;
  g.userData.wheels = g.children.filter((m) => m.geometry?.type === 'CylinderGeometry');
  contact(12, 3.6, 0.5, 0, g, 0.6);
  return g;
}

// ---- World ------------------------------------------------------------------------
let SHADOW_TEX;
function contact(w, d, x, z, parent, opacity = 0.75) {
  SHADOW_TEX ||= contactShadow();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, opacity, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.045, z); m.renderOrder = 1; (parent || SCENE).add(m); return m;
}

export function buildWorld(scene, renderer) {
  SCENE = scene; castings = null;
  const colliders = [];
  const addCollider = (minX, maxX, minZ, maxZ) => colliders.push({ minX, maxX, minZ, maxZ });

  // Sky + environment lighting
  const sky = new Sky(); sky.scale.setScalar(2000); scene.add(sky);
  const u = sky.material.uniforms;
  u.turbidity.value = 9; u.rayleigh.value = 2.6; u.mieCoefficient.value = 0.012; u.mieDirectionalG.value = 0.93;
  const sunDir = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - 24), THREE.MathUtils.degToRad(150));
  u.sunPosition.value.copy(sunDir);
  if (renderer) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const skyScene = new THREE.Scene(); skyScene.add(sky.clone());
    scene.environment = pmrem.fromScene(skyScene, 0.04).texture;
    scene.environmentIntensity = 0.3;
    skyScene.clear();
  }
  scene.fog = new THREE.FogExp2(0xaebbc8, 0.0026);
  scene.add(new THREE.HemisphereLight(0xbfd3ea, 0x3a3f45, 0.35));
  const sun = new THREE.DirectionalLight(0xffe7c4, 1.7);
  sun.position.copy(sunDir).multiplyScalar(90); sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0002; sun.shadow.normalBias = 0.04; 
  // Tight shadow box that follows the player; its position is snapped to the shadow texel grid
  // so the shadow edges do not swim ("jitter") while walking.
  Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 320 });
  scene.add(sun); scene.add(sun.target);
  const shadowTexel = 110 / 4096;
  const setShadowCenter = (x, z) => {
    const sx = Math.round(x / shadowTexel) * shadowTexel, sz = Math.round(z / shadowTexel) * shadowTexel;
    sun.target.position.set(sx, 0, sz);
    sun.position.copy(sunDir).multiplyScalar(140).add(sun.target.position);
    sun.target.updateMatrixWorld();
  };
  setShadowCenter(0, 10);

  // Ground + markings
  const asphalt = asphaltMaps();
  plane(300, 300, std({ map: asphalt.map, normalMap: asphalt.normal, normalScale: new THREE.Vector2(0.6, 0.6), roughnessMap: asphalt.rough, roughness: 1, metalness: 0, envMapIntensity: 0.15 }), 0, -20, 0);
  const concrete = concreteMaps();
  plane(40, 14, std({ map: concrete.map, roughness: 0.95 }), 0, 45, 0.015);                      // gate apron
  const walkMat = std({ map: paintedMaps('#2c8a52', 0.45).map, roughness: 0.9 });
  plane(2.2, 104, walkMat, 0, -4, 0.02);
  plane(2.2, 60, walkMat, 0, -80, 0.02);                                                        // on to the quay
  for (let z = -108; z < 50; z += 2) if (z < -50 || z > -44) plane(1.8, 0.25, C.white, 0, z, 0.03);
  // snap-back zone on the quay: red hatched
  const hatch = std({ map: paintedMaps('#c0392b', 0.5).map, roughness: 0.9 });
  plane(16, 10, std({ color: 0x7a1f1f, transparent: true, opacity: 0.35 }), 4, -102, 0.025);
  for (let i = -7; i <= 7; i += 2) { const h = plane(0.4, 10, hatch, 4 + i, -102, 0.03); h.rotation.z = 0.5; }
  for (const x of [-8, 6, 20, 34, -22]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.1, 14), std({ color: 0x1a1a1a, metalness: 0.6, roughness: 0.5 })); b.position.set(x, 0.55, -110); b.castShadow = true; scene.add(b); addCollider(x - 0.7, x + 0.7, -110.7, -109.3); }
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 46, 6), std({ color: 0xd8cfae, roughness: 0.9 })); rope.position.set(10, 4.5, -133); rope.rotation.set(Math.PI / 2 - 0.37, 0, 0.3); scene.add(rope);
  // gangway from quay up to the ship
  const gang = new THREE.Group(); gang.position.set(-2, 0, -112); gang.rotation.x = -0.62;
  box(1.6, 0.12, 22, std({ color: 0xb8bcc2, metalness: 0.6, roughness: 0.4 }), 0, 0, -11, { parent: gang });
  for (const sx of [-0.8, 0.8]) { box(0.05, 1.0, 22, 0x9aa3ad, sx, 0.55, -11, { parent: gang }); for (let z = -1; z > -22; z -= 2) box(0.05, 1.0, 0.05, 0x9aa3ad, sx, 0.5, z, { parent: gang }); }
  scene.add(gang);
  const yellow = std({ map: paintedMaps('#f5c518', 0.4).map, roughness: 0.85 });
  plane(140, 0.3, yellow, 0, 14, 0.03); plane(140, 0.3, yellow, 0, 22, 0.03);
  plane(3.4, 0.4, yellow, 0, 23.4, 0.04);
  const stop = plane(3.0, 0.95, new THREE.MeshStandardMaterial({ map: paintText('STOP'), transparent: true, roughness: 0.9 }), 0, 24.6, 0.045);
  for (const [x, dir] of [[-20, 1], [20, -1]]) { const a = plane(2.4, 0.8, new THREE.MeshStandardMaterial({ map: paintText(dir > 0 ? '→' : '←', { size: 120 }), transparent: true }), x, dir > 0 ? 16 : 20, 0.04); a.rotation.z = Math.PI; }
  for (let x = -1.2; x <= 1.2; x += 0.8) plane(0.4, 8, std({ map: paintedMaps('#f2f2f2', 0.45).map }), x, 18, 0.03);
  // tyre wear on the lane
  const wear = std({ color: 0x2b2e33, transparent: true, opacity: 0.35, roughness: 1 });
  for (const z of [15.2, 16.8, 19.2, 20.8]) plane(140, 0.5, wear, 0, z, 0.025);
  // puddles
  const puddle = std({ color: 0x3a4652, roughness: 0.05, metalness: 0.9, transparent: true, opacity: 0.85 });
  for (const [x, z, r] of [[-14, 30, 3], [18, 8, 2.2], [-28, 2, 4], [8, 34, 1.6], [-5, -40, 2.5]]) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(r, 24), puddle); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.022, z); p.scale.x = 1.6; scene.add(p);
  }

  // Gate + PPE station
  const stripe = std({ map: hazardStripe(), roughness: 0.6 });
  box(0.5, 4.5, 0.5, C.white, -3.2, 2.25, 40); box(0.5, 4.5, 0.5, C.white, 3.2, 2.25, 40);
  box(0.6, 1.2, 0.6, stripe, -3.2, 0.6, 40); box(0.6, 1.2, 0.6, stripe, 3.2, 0.6, 40);
  const bar = box(0.15, 4.2, 0.15, std({ color: 0xd62828, roughness: 0.4 }), -3.0, 4.2, 40); bar.rotation.z = 0.25;
  box(4, 1.0, 4, 0x2b3a67, 7, 0.5, 44); box(4.2, 0.1, 4.2, C.white, 7, 1.05, 44);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), std({ map: signText(['WAJIB APD', 'Helm · Rompi · Sepatu', 'PPE REQUIRED BEYOND THIS POINT']), roughness: 0.6 }));
  sign.position.set(7, 2.9, 42.4); scene.add(sign);
  box(0.2, 1.9, 0.2, 0x333, 5.2, 1.0, 42.5); box(0.2, 1.9, 0.2, 0x333, 8.8, 1.0, 42.5);
  for (const x of [5.8, 7, 8.2]) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), std({ color: C.line, roughness: 0.4 })); h.position.set(x, 1.1, 44); h.castShadow = true; scene.add(h); }
  addCollider(4.9, 9.1, 41.9, 46.1); addCollider(-3.5, -2.9, 39.7, 40.3); addCollider(2.9, 3.5, 39.7, 40.3);
  for (const side of [-1, 1]) {
    const f = box(50, 2.2, 0.08, std({ color: 0x9aa3ad, transparent: true, opacity: 0.45, roughness: 0.5, metalness: 0.6 }), side * 28.5, 1.1, 40, { shadow: false });
    for (let i = 0; i < 12; i++) box(0.12, 2.4, 0.12, 0x6b7280, side * (4 + i * 4.3), 1.2, 40);
    addCollider(side > 0 ? 3.5 : -53.5, side > 0 ? 53.5 : -3.5, 39.6, 40.4);
  }
  // crossing signs + bollards
  const crossSign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), std({ map: signText(['STOP · LOOK · WAVE', 'Tunggu lambaian pengemudi'], { bg: '#ffffff', fg: '#c0392b' }), roughness: 0.5 }));
  crossSign.position.set(2.6, 2.4, 24.5); crossSign.rotation.y = Math.PI; scene.add(crossSign);
  box(0.12, 2.6, 0.12, 0x6b7280, 2.6, 1.3, 24.6);
  for (const x of [-2.6, 2.6]) for (const z of [13.2, 22.8]) { box(0.35, 1.0, 0.35, stripe, x, 0.5, z); }
  for (const x of [-1.6, 1.6]) { const cone = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 10), std({ color: 0xff5a1f, roughness: 0.6 })); cone.position.set(x, 0.3, 23.6); cone.castShadow = true; scene.add(cone); }

  // Container blocks
  let seed = 7; const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const columns = [-30.5, -17.5, 10.5, 23.5, 36.5, -43.5, 49.5];
  for (const cx of columns) {
    for (let z = -6; z >= -34; z -= 2.9) {
      const key = `${cx},${z.toFixed(1)}`;
      const forced = { '10.5,-23.4': 2, '10.5,-20.5': 1, '10.5,-26.3': 1 }[key];
      const h = forced ?? 1 + Math.floor(rnd() * 3);
      for (let i = 0; i < h; i++) makeContainer(12.19, C.containers[Math.floor(rnd() * C.containers.length)], cx, i * 2.6, z);
      contact(15, 4.4, cx, z);
      addCollider(cx - 6.1, cx + 6.1, z - 1.22, z + 1.22);
    }
  }
  // a second, lower block band beyond the office for depth
  for (const cx of [-30.5, -17.5, 10.5, 23.5, 36.5]) for (let z = -56; z >= -72; z -= 2.9) {
    const h = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < h; i++) makeContainer(12.19, C.containers[Math.floor(rnd() * C.containers.length)], cx, i * 2.6, z);
  }
  // batch all static corner castings into one draw call
  castings = new THREE.InstancedMesh(castingGeo, castingMat, castingPos.length);
  const m4 = new THREE.Matrix4();
  castingPos.forEach((p, i) => { m4.setPosition(p[0], p[1], p[2]); castings.setMatrixAt(i, m4); });
  castings.castShadow = true; scene.add(castings);
  for (const [kind, geo] of [['post', postGeo], ['railL', railLGeo], ['railS', railSGeo]]) {
    const list = framePos[kind]; if (!list.length) continue;
    const im = new THREE.InstancedMesh(geo, frameMat, list.length);
    list.forEach((p, i) => { m4.setPosition(p[0], p[1], p[2]); im.setMatrixAt(i, m4); });
    im.castShadow = true; im.receiveShadow = true; scene.add(im);
  }

  // RTG crane (rubber-tyred gantry) straddling the corridor at z=-12
  const rtg = new THREE.Group();
  const steel = std({ color: C.steel, roughness: 0.45, metalness: 0.5 });
  for (const [x, z] of [[-7, -15.5], [-7, -8.5], [7, -15.5], [7, -8.5]]) {
    box(1, 13, 1, steel, x, 7.5, z, { parent: rtg });
    box(1.1, 1.6, 1.1, stripe, x, 1.8, z, { parent: rtg });
    for (const dz of [-0.9, 0.9]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.6, 16), std({ color: C.tyre })); w.rotation.z = Math.PI / 2; w.position.set(x, 0.75, z + dz); w.castShadow = true; rtg.add(w); }
    box(2.4, 0.5, 2.6, steel, x, 1.2, z, { parent: rtg });
  }
  for (const x of [-7, 7]) { box(1, 1, 8, steel, x, 14.3, -12, { parent: rtg }); box(0.6, 5, 0.6, steel, x, 11.5, -12, { parent: rtg }); }
  for (const z of [-15.5, -8.5]) { box(16, 1, 1, steel, 0, 14.3, z, { parent: rtg }); box(14, 0.5, 0.3, steel, 0, 12.3, z, { parent: rtg }); }
  for (const x of [-5, 0, 5]) { const br = box(0.3, 0.3, 7.6, steel, x, 13.6, -12, { parent: rtg }); br.rotation.x = 0; }
  const trolley = box(3.2, 1.3, 7.2, std({ color: C.steelDark, metalness: 0.5 }), 0, 13.2, -12, { parent: rtg });
  const cableMat = std({ color: 0x1a1a1a, metalness: 0.7, roughness: 0.4 });
  const hang = new THREE.Group();
  for (const [x, z] of [[-5.5, -13.2], [-5.5, -10.8], [5.5, -13.2], [5.5, -10.8]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 4.6, 6), cableMat); c.position.set(x, 10.3, z); hang.add(c); }
  box(12.4, 0.5, 2.6, std({ color: C.line, roughness: 0.5, metalness: 0.4 }), 0, 8.0, -12, { parent: hang });
  for (const x of [-5.9, 5.9]) box(0.4, 0.5, 2.6, 0x222, x, 7.6, -12, { parent: hang });
  makeContainer(12.19, 0xb03a2e, 0, 5.15, -12, hang);
  rtg.add(hang);
  box(2.2, 2.2, 2.2, std({ color: C.cabin, roughness: 0.4 }), 6.4, 11.2, -12, { parent: rtg });
  box(1.6, 1.2, 2.3, std({ color: 0x0f1a2e, roughness: 0.1, metalness: 0.6 }), 6.4, 11.3, -12, { parent: rtg });
  scene.add(rtg);
  const danger = plane(14, 10, std({ color: 0x8b1a1a, transparent: true, opacity: 0.45, roughness: 1 }), 0, -12, 0.035);
  const loadSign = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.6), std({ map: signText(['DILARANG MELINTAS', 'di bawah beban angkat', 'NO WALKING UNDER LOAD']), roughness: 0.6 }));
  loadSign.position.set(-4.5, 2.6, -5.5); scene.add(loadSign); box(0.12, 2.8, 0.12, 0x6b7280, -4.5, 1.4, -5.6);

  // Site office
  box(12, 4, 7, std({ color: 0xe8e4dc, roughness: 0.9 }), 0, 2, -46); box(13, 0.4, 8, 0x3b3f45, 0, 4.2, -46);
  box(2, 2.6, 0.2, 0x1f2a44, 0, 1.3, -42.4);
  for (const x of [-4, 4]) box(2.2, 1.4, 0.1, std({ color: 0x0f1a2e, roughness: 0.1, metalness: 0.6 }), x, 2.4, -42.4);
  const officeSign = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.4), std({ map: signText(['KANTOR K3', 'Site Office · Near-miss reports'], { w: 640, h: 180 }), roughness: 0.6 }));
  officeSign.position.set(0, 3.3, -42.3); scene.add(officeSign);
  contact(16, 10, 0, -46);
  addCollider(-6.2, 6.2, -49.6, -42.4);

  // Light masts with lamp heads
  for (const [x, z] of [[-24, 36], [24, 36], [-24, -40], [24, -40], [0, -80]]) {
    box(0.6, 28, 0.6, std({ color: 0x8a9099, metalness: 0.6, roughness: 0.4 }), x, 14, z, { shadow: false });
    const head = box(3, 0.6, 1.2, 0x2a2e33, x, 28, z, { shadow: false });
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), new THREE.MeshStandardMaterial({ color: 0xfff1c0, emissive: 0xfff1c0, emissiveIntensity: 2.5 })); lamp.rotation.x = Math.PI / 2; lamp.position.set(x, 27.65, z); scene.add(lamp);
  }

  // Quay: STS cranes, ship, water — horizon depth
  const waterN = waterNormal();
  const water = plane(400, 120, std({ color: 0x24465c, roughness: 0.12, metalness: 0.7, normalMap: waterN, normalScale: new THREE.Vector2(0.35, 0.35) }), 0, -170, -0.2);
  box(400, 2, 6, std({ color: 0x6f7378 }), 0, 0.5, -112);   // quay edge
  for (const x of [-60, -20, 20, 60]) {
    const g = new THREE.Group(); const m = std({ color: 0x1f6f78, roughness: 0.5, metalness: 0.5 });
    for (const [lx, lz] of [[-9, -116], [9, -116], [-9, -130], [9, -130]]) box(1.4, 48, 1.4, m, x + lx, 24, lz, { parent: g, shadow: false });
    box(20, 1.6, 1.6, m, x, 48, -116, { parent: g, shadow: false }); box(20, 1.6, 1.6, m, x, 48, -130, { parent: g, shadow: false });
    box(1.6, 1.6, 90, m, x, 46, -150, { parent: g, shadow: false });  // boom over the ship
    box(4, 3, 4, std({ color: C.cabin }), x, 42, -150, { parent: g, shadow: false });
    scene.add(g);
  }
  box(180, 14, 32, std({ color: 0x14243a, roughness: 0.6 }), 10, 6, -165, { shadow: false });  // hull
  box(170, 10, 28, std({ color: 0xcfd3d8 }), 10, 14, -165, { shadow: false });                    // stacked boxes, hinted
  box(14, 20, 12, std({ color: 0xf2f2f2 }), -70, 24, -165, { shadow: false });                     // bridge
  // distant skyline/warehouses
  for (let i = 0; i < 10; i++) box(30, 10 + (i % 3) * 4, 18, std({ color: 0x8e949b }), -140 + i * 32, 5 + (i % 3) * 2, -95, { shadow: false });

  // Trucks + NPCs
  const trucks = [
    { g: makeTruck(0x2a6fb0), z: 16, dir: 1, x: -45, speed: 9 },
    { g: makeTruck(0x2e8b57), z: 20, dir: -1, x: 30, speed: 7.5 },
  ];
  for (const t of trucks) { t.g.position.set(t.x, 0, t.z); t.g.rotation.y = t.dir > 0 ? 0 : Math.PI; scene.add(t.g); }
  const npcs = [];
  const paths = [
    { from: [-9, 30], to: [-9, 36], vest: 0xff8c1a }, { from: [14, 36], to: [20, 36], vest: 0x38c172 },
    { from: [-5, -40], to: [-5, -36], vest: 0xff8c1a }, { from: [-12, 26], to: [-12, 26], vest: 0xff8c1a, still: true },
  ];
  for (const p of paths) { const w = makeWorker(p.vest); w.position.set(p.from[0], 0, p.from[1]); scene.add(w); npcs.push({ w, ...p, t: Math.random() * 10 }); }

  // Birds: flat V shapes flapping, circling over the water and the yard
  const birds = [];
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x2b2f36, side: THREE.DoubleSide });
  for (let i = 0; i < 9; i++) {
    const b = new THREE.Group();
    for (const sx of [-1, 1]) { const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.3), birdMat); wing.position.x = sx * 0.45; wing.userData.sx = sx; b.add(wing); }
    b.userData = { cx: -40 + Math.random() * 80, cz: -60 - Math.random() * 80, r: 12 + Math.random() * 25, y: 22 + Math.random() * 18, ph: Math.random() * 6, sp: 0.25 + Math.random() * 0.2 };
    scene.add(b); birds.push(b);
  }
  // Sun glow sprite along the sun direction
  const sc = document.createElement('canvas'); sc.width = sc.height = 256; const sctx = sc.getContext('2d');
  const grad = sctx.createRadialGradient(128, 128, 0, 128, 128, 128); grad.addColorStop(0, 'rgba(255,250,230,1)'); grad.addColorStop(0.18, 'rgba(255,236,180,0.7)'); grad.addColorStop(0.5, 'rgba(255,210,120,0.12)'); grad.addColorStop(1, 'rgba(255,200,100,0)');
  sctx.fillStyle = grad; sctx.fillRect(0, 0, 256, 256);
  const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(sc), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false }));
  sunSprite.position.copy(sunDir).multiplyScalar(900); sunSprite.scale.setScalar(260); scene.add(sunSprite);

  // Beacon
  const beacon = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.08, 8, 40), new THREE.MeshBasicMaterial({ color: C.line }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.08; beacon.add(ring);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 14, 8), new THREE.MeshBasicMaterial({ color: C.line, transparent: true, opacity: 0.35 }));
  pillar.position.y = 7; beacon.add(pillar);
  scene.add(beacon);

  let t = 0;
  const world = {
    scene, colliders, trucks, hang, beacon, rtg, npcs, paused: false,
    setBeacon(x, z, visible = true) { beacon.position.set(x, 0, z); beacon.visible = visible; },
    setTrucksVisible(v) { for (const tr of trucks) tr.g.visible = v; },
    setShadowCenter,
    update(dt) {
      t += dt;
      ring.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
      pillar.material.opacity = 0.25 + Math.sin(t * 3) * 0.1;
      waterN.offset.set(t * 0.012, t * 0.008);
      for (const b of birds) {
        const u = b.userData; const a = t * u.sp + u.ph;
        b.position.set(u.cx + Math.cos(a) * u.r, u.y + Math.sin(a * 2) * 1.5, u.cz + Math.sin(a) * u.r);
        b.rotation.y = -a; const flap = Math.sin(t * 9 + u.ph) * 0.6;
        b.children[0].rotation.z = flap; b.children[1].rotation.z = -flap;
      }
      if (world.paused) return;
      for (const tr of trucks) {
        tr.x += tr.dir * tr.speed * dt;
        if (tr.x > 75) tr.x = -75; if (tr.x < -75) tr.x = 75;
        tr.g.position.x = tr.x;
        for (const w of tr.g.userData.wheels) w.rotation.y += tr.speed * dt / 0.52;
        tr.g.userData.beacon.material.color.setHex(Math.floor(t * 2) % 2 ? 0xffb000 : 0x7a4f00);
      }
      hang.position.x = Math.sin(t * 0.7) * 0.25; hang.rotation.z = Math.sin(t * 0.7) * 0.01; trolley.position.x = hang.position.x;
      for (const n of npcs) {
        if (n.still) { animateWorker(n.w, t, 0.08); continue; }
        n.t += dt; const k = (Math.sin(n.t * 0.5) + 1) / 2;
        const nx = n.from[0] + (n.to[0] - n.from[0]) * k, nz = n.from[1] + (n.to[1] - n.from[1]) * k;
        n.w.rotation.y = Math.atan2(nx - n.w.position.x, nz - n.w.position.z);
        n.w.position.set(nx, 0, nz); animateWorker(n.w, t, 1);
      }
    },
  };
  return world;
}
