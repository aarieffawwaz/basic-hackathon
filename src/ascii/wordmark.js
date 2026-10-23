/* wordmark: SHIFTREPLAY in a 5x5 block font, two cells per pixel so it keeps its proportions in a monospace grid.
   Prints in from the left with a bright head when it first comes on screen, then a light sweep crosses it every few seconds. */
import { Grid, palette, clamp } from 'ascii-magic-art/lib/kit.js';

const FONT = {
  S: '11111,10000,11111,00001,11111', H: '10001,10001,11111,10001,10001', I: '11111,00100,00100,00100,11111',
  F: '11111,10000,11110,10000,10000', T: '11111,00100,00100,00100,00100', R: '11110,10001,11110,10100,10010',
  E: '11111,10000,11110,10000,11111', P: '11110,10001,11110,10000,10000', L: '10000,10000,10000,10000,11111',
  A: '01110,10001,11111,10001,10001', Y: '10001,01010,00100,00100,00100', ' ': '00000,00000,00000,00000,00000',
};
const WORDS = [['SHIFT', '0', 'c'], ['REPLAY', '3', 'd']]; // word, ink, bright ink
const GAP = 2, PX = 2;            // cells between letters, cells per pixel
const PRINT = 1.6, EVERY = 7, SWEEP = 1.1, BAND = 8; // seconds, seconds, seconds, cells

export const meta = {
  slug: 'shiftreplay-wordmark', name: 'ShiftReplay', category: 'lettering',
  cols: WORDS.reduce((n, [w]) => n + w.length, 0) * (5 * PX + GAP) - GAP, rows: 5, fps: 24,
  // 0 ink, 1 muted, 2 dim, 3 accent, c bright ink, d bright accent
  palette: palette(['#c9d1da', '#6b7682', '#3a434d', '#f5c518', '#ffffff', '#ffe36b', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#fff2a8']),
};

export default function create() {
  const g = new Grid(meta.cols, meta.rows);
  const cells = []; // [x, y, ink, bright]
  let cx = 0;
  for (const [word, co, hi] of WORDS) {
    for (const ch of word) {
      FONT[ch].split(',').forEach((row, r) => {
        for (let i = 0; i < 5; i++) if (row[i] === '1') for (let k = 0; k < PX; k++) cells.push([cx + i * PX + k, r, co, hi]);
      });
      cx += 5 * PX + GAP;
    }
  }
  return (t) => {
    g.clear();
    const head = clamp(t / PRINT) * (meta.cols + 4);                 // print-in edge, in cells
    const st = (t - PRINT) % EVERY;                                     // time since the current sweep started
    const sweepX = t > PRINT && st < SWEEP ? (st / SWEEP) * (meta.cols + BAND) - BAND : -99;
    for (const [x, y, co, hi] of cells) {
      if (x > head) continue;
      const nearHead = t < PRINT && head - x < 3;
      const inSweep = x >= sweepX && x < sweepX + BAND;
      g.set(x, y, '█', nearHead || inSweep ? hi : co);
    }
    if (t < PRINT) for (let y = 0; y < meta.rows; y++) g.set(Math.floor(head) + 1, y, '▌', '1'); // print head
    return g.frame();
  };
}
