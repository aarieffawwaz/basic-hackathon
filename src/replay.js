import * as THREE from 'three';
import { makeWorker, makeTruck, makeContainer } from './world.js';

// Consequence replays. Each returns { dur, cam(t), update(t), captions, dispose() }.
// Time t runs in "replay seconds"; the runner slows the clock so the moment reads as slow motion.
const ease = (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t));
const smooth = (t) => t * t * (3 - 2 * t);

export function createReplay(id, world, lang) {
  const scene = world.scene;
  const actors = [];
  const add = (o) => { scene.add(o); actors.push(o); return o; };
  const dispose = () => { for (const a of actors) scene.remove(a); };
  const L = (en, idn) => (lang === 'id' ? idn : en);

  if (id === 'ppe') {
    const w = add(makeWorker(0xff8c1a, false)); w.position.set(0, 0, 41.5);
    const bolt = add(new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.25), new THREE.MeshLambertMaterial({ color: 0x222 })));
    bolt.position.set(0.05, 11, 41.5);
    return {
      dur: 5, dispose,
      captions: [
        { t: 0, text: L('A twist-lock left loose on the crane spreader, 11 m up.', 'Satu twist-lock tertinggal longgar di spreader crane, 11 m di atas.') },
        { t: 2.3, text: L('1.5 kg at 11 m. No helmet.', '1,5 kg dari 11 m. Tanpa helm.') },
        { t: 3.4, text: L('Skull fracture. Shift over for good.', 'Fraktur tengkorak. Shift berakhir selamanya.') },
      ],
      impactAt: 2.3,
      cam: (t) => ({ pos: new THREE.Vector3(4.5 - t * 0.2, 2.6, 45), look: new THREE.Vector3(0, 1.6, 41.5) }),
      update: (t) => {
        bolt.position.y = Math.max(1.95, 11 - 1.7 * t * t);
        bolt.rotation.x = t * 3; bolt.rotation.z = t * 2;
        if (t > 2.3) { const k = smooth(Math.min(1, (t - 2.3) / 1.2)); w.rotation.x = -k * Math.PI / 2; w.position.y = k * 0.35; }
      },
    };
  }

  if (id === 'cross' || id === 'report') {
    const later = id === 'report';
    const w = add(makeWorker(later ? 0x38c172 : 0xff8c1a)); w.position.set(0, 0, 23.5);
    const truck = add(makeTruck(0xe67e22)); truck.position.set(-40, 0, 18); truck.rotation.y = 0;
    const v = 15; // m per replay-second
    const hitT = 40 / v; // truck front (x≈+5) reaches worker at x=0 → use 35/v
    const tHit = 35 / v;
    return {
      dur: 5.5, dispose, hideTrucks: true,
      captions: later ? [
        { t: 0, text: L('Seven days later. Same lane, same blind spot. Your coworker.', 'Tujuh hari kemudian. Jalur yang sama, blind spot yang sama. Rekan kerjamu.') },
        { t: tHit + 0.2, text: L('The report you did not file was the only warning anyone would have had.', 'Laporan yang tidak kamu isi adalah satu-satunya peringatan yang bisa mereka dapat.') },
      ] : [
        { t: 0, text: L('Terminal tractor, 25 t loaded, 32 km/h. Driver is watching the crane.', 'Terminal tractor, 25 t bermuatan, 32 km/jam. Pengemudi melihat crane.') },
        { t: tHit - 0.8, text: L('Stopping distance at this speed: about 20 m.', 'Jarak berhenti di kecepatan ini: sekitar 20 m.') },
        { t: tHit + 0.2, text: L('Struck at the crossing. Fatal in most recorded cases.', 'Tertabrak di penyeberangan. Fatal di sebagian besar kasus tercatat.') },
      ],
      impactAt: tHit,
      cam: (t) => ({ pos: new THREE.Vector3(9, 4.5, 30 - t * 0.6), look: new THREE.Vector3(0, 1.4, 18) }),
      update: (t) => {
        truck.position.x = -40 + v * t;
        if (t < tHit) {
          w.position.z = ease(23.5, 17.8, t / tHit);
          w.position.y = Math.abs(Math.sin(t * 9)) * 0.06;
        } else {
          const k = t - tHit;
          w.position.x = Math.min(k * 9, 9); w.position.y = Math.max(0.3, 1.8 * k - 2.5 * k * k);
          w.rotation.z = -k * 4; w.rotation.x = -Math.min(Math.PI / 2, k * 3);
        }
      },
    };
  }

  if (id === 'load') {
    const w = add(makeWorker(0xff8c1a)); w.position.set(0, 0, -3.5);
    const hang = world.hang;
    const y0 = hang.position.y;
    return {
      dur: 5.5, dispose: () => { dispose(); hang.position.y = y0; hang.rotation.x = 0; },
      captions: [
        { t: 0, text: L('40-ft container, 30 t, held by four twist-locks.', 'Kontainer 40 kaki, 30 t, ditahan empat twist-lock.') },
        { t: 1.6, text: L('One twist-lock was never seated.', 'Satu twist-lock tidak pernah terkunci sempurna.') },
        { t: 3.0, text: L('There is nothing to do at this point. There was, 10 metres ago.', 'Tidak ada yang bisa dilakukan di titik ini. Tadi masih ada, 10 meter sebelumnya.') },
      ],
      impactAt: 2.75,
      cam: (t) => ({ pos: new THREE.Vector3(-11, 3.4, 3 - t * 0.5), look: new THREE.Vector3(0, 3, -12) }),
      update: (t) => {
        w.position.z = ease(-3.5, -12.5, t / 2.9);
        w.position.y = Math.abs(Math.sin(t * 9)) * 0.06;
        if (t > 1.6) { const k = t - 1.6; hang.rotation.x = -Math.min(0.35, k * 0.5); hang.position.y = y0 - Math.min(5.0, 2.2 * k * k); }
        if (t > 2.75) w.visible = false;
      },
    };
  }

  if (id === 'height') {
    const w = add(makeWorker(0xff8c1a)); w.position.set(9.5, 5.2, -23.4);
    return {
      dur: 5, dispose,
      captions: [
        { t: 0, text: L('Container roof, 5.2 m. Wet from the morning rain. No edge rail.', 'Atap kontainer, 5,2 m. Basah hujan pagi. Tanpa pagar tepi.') },
        { t: 1.9, text: L('A corner casting is 25 cm wide and rounded.', 'Corner casting lebarnya 25 cm dan membulat.') },
        { t: 3.0, text: L('5 m onto concrete. Most falls from this height break the spine or the skull.', '5 m ke beton. Sebagian besar jatuh dari ketinggian ini mematahkan tulang belakang atau tengkorak.') },
      ],
      impactAt: 2.9,
      cam: (t) => ({ pos: new THREE.Vector3(-3 + t * 0.3, 4.5, -17), look: new THREE.Vector3(5, 3, -23.4) }),
      update: (t) => {
        if (t < 1.9) { w.position.x = ease(9.5, 4.6, t / 1.9); w.position.y = 5.2 + Math.abs(Math.sin(t * 8)) * 0.05; }
        else { const k = t - 1.9; w.position.x = 4.6 - k * 1.2; w.position.y = Math.max(0.35, 5.2 - 4.9 * k * k); w.rotation.z = Math.min(Math.PI / 2, k * 2.2); }
      },
    };
  }

  throw new Error(`unknown replay ${id}`);
}
