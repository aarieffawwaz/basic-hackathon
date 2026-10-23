import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

// CC0 assets from Poly Haven (public/tex). Loaded asynchronously; callers keep their procedural
// fallback until each file arrives, so an offline run still renders.
const loader = new THREE.TextureLoader();
const BASE = '/tex/';

function tex(file, { srgb = false, repeat = [1, 1], onLoad } = {}) {
  const t = loader.load(BASE + file, (tt) => { tt.needsUpdate = true; onLoad?.(tt); });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// diffuse: false skips the colour map for surfaces that keep their own paint colour and only take relief + roughness.
export function pbrSet(name, repeat, { diffuse = true } = {}) {
  return {
    map: diffuse ? tex(`${name}_diff_1k.jpg`, { srgb: true, repeat }) : undefined,
    normalMap: tex(`${name}_nor_gl_1k.jpg`, { repeat }),
    roughnessMap: tex(`${name}_rough_1k.jpg`, { repeat }),
  };
}

export function loadHDRI(file, onLoad) {
  new RGBELoader().load(BASE + file, (t) => { t.mapping = THREE.EquirectangularReflectionMapping; onLoad(t); }, undefined, () => {});
}
