/* terminal: a quay crane works a ship while a terminal tractor runs the lane behind the stacks.
   Built on ascii-magic-art's Grid (MIT). Drawn in the site palette so it reads as ours. */
import { Grid, palette, clamp } from 'ascii-magic-art/lib/kit.js';

export const meta = {
  slug: 'shiftreplay-terminal',
  name: 'Container terminal',
  category: 'things',
  note: 'A ship-to-shore crane lifts a box off a vessel onto the quay while a tractor loops the truck lane.',
  tags: ['port', 'crane', 'container', 'logistics'],
  cols: 96, rows: 18, fps: 12,
  // 0 ink, 1 muted, 2 dim, 3 accent, 4 blue, 5 red, 6 green, 7 water, 8 steel, 9 orange, a asphalt, b hull, c white
  palette: palette(['#c9d1da', '#6b7682', '#3a434d', '#f5c518', '#3b6fd6', '#d14b3a', '#2f9e63', '#2a4a66', '#8b95a1', '#e58a2a', '#1a1f26', '#242a33', '#f5f7fa']),
};

const ease = (v) => { v = clamp(v); return v * v * (3 - 2 * v); };
// scene layout (cols): ship under the crane on the left, quay and stacks on the right
const BOOM_Y = 2, LEG_L = 14, LEG_R = 30, DECK_Y = 10, QUAY_X = 42, GROUND = 13, LANE_Y = 12;
const PICK_X = 22, DROP_X = 46, PERIOD = 9;

export default function create() {
  const W = meta.cols, H = meta.rows;
  const g = new Grid(W, H);
  const T = (x, y, s, co) => g.text(Math.round(x), Math.round(y), s, co);
  const box = (x, y, co) => T(x, y, '▓▓▓▓', co);
  const stackColours = ['4', '5', '6', '9', '4', '6', '5', '9', '6'];
  return (t) => {
    g.clear();

    // gulls
    for (let i = 0; i < 3; i++) {
      const gx = ((t * 3 + i * 31) % (W + 10)) - 5;
      const gy = 1 + ((i * 7) % 3);
      T(gx, gy, Math.floor(t * 4 + i) % 2 ? '~' : '^', '1');
    }

    // water under the ship
    for (let y = GROUND + 1; y < H; y++) for (let x = 0; x < QUAY_X; x++) {
      const w = Math.sin(x * 0.6 + t * 1.6 + y) > 0.55;
      g.set(x, y, w ? '~' : ' ', w ? '7' : ' ');
    }

    // quay, asphalt and the lane
    for (let x = QUAY_X; x < W; x++) {
      g.set(x, GROUND, '▀', '8');
      for (let y = GROUND + 1; y < H; y++) g.set(x, y, (x + y) % 7 === 0 ? '░' : ' ', 'a');
    }
    for (let x = QUAY_X + 2; x < W; x += 2) g.set(x, LANE_Y, '-', '3'); // lane edge paint

    // container stacks on the quay
    for (let s = 0; s < 8; s++) {
      const sx = QUAY_X + 12 + s * 5;
      const tiers = 1 + ((s * 5) % 3);
      for (let k = 0; k < tiers; k++) box(sx, GROUND - 1 - k - 1, stackColours[(s + k) % stackColours.length]);
    }

    // ship: hull, deck boxes
    T(2, DECK_Y + 1, '▙' + '█'.repeat(36) + '▟', 'b');
    T(3, DECK_Y + 2, '▀'.repeat(36), '2');
    T(4, DECK_Y + 3, '▀'.repeat(34), '2');
    for (let i = 0; i < 6; i++) box(5 + i * 5, DECK_Y, stackColours[(i + 2) % stackColours.length]);
    T(34, DECK_Y - 1, '▐█▌', '8'); T(34, DECK_Y - 2, '▐█▌', '8'); // bridge

    // ship-to-shore crane: boom, legs, cab
    T(4, BOOM_Y, '═'.repeat(QUAY_X + 10), '3');
    for (let y = BOOM_Y + 1; y < GROUND; y++) {
      g.set(LEG_L, y, '│', '3'); g.set(LEG_L + 1, y, '│', '3');
      g.set(LEG_R, y, '│', '3'); g.set(LEG_R + 1, y, '│', '3');
      if (y % 2 === 0) { g.set(LEG_L + 2, y, '╲', '2'); g.set(LEG_R - 1, y, '╱', '2'); }
    }
    T(LEG_L - 2, BOOM_Y + 1, '▐████▌', '8');
    T(LEG_R - 2, BOOM_Y + 1, '▐████▌', '8');
    T(QUAY_X + 6, BOOM_Y - 1, '▲', '3');
    T(QUAY_X + 4, BOOM_Y + 1, '▐█▌', '8'); // cab

    // trolley cycle: lower to the ship, lift, travel to the quay, lower, release, return
    const lt = t % PERIOD;
    let x, y, carry;
    const top = BOOM_Y + 1, shipY = DECK_Y - 1, quayY = GROUND - 2;
    if (lt < 1.4) { x = PICK_X; y = top + ease(lt / 1.4) * (shipY - top); carry = false; }
    else if (lt < 2.6) { x = PICK_X; y = shipY - ease((lt - 1.4) / 1.2) * (shipY - top); carry = true; }
    else if (lt < 4.8) { x = PICK_X + ease((lt - 2.6) / 2.2) * (DROP_X - PICK_X); y = top; carry = true; }
    else if (lt < 6.0) { x = DROP_X; y = top + ease((lt - 4.8) / 1.2) * (quayY - top); carry = true; }
    else if (lt < 7.0) { x = DROP_X; y = quayY - ease((lt - 6.0) / 1.0) * (quayY - top); carry = false; }
    else { x = DROP_X - ease((lt - 7.0) / 2.0) * (DROP_X - PICK_X); y = top; carry = false; }
    const tx = Math.round(x), hy = Math.round(y);
    T(tx - 1, BOOM_Y, '▄█▄', '8');
    for (let yy = BOOM_Y + 1; yy < hy; yy++) g.set(tx, yy, '│', '1');
    T(tx - 2, hy, '▀▀▀▀▀', '3'); // spreader
    if (carry) box(tx - 2, hy + 1, '5');
    if (lt >= 6.0) box(DROP_X - 2, quayY + 1, '5'); // the box just set down
    if (lt < 1.4) box(PICK_X - 2, shipY + 1, '5');  // the box still on deck

    // terminal tractor on the lane, left to right, pausing at the crossing
    const laneLen = W - QUAY_X + 14;
    let u = (t * 0.11) % 1;
    u = u < 0.42 ? u / 0.42 * 0.46 : u < 0.5 ? 0.46 : 0.46 + (u - 0.5) / 0.5 * 0.54; // dwell at the line
    const vx = QUAY_X - 10 + u * laneLen;
    T(vx, LANE_Y - 1, '▄█▀▀█▄▄▄▄▄▄', '9');
    T(vx, LANE_Y, '●═══●═══●', '0');
    // the crossing: a worker waits behind the line while the tractor is near
    const near = Math.abs(vx + 4 - (QUAY_X + 20)) < 9;
    T(QUAY_X + 20, LANE_Y - 1, near ? '¡' : 'i', '3');
    T(QUAY_X + 19, LANE_Y, near ? ' STOP ' : '      ', near ? 'c' : ' ');

    return g.frame();
  };
}
