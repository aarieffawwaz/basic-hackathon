import * as THREE from 'three';
import { signText } from '../textures.js';

// Small scene props the hands-on modes add and remove: signs, lights, lines, windsocks.
// Every helper adds to `bag` so a mode can tear down everything it placed in one call.
export function propBag(scene) {
  const items = [];
  const add = (o) => { scene.add(o); items.push(o); return o; };
  const clear = () => { for (const o of items) scene.remove(o); items.length = 0; };
  return { add, clear, items };
}

const mat = (o) => new THREE.MeshStandardMaterial({ roughness: 0.7, ...o });

export function post(bag, x, z, h = 2.6, color = 0x6b7280) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, h, 0.12), mat({ color })); m.position.set(x, h / 2, z); m.castShadow = true; return bag.add(m);
}

// Text sign on a post. yaw turns its face (default faces +z).
export function sign(bag, lines, x, z, { yaw = 0, y = 2.4, w = 2.4, h = 1.2, bg, fg } = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: signText(lines, { bg, fg }), roughness: 0.5, side: THREE.DoubleSide }));
  m.position.set(x, y, z); m.rotation.y = yaw; bag.add(m); post(bag, x - Math.cos(yaw) * 0.0, z, y);
  return m;
}

export function speedSign(bag, n, x, z, yaw = 0) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.beginPath(); g.arc(128, 128, 120, 0, Math.PI * 2); g.fill();
  g.lineWidth = 30; g.strokeStyle = '#d32f2f'; g.beginPath(); g.arc(128, 128, 104, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#111'; g.font = '900 120px Inter, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), 128, 136);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.CircleGeometry(0.7, 32), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
  m.position.set(x, 2.6, z); m.rotation.y = yaw; bag.add(m); post(bag, x, z, 2.6);
  return m;
}

// Two-lamp traffic light. set('red' | 'green').
export function trafficLight(bag, x, z, yaw = 0) {
  post(bag, x, z, 3.2, 0x2a2e33);
  const g = new THREE.Group(); g.position.set(x, 3.4, z); g.rotation.y = yaw; bag.add(g);
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.4), mat({ color: 0x15181c })));
  const red = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 10), new THREE.MeshBasicMaterial({ color: 0xff2a2a }));
  const green = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 10), new THREE.MeshBasicMaterial({ color: 0x1f8a4c }));
  red.position.set(0, 0.24, 0.2); green.position.set(0, -0.24, 0.2); g.add(red, green);
  return { set(s) { red.material.color.setHex(s === 'red' ? 0xff2a2a : 0x3a1010); green.material.color.setHex(s === 'green' ? 0x3cff8a : 0x0c2a18); } };
}

export function groundLine(bag, x, z, w, d, color = 0xf2f2f2, opacity = 1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color, roughness: 0.9, transparent: opacity < 1, opacity, depthWrite: opacity >= 1 }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.05, z); m.receiveShadow = true; return bag.add(m);
}

// Pulsing ring on the ground, e.g. a box to stand in or a muster point.
export function ring(bag, x, z, r, color) {
  const m = new THREE.Mesh(new THREE.RingGeometry(r - 0.12, r, 48), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.06, z); return bag.add(m);
}

// Windsock pointing downwind; call sock.update(t) to flutter.
export function windsock(bag, x, z, dir) {
  post(bag, x, z, 6, 0x9aa1a9);
  const g = new THREE.Group(); g.position.set(x, 5.8, z); g.rotation.y = Math.atan2(dir.x, dir.z); bag.add(g);
  const sock = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.35, 2.2, 14, 1, true), mat({ color: 0xff5a1f, side: THREE.DoubleSide, roughness: 0.8 }));
  sock.rotation.x = Math.PI / 2; sock.position.z = 1.1; g.add(sock);
  return { update(t) { g.rotation.x = Math.sin(t * 4) * 0.05; sock.rotation.z = Math.sin(t * 6) * 0.08; } };
}
