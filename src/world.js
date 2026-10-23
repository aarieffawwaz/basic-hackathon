import * as THREE from 'three';

// Low-poly container terminal built from primitives only — no model files, no asset pipeline.
// Layout (metres): player spawns at z=48 facing -z. Gate z=40. Truck lane z 14..22.
// Container blocks either side of a central corridor (|x| < 4) from z=-5 to z=-34.
// RTG crane straddles the corridor at z=-12 holding a container. Site office at z=-44.

const C = {
  asphalt: 0x4a4f55, line: 0xf5c518, walk: 0x2f9e5b, white: 0xf2f2f2,
  steel: 0x3b5bdb, steelDark: 0x1f2a44, cabin: 0xe4e8ee, tyre: 0x15171a,
  containers: [0xc0392b, 0x2980b9, 0x27ae60, 0xf1c40f, 0x7f8c8d, 0xe67e22, 0x8e44ad],
};

function box(w, h, d, color, x, y, z, { shadow = true, parent } = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color }));
  m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = true;
  (parent || box.scene).add(m);
  return m;
}

function plane(w, d, color, x, z, y = 0.01, parent) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshLambertMaterial({ color }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.receiveShadow = true;
  (parent || box.scene).add(m);
  return m;
}

export function makeContainer(len, color, x, y, z, parent) {
  // 2.44 wide, 2.6 tall; long axis along x
  const g = new THREE.Group();
  box(len, 2.6, 2.44, color, 0, 1.3, 0, { parent: g });
  // corrugation hint: darker stripes
  const stripe = new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(0.8) });
  for (let i = -len / 2 + 1; i < len / 2; i += 1.6) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2.3, 2.5), stripe);
    s.position.set(i, 1.3, 0); g.add(s);
  }
  g.position.set(x, y, z);
  (parent || box.scene).add(g);
  return g;
}

export function makeWorker(vest = 0xff8c1a, helmet = true) {
  const g = new THREE.Group();
  const legs = box(0.5, 0.8, 0.3, 0x2b3a67, 0, 0.4, 0, { parent: g });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.7, 10), new THREE.MeshLambertMaterial({ color: vest }));
  torso.position.y = 1.15; torso.castShadow = true; g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), new THREE.MeshLambertMaterial({ color: 0xd9a066 }));
  head.position.y = 1.72; head.castShadow = true; g.add(head);
  if (helmet) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0xf5c518 }));
    h.position.y = 1.74; g.add(h);
  }
  g.userData = { legs, torso, head };
  return g;
}

export function makeTruck(color) {
  const g = new THREE.Group();
  box(10, 0.5, 2.6, C.steelDark, 0, 0.75, 0, { parent: g });               // chassis
  box(2.4, 2.3, 2.6, C.cabin, 3.8, 2.1, 0, { parent: g });                  // cab
  box(1.6, 0.9, 2.2, 0x1b2230, 3.9, 2.5, 0, { parent: g });                 // windows
  makeContainer(6.06, color, -1.6, 1.0, 0, g);                               // 20ft box
  for (const [x, z] of [[3.5, 1.2], [3.5, -1.2], [-2.2, 1.2], [-2.2, -1.2], [-4, 1.2], [-4, -1.2]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 12), new THREE.MeshLambertMaterial({ color: C.tyre }));
    w.rotation.x = Math.PI / 2; w.position.set(x, 0.5, z); g.add(w);
  }
  // amber beacon on cab
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffb000 }));
  b.position.set(3.8, 3.35, 0); g.add(b);
  return g;
}

