import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// Post stack: ground-truth AO (the single biggest step away from "toy" rendering),
// a whisper of bloom on the sun/lamps/beacons, SMAA, then tone mapping + sRGB output.
// ?fx=0 disables it (plain renderer) for weak GPUs.
export function setupPost(renderer, scene, camera, { bloom = 0.18 } = {}) {
  const q = new URLSearchParams(location.search);
  if (q.get('fx') === '0') return { render: () => renderer.render(scene, camera), setSize: () => {} };
  const size = renderer.getSize(new THREE.Vector2());
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const gtao = new GTAOPass(scene, camera, size.x, size.y);
  gtao.output = GTAOPass.OUTPUT.Default;
  gtao.updateGtaoMaterial({ radius: 0.8, distanceExponent: 1.2, thickness: 1.0, scale: 1.3, samples: 16, distanceFallOff: 1.0, screenSpaceRadius: false });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 8, radiusExponent: 1, rings: 3, samples: 16 });
  gtao.blendIntensity = 0.85;
  composer.addPass(gtao);
  // Bloom only on request: the Sky shader and the sun sprite sit far above 1.0 in linear light,
  // so any sane threshold still blooms the whole sky. Opt in with ?bloom=1 (threshold 3.5, strength 0.12).
  let bloomPass = null;
  if (q.get('bloom') === '1') { bloomPass = new UnrealBloomPass(size, 0.12, 0.4, 3.5); composer.addPass(bloomPass); }
  composer.addPass(new OutputPass());
  const smaa = new SMAAPass();
  composer.addPass(smaa);
  return {
    composer,
    render: () => composer.render(),
    setSize: (w, h) => { composer.setSize(w, h); gtao.setSize(w, h); bloomPass?.setSize(w, h); },
  };
}
