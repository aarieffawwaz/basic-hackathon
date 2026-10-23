import * as THREE from 'three';
import { animateWorker } from './world.js';

// First-person walker: pointer-lock mouse look, WASD, and simple AABB push-out so the
// player cannot walk through container stacks or crane legs.
export class Player {
  constructor(camera, dom, colliders) {
    this.camera = camera;
    this.dom = dom;
    this.colliders = colliders;
    this.pos = new THREE.Vector3(0, 1.7, 48);
    this.yaw = 0;
    this.pitch = 0;
    this.keys = {};
    this.enabled = false;
    this.speed = 5.5;
    this.radius = 0.5;
    this.bounds = { x: 58, zMin: -109, zMax: 52 };
    this.view = localStorage.getItem('k3-view') === 'third' ? 'third' : 'first';
    this.body = null; this.t = 0; this.moving = false;

    addEventListener('keydown', (e) => { this.keys[e.code] = true; if (e.code === 'KeyV' && !e.repeat) this.toggleView(); });
    addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    addEventListener('mousemove', (e) => {
      if (!this.enabled || document.pointerLockElement !== this.dom) return;
      this.yaw -= e.movementX * 0.0022;
      this.pitch -= e.movementY * 0.0022;
      this.pitch = Math.max(-1.3, Math.min(1.3, this.pitch));
    });
    this.applyCamera();
  }

  // Third-person: a visible body rig (from world.makeWorker) that follows the player.
  setBody(group) { this.body = group; this.body.visible = this.view === 'third'; }
  setView(v) { this.view = v; localStorage.setItem('k3-view', v); if (this.body) this.body.visible = v === 'third' && this.bodyAllowed !== false; this.applyCamera(); this.onView?.(v); }
  toggleView() { this.setView(this.view === 'first' ? 'third' : 'first'); }
  setBodyVisible(v) { this.bodyAllowed = v; if (this.body) this.body.visible = v && this.view === 'third'; }
  get locked() { return document.pointerLockElement === this.dom; }
  lock() { this.dom.requestPointerLock?.(); }
  unlock() { if (this.locked) document.exitPointerLock(); }

  setPosition(x, z, yaw = 0) {
    this._snap = true;
    this.pos.set(x, 1.7, z);
    this.yaw = yaw;
    this.pitch = 0;
    this.applyCamera();
  }

  applyCamera(bobY = 0) {
    if (this.body) { this.body.position.set(this.pos.x, 0, this.pos.z); this.body.rotation.y = this.yaw + Math.PI; }
    if (this.view === 'third') {
      const r = 4.6, cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
      const tx = this.pos.x, ty = 1.3, tz = this.pos.z;
      const cx = tx + Math.sin(this.yaw) * cp * r, cz = tz + Math.cos(this.yaw) * cp * r;
      const cy = Math.max(0.5, ty - sp * r + 0.6);
      const k = this._snap ? 1 : 0.16; this._snap = false;
      this.camera.position.lerp(new THREE.Vector3(cx, cy, cz), k);
      this.camera.lookAt(tx, ty + 0.2, tz);
      return;
    }
    this.camera.position.set(this.pos.x, this.pos.y + bobY, this.pos.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  update(dt) {
    if (!this.enabled) return;
    const k = this.keys;
    let fx = 0, fz = 0;
    if (k.KeyW || k.ArrowUp) fz -= 1;
    if (k.KeyS || k.ArrowDown) fz += 1;
    if (k.KeyA || k.ArrowLeft) fx -= 1;
    if (k.KeyD || k.ArrowRight) fx += 1;
    if (fx || fz) {
      const len = Math.hypot(fx, fz);
      fx /= len; fz /= len;
      const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
      // camera-relative: forward is -z in camera space
      const dx = (fx * cos + fz * sin) * this.speed * dt;
      const dz = (-fx * sin + fz * cos) * this.speed * dt;
      this.pos.x += dx;
      this.pos.z += dz;
      this.collide();
    }
    // subtle head bob while moving; body walk cycle in third person
    const moving = !!(fx || fz);
    this.t += dt; this.moving = moving;
    this.bob = (this.bob || 0) + (moving ? dt * 9 : 0);
    if (this.body) animateWorker(this.body, this.t, moving ? 1 : 0);
    this.applyCamera(moving ? Math.sin(this.bob) * 0.04 : 0);
  }

  collide() {
    const p = this.pos, r = this.radius, b = this.bounds;
    p.x = Math.max(-b.x, Math.min(b.x, p.x));
    p.z = Math.max(b.zMin, Math.min(b.zMax, p.z));
    for (const c of this.colliders) {
      const minX = c.minX - r, maxX = c.maxX + r, minZ = c.minZ - r, maxZ = c.maxZ + r;
      if (p.x <= minX || p.x >= maxX || p.z <= minZ || p.z >= maxZ) continue;
      // inside: push out along the thinnest side
      const dl = p.x - minX, dr = maxX - p.x, dn = p.z - minZ, df = maxZ - p.z;
      const m = Math.min(dl, dr, dn, df);
      if (m === dl) p.x = minX; else if (m === dr) p.x = maxX; else if (m === dn) p.z = minZ; else p.z = maxZ;
    }
  }
}