export function buildWorld(scene) {
  box.scene = scene;
  const colliders = [];
  const addCollider = (minX, maxX, minZ, maxZ) => colliders.push({ minX, maxX, minZ, maxZ });

  // Lights
  scene.add(new THREE.HemisphereLight(0xdfeeff, 0x55606a, 0.95));
  const sun = new THREE.DirectionalLight(0xfff2d8, 1.4);
  sun.position.set(40, 60, 30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, near: 1, far: 200 });
  scene.add(sun);

  // Ground + markings
  plane(240, 240, C.asphalt, 0, 0, 0);
  plane(2.2, 100, C.walk, 0, 0, 0.02);                                      // pedestrian walkway
  for (let z = -46; z < 50; z += 2) plane(1.8, 0.25, C.white, 0, z, 0.03);  // hatching
  plane(130, 0.3, C.line, 0, 14, 0.03); plane(130, 0.3, C.line, 0, 22, 0.03); // lane edges
  plane(3.2, 0.35, C.line, 0, 23.4, 0.04);                                  // waiting line
  for (let x = -1.2; x <= 1.2; x += 0.8) plane(0.4, 8, C.white, x, 18, 0.03); // zebra
  plane(6, 1.5, 0xffffff, 0, 45, 0.02);                                     // gate apron

  // Gate
  box(0.5, 4.5, 0.5, C.white, -3.2, 2.25, 40); box(0.5, 4.5, 0.5, C.white, 3.2, 2.25, 40);
  const bar = box(0.15, 4.2, 0.15, 0xd62828, -3.0, 4.2, 40); bar.rotation.z = 0.25;
  box(4, 1.0, 4, 0x2b3a67, 7, 0.5, 44); box(4.2, 0.1, 4.2, C.white, 7, 1.05, 44);   // PPE rack / table
  const rackSign = box(4, 1.4, 0.1, C.line, 7, 2.6, 42.5);
  box(0.2, 1.4, 0.2, 0x333, 5.3, 1.8, 42.5); box(0.2, 1.4, 0.2, 0x333, 8.7, 1.8, 42.5);
  // helmets on table
  for (const x of [5.8, 7, 8.2]) {
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: C.line }));
    h.position.set(x, 1.1, 44); scene.add(h);
  }
  addCollider(4.9, 9.1, 41.9, 46.1);
  addCollider(-3.5, -2.9, 39.7, 40.3); addCollider(2.9, 3.5, 39.7, 40.3);
  // fence either side of gate
  for (const side of [-1, 1]) {
    const f = box(50, 2.2, 0.1, 0x9aa3ad, side * 28.5, 1.1, 40, { shadow: false });
    f.material.transparent = true; f.material.opacity = 0.55;
    addCollider(side > 0 ? 3.5 : -53.5, side > 0 ? 53.5 : -3.5, 39.6, 40.4);
  }

  // Container blocks: four columns either side of the corridor, rows along z
  const stackHeights = {};
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const columns = [-30.5, -17.5, 10.5, 23.5, 36.5, -43.5];
  for (const cx of columns) {
    for (let z = -6; z >= -34; z -= 2.9) {
      // the seal-check stack (hazard 4) is exactly two high, and the row in front of it one high, so the fall reads on camera
      const key = `${cx},${z.toFixed(1)}`;
      const forced = { "10.5,-23.4": 2, "10.5,-20.5": 1, "10.5,-26.3": 1 }[key];
      const h = forced ?? 1 + Math.floor(rnd() * 3);
      stackHeights[`${cx},${z.toFixed(1)}`] = h;
      for (let i = 0; i < h; i++) makeContainer(12.19, C.containers[Math.floor(rnd() * C.containers.length)], cx, i * 2.6, z);
      addCollider(cx - 6.1, cx + 6.1, z - 1.22, z + 1.22);
    }
  }
  // the seal-check stack (hazard 4): force exactly two high at x=10.5, z=-23.4 (nearest row to -24)
  // (handled visually by the replay; collider already exists)

  // RTG crane straddling the corridor at z=-12
  const rtg = new THREE.Group();
  for (const [x, z] of [[-7, -15], [-7, -9], [7, -15], [7, -9]]) {
    box(1, 14, 1, C.steel, x, 7, z, { parent: rtg });
    addCollider(x - 0.6, x + 0.6, z - 0.6, z + 0.6);
  }
  box(1, 1, 8, C.steel, -7, 14.2, -12, { parent: rtg }); box(1, 1, 8, C.steel, 7, 14.2, -12, { parent: rtg });
  box(16, 1, 1, C.steel, 0, 14.2, -9, { parent: rtg }); box(16, 1, 1, C.steel, 0, 14.2, -15, { parent: rtg });
  for (const z of [-15, -9]) { box(14, 0.6, 0.3, C.steel, 0, 12.5, z, { parent: rtg }); }
  const trolley = box(3, 1.2, 7, C.steelDark, 0, 13.2, -12, { parent: rtg });
  const cableMat = new THREE.MeshLambertMaterial({ color: 0x222 });
  const hang = new THREE.Group();                     // cables + spreader + container
  for (const [x, z] of [[-5.5, -13.2], [-5.5, -10.8], [5.5, -13.2], [5.5, -10.8]]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.4, 6), cableMat);
    c.position.set(x, 10.4, z); hang.add(c);
  }
  box(12.4, 0.5, 2.6, C.line, 0, 8.0, -12, { parent: hang });   // spreader
  makeContainer(12.19, 0xc0392b, 0, 5.15, -12, hang);             // suspended box: y 5.15..7.75
  rtg.add(hang);
  box(2, 2, 2, C.cabin, 6.5, 11.2, -12, { parent: rtg });        // operator cab
  scene.add(rtg);
  plane(14, 10, 0x6b1f1f, 0, -12, 0.04).material.transparent = true; // red hazard zone under the load
  scene.children.at(-1).material.opacity = 0.55;

  // Site office
  box(12, 4, 7, 0xe8e4dc, 0, 2, -46); box(13, 0.4, 8, 0x3b3f45, 0, 4.2, -46);
  box(2, 2.6, 0.2, 0x1f2a44, 0, 1.3, -42.4);                                  // door
  box(5, 1.2, 0.15, C.line, 0, 3.2, -42.4);                                  // sign
  addCollider(-6.2, 6.2, -49.6, -42.4);

  // Trucks looping in the lane
  const trucks = [
    { g: makeTruck(0x2980b9), z: 16, dir: 1, x: -45, speed: 9 },
    { g: makeTruck(0x27ae60), z: 20, dir: -1, x: 30, speed: 7.5 },
  ];
  for (const t of trucks) { t.g.position.set(t.x, 0, t.z); t.g.rotation.y = t.dir > 0 ? 0 : Math.PI; scene.add(t.g); }

  // A few NPC workers for life
  const npcs = [];
  for (const [x, z, vest] of [[-9, 30, 0xff8c1a], [14, 36, 0x38c172], [-5, -40, 0xff8c1a]]) {
    const w = makeWorker(vest); w.position.set(x, 0, z); w.rotation.y = Math.random() * Math.PI * 2; scene.add(w); npcs.push(w);
  }

  // Next-checkpoint beacon
  const beacon = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.08, 8, 40), new THREE.MeshBasicMaterial({ color: C.line }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.08; beacon.add(ring);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 12, 8), new THREE.MeshBasicMaterial({ color: C.line, transparent: true, opacity: 0.35 }));
  pillar.position.y = 6; beacon.add(pillar);
  scene.add(beacon);

  // Skyline fillers so the horizon is not empty
  for (let i = 0; i < 14; i++) {
    const x = -100 + i * 15 + (i % 2) * 4;
    box(8, 6 + (i % 3) * 5, 8, 0x5b6470, x, 3 + (i % 3) * 2.5, -95, { shadow: false });
  }
  for (const x of [-60, 60]) box(2, 30, 2, 0x7a8390, x, 15, 60, { shadow: false }); // light masts

  let t = 0;
  const world = {
    scene, colliders, trucks, hang, beacon, rtg, npcs, paused: false,
    setBeacon(x, z, visible = true) { beacon.position.set(x, 0, z); beacon.visible = visible; },
    setTrucksVisible(v) { for (const tr of trucks) tr.g.visible = v; },
    update(dt) {
      t += dt;
      ring.scale.setScalar(1 + Math.sin(t * 3) * 0.08);
      pillar.material.opacity = 0.25 + Math.sin(t * 3) * 0.1;
      if (world.paused) return;
      for (const tr of trucks) {
        tr.x += tr.dir * tr.speed * dt;
        if (tr.x > 70) tr.x = -70; if (tr.x < -70) tr.x = 70;
        tr.g.position.x = tr.x;
      }
      hang.position.x = Math.sin(t * 0.7) * 0.25;   // gentle sway of the suspended load
      hang.rotation.z = Math.sin(t * 0.7) * 0.01;
      trolley.position.x = hang.position.x;
    },
  };
  return world;
}
