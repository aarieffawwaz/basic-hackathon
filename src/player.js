import * as THREE from 'three';

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
    this.bounds = { x: 58, zMin: -52, zMax: 52 };

    addEventListener('keydown', (e) => { this.keys[e.code] = true; });
    addEventListener('keyup', (e) => { this.keys[e.code] = false; });
    addEventListener('mousemove', (e) => {
      if (!this.enabled || document.pointerLockElement !== this.dom) return;
      this.yaw -= e.movementX * 0.0022;
      this.pitch -= e.movementY * 0.0022;
      this.pitch = Math.max(-1.3, Math.min(1.3, this.pitch));
    });
    this.applyCamera();
  }

  get locked() { return document.pointerLockElement === this.dom; }
  lock() { this.dom.requestPointerLock?.(); }
  unlock() { if (this.locked) document.exitPointerLock(); }

  setPosition(x, z, yaw = 0) {
    this.pos.set(x, 1.7, z);
    this.yaw = yaw;
    this.pitch = 0;
    this.applyCamera();
  }

  applyCamera() {
    this.camera.position.copy(this.pos);
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
    // subtle head bob while moving
    const moving = fx || fz;
    this.bob = (this.bob || 0) + (moving ? dt * 9 : 0);
    this.camera.position.set(this.pos.x, this.pos.y + (moving ? Math.sin(this.bob) * 0.04 : 0), this.pos.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
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
