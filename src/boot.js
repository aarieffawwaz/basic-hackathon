// Entry point for /play/. Checks the device before pulling in three.js and the sim, so a phone
// or a browser without WebGL gets an explanation instead of a black canvas, and the static
// loading bar in play/index.html is on screen while the main chunk downloads.

const $ = (id) => document.getElementById(id);
const lang = (() => { try { return localStorage.getItem('k3-lang') || 'en'; } catch { return 'en'; } })();

const COPY = {
  touch: {
    en: ['Needs a keyboard and mouse', 'ShiftReplay is a first-person sim: you walk with WASD and look with the mouse, which phones and tablets do not have. Open this link on a laptop or desktop browser. The landing page shows what each shift looks like.'],
    id: ['Butuh keyboard dan mouse', 'ShiftReplay adalah sim orang pertama: jalan dengan WASD dan melihat dengan mouse, yang tidak ada di ponsel atau tablet. Buka link ini di browser laptop atau desktop. Halaman depan menunjukkan isi tiap shift.'],
  },
  webgl: {
    en: ['3D is turned off in this browser', 'The sim needs WebGL. Try a current Chrome, Edge, Firefox or Safari, and check that hardware acceleration is on in the browser settings.'],
    id: ['3D nonaktif di browser ini', 'Sim ini butuh WebGL. Coba Chrome, Edge, Firefox atau Safari versi terbaru, dan pastikan akselerasi hardware aktif di pengaturan browser.'],
  },
  home: { en: 'See the landing page', id: 'Lihat halaman depan' },
  anyway: { en: 'Continue anyway', id: 'Tetap lanjut' },
  loading: { en: 'Loading the terminal…', id: 'Memuat terminal…' },
};
const t = (o) => o[lang] ?? o.en;

function webglOk() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
// Touch-only: a coarse primary pointer and no fine pointer anywhere (a tablet with a trackpad passes).
const touchOnly = matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches;

function unsupported(kind, allowAnyway) {
  const [title, body] = t(COPY[kind]);
  $('overlay-start').classList.add('hidden');
  $('unsupported-title').textContent = title; $('unsupported-body').textContent = body;
  $('unsupported-home').textContent = t(COPY.home);
  const anyway = $('unsupported-anyway');
  anyway.textContent = t(COPY.anyway); anyway.classList.toggle('hidden', !allowAnyway);
  anyway.onclick = () => { $('overlay-unsupported').classList.add('hidden'); $('overlay-start').classList.remove('hidden'); start(); };
  $('overlay-unsupported').classList.remove('hidden');
}

function start() { import('./main.js'); }

$('loading-text').textContent = t(COPY.loading);
const q = new URLSearchParams(location.search);
if (!webglOk()) unsupported('webgl', false);
else if (touchOnly && !q.has('force')) unsupported('touch', true);
else start();
