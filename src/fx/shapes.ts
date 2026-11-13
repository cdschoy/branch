/**
 * Procedural placeholder sprite art (owner: fx). ORIGINAL shapes in the framework palette — no
 * reference art, no images. Each shape draws into a unit box centred at (0, 0) with radius 1; the
 * engine renders it ONCE per shape × colour × size bucket into an offscreen canvas (the atlas cache in
 * engine.ts, pre-warmed at emit) and then only blits it. Swap for a WebP atlas later (§7.4).
 *
 * Look: flat gouache-ish heads with a darker rim and a soft light dab, built from the sprite colour
 * plus the cream / ink tokens at low alpha (no literal colours).
 */
import type { ShapeId } from './types';
import { mulberry32 } from './rng';

export type ShapeDraw = (g: CanvasRenderingContext2D, color: string) => void;
const shapes = new Map<string, ShapeDraw>();

export function registerShape(id: ShapeId, draw: ShapeDraw): void { shapes.set(id, draw); }
export function getShape(id: ShapeId): ShapeDraw { return shapes.get(id) ?? shapes.get('dot')!; }

const TAU = Math.PI * 2;
const cache = new Map<string, string>();
/** A core colour token (on :root) resolved for canvas; shapes run once per bitmap, so this is cheap. */
function tok(name: string, fallback: string): string {
  let v = cache.get(name);
  if (v === undefined && typeof document !== 'undefined') {
    v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if (v) cache.set(name, v);
  }
  return v || fallback;
}
const LIGHT = () => tok('--c-cream-50', 'white');
const DARK = () => tok('--c-ink-900', 'black');

/** Fixed (module-constant) jitter so every bitmap of a shape is the same painting. */
const J = (() => { const r = mulberry32(0x5eed); return Array.from({ length: 64 }, () => r()); })();
const j = (k: number) => J[k % J.length]!;

function withAlpha(g: CanvasRenderingContext2D, a: number, fn: () => void) { const p = g.globalAlpha; g.globalAlpha = p * a; fn(); g.globalAlpha = p; }

/** One rounded petal from the centre outwards along angle `a`, with a scalloped tip. */
function lobe(g: CanvasRenderingContext2D, a: number, r0: number, len: number, wid: number, scallops = 3) {
  const c = Math.cos(a), s = Math.sin(a);
  const P = (u: number, v: number): [number, number] => [c * u - s * v, s * u + c * v];
  g.beginPath();
  g.moveTo(...P(r0, 0));
  g.bezierCurveTo(...P(r0 + len * 0.25, -wid * 0.9), ...P(r0 + len * 0.8, -wid * 1.05), ...P(r0 + len * 0.92, -wid * 0.55));
  for (let k = 0; k < scallops; k++) {
    const v0 = -wid * 0.55 + ((k + 0.5) * wid * 1.1) / scallops;
    const v1 = -wid * 0.55 + ((k + 1) * wid * 1.1) / scallops;
    g.quadraticCurveTo(...P(r0 + len * 1.06, v0), ...P(r0 + len * 0.94, v1));
  }
  g.bezierCurveTo(...P(r0 + len * 0.8, wid * 1.05), ...P(r0 + len * 0.25, wid * 0.9), ...P(r0, 0));
  g.closePath();
}

function rimmed(g: CanvasRenderingContext2D, color: string, rim = 0.16, lw = 0.045) {
  g.fillStyle = color; g.fill();
  withAlpha(g, rim, () => { g.strokeStyle = DARK(); g.lineWidth = lw; g.stroke(); });
}

function dab(g: CanvasRenderingContext2D, x: number, y: number, r: number, a = 0.22) {
  withAlpha(g, a, () => { g.fillStyle = LIGHT(); g.beginPath(); g.ellipse(x, y, r, r * 0.6, -0.6, 0, TAU); g.fill(); });
}

// ------------------------------------------------------------------ basics
registerShape('dot', (g, c) => { g.fillStyle = c; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); });
registerShape('confetti', (g, c) => {
  g.fillStyle = c; g.beginPath(); g.roundRect(-1, -0.42, 2, 0.84, 0.12); g.fill();
  withAlpha(g, 0.25, () => { g.fillStyle = LIGHT(); g.fillRect(-1, -0.42, 2, 0.22); });
});
registerShape('heart', (g, c) => {
  g.fillStyle = c; g.beginPath();
  g.moveTo(0, 0.92);
  g.bezierCurveTo(-1.15, 0.12, -0.98, -0.98, 0, -0.36);
  g.bezierCurveTo(0.98, -0.98, 1.15, 0.12, 0, 0.92);
  g.closePath(); rimmed(g, c, 0.12, 0.05);
  dab(g, -0.42, -0.38, 0.2, 0.35);
});
registerShape('petal', (g, c) => {
  g.beginPath(); g.moveTo(0, -1); g.bezierCurveTo(0.95, -0.45, 0.6, 0.75, 0, 1); g.bezierCurveTo(-0.6, 0.75, -0.95, -0.45, 0, -1); g.closePath();
  rimmed(g, c, 0.1, 0.04);
  withAlpha(g, 0.16, () => { g.strokeStyle = DARK(); g.lineWidth = 0.05; g.beginPath(); g.moveTo(0, 0.85); g.quadraticCurveTo(0.08, 0, 0, -0.7); g.stroke(); });
  dab(g, -0.2, -0.3, 0.18);
});
registerShape('leaf', (g, c) => {
  g.beginPath(); g.moveTo(-1, 0); g.bezierCurveTo(-0.4, -0.72, 0.5, -0.62, 1, 0); g.bezierCurveTo(0.5, 0.62, -0.4, 0.72, -1, 0); g.closePath();
  rimmed(g, c, 0.14, 0.04);
  withAlpha(g, 0.22, () => {
    g.strokeStyle = DARK(); g.lineWidth = 0.045; g.beginPath(); g.moveTo(-0.95, 0); g.quadraticCurveTo(0, -0.06, 0.9, 0); g.stroke();
    for (let k = 0; k < 3; k++) { const x = -0.45 + k * 0.42; g.beginPath(); g.moveTo(x, -0.02); g.lineTo(x + 0.22, -0.3); g.moveTo(x, 0.0); g.lineTo(x + 0.22, 0.28); g.stroke(); }
  });
});
registerShape('star4', (g, c) => {
  g.fillStyle = c; g.beginPath();
  for (let k = 0; k < 8; k++) { const r = k % 2 ? 0.28 : 1, a = (k * Math.PI) / 4 - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  g.closePath(); g.fill();
});
/** Thin four-point twinkle (capture flash, sparkles). */
registerShape('twinkle', (g, c) => {
  g.fillStyle = c; g.beginPath();
  for (let k = 0; k < 8; k++) { const r = k % 2 ? 0.12 : 1, a = (k * Math.PI) / 4 - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  g.closePath(); g.fill();
});

// ------------------------------------------------------------------ flash / impact
/** Painted starburst: alternating long and short rays around a soft core (P23, C7 impact). */
registerShape('starburst', (g, c) => {
  const n = 16;
  g.fillStyle = c; g.beginPath();
  for (let k = 0; k < n * 2; k++) {
    const a = (k * Math.PI) / n - Math.PI / 2;
    const r = k % 2 ? 0.2 : k % 4 === 0 ? 1 : 0.62 + j(k) * 0.12;
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath(); g.fill();
  withAlpha(g, 0.7, () => { g.fillStyle = LIGHT(); g.beginPath(); g.arc(0, 0, 0.24, 0, TAU); g.fill(); });
});
/** A ray along +x, tapering to a point at both ends (rotated per sprite). */
registerShape('ray', (g, c) => {
  g.fillStyle = c; g.beginPath(); g.moveTo(-1, 0); g.quadraticCurveTo(0, -0.11, 1, 0); g.quadraticCurveTo(0, 0.11, -1, 0); g.closePath(); g.fill();
});
/** Shockwave ring. */
registerShape('ring', (g, c) => { g.strokeStyle = c; g.lineWidth = 0.1; g.beginPath(); g.arc(0, 0, 0.92, 0, TAU); g.stroke(); });
/** Soft radial glow: the colour at the centre fading to transparent at the rim. */
registerShape('glow', (g, c) => {
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
  gr.addColorStop(0, c); gr.addColorStop(0.35, c); gr.addColorStop(1, 'transparent');
  withAlpha(g, 0.85, () => { g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); });
});

// ------------------------------------------------------------------ flowers
/** Five round petals + a soft centre (simple wildflower). */
registerShape('flower', (g, c) => {
  for (let k = 0; k < 5; k++) { lobe(g, (k * TAU) / 5 - Math.PI / 2, 0.05, 0.9, 0.42, 2); rimmed(g, c, 0.12, 0.04); }
  withAlpha(g, 0.85, () => { g.fillStyle = tok('--c-flower-sunflower', c); g.beginPath(); g.arc(0, 0, 0.22, 0, TAU); g.fill(); });
  withAlpha(g, 0.35, () => { g.fillStyle = tok('--c-flower-sunflower-centre', c); g.beginPath(); g.arc(0.04, 0.04, 0.12, 0, TAU); g.fill(); });
  dab(g, -0.35, -0.45, 0.16);
});

/** Ruffled peony: three rings of scalloped petals, darker toward the cupped middle. */
registerShape('peony', (g, c) => {
  const rings: [number, number, number, number, number][] = [
    // count, r0, len, wid, rotation
    [7, 0.12, 0.86, 0.36, 0.1],
    [6, 0.08, 0.62, 0.3, 0.45],
    [5, 0.04, 0.4, 0.24, 0.9],
  ];
  rings.forEach(([n, r0, len, wid, rot], ri) => {
    for (let k = 0; k < n; k++) {
      const a = rot + (k * TAU) / n + (j(ri * 9 + k) - 0.5) * 0.25;
      lobe(g, a, r0, len * (0.92 + j(ri * 7 + k + 3) * 0.12), wid, 3);
      rimmed(g, c, 0.1 + ri * 0.05, 0.035);
    }
    if (ri < 2) withAlpha(g, 0.07, () => { g.fillStyle = DARK(); g.beginPath(); g.arc(0, 0, (r0 + len) * 0.7, 0, TAU); g.fill(); });
  });
  withAlpha(g, 0.3, () => { g.fillStyle = DARK(); g.beginPath(); g.arc(0, 0, 0.1, 0, TAU); g.fill(); });
  dab(g, -0.38, -0.42, 0.2); dab(g, 0.3, 0.42, 0.1, 0.12);
});

/** Rose: guard petals and a spiralling cup of arcs. */
registerShape('rose', (g, c) => {
  for (let k = 0; k < 5; k++) { lobe(g, (k * TAU) / 5 + 0.3, 0.2, 0.76, 0.48, 2); rimmed(g, c, 0.16, 0.04); }
  g.fillStyle = c; g.beginPath(); g.arc(0, 0, 0.62, 0, TAU); g.fill();
  withAlpha(g, 0.1, () => { g.fillStyle = DARK(); g.beginPath(); g.arc(0.03, 0.03, 0.55, 0, TAU); g.fill(); });
  g.lineCap = 'round';
  for (let k = 0; k < 6; k++) {
    const r = 0.55 - k * 0.085, a0 = k * 1.9 + 0.4;
    withAlpha(g, 0.22 + k * 0.04, () => { g.strokeStyle = DARK(); g.lineWidth = 0.05; g.beginPath(); g.arc(0, 0, Math.max(0.05, r), a0, a0 + 3.6); g.stroke(); });
    withAlpha(g, 0.16, () => { g.strokeStyle = LIGHT(); g.lineWidth = 0.035; g.beginPath(); g.arc(0, 0, Math.max(0.04, r - 0.04), a0 + 0.3, a0 + 2.2); g.stroke(); });
  }
  dab(g, -0.3, -0.36, 0.16);
});

/** Ranunculus: many tight concentric layers. */
registerShape('ranunculus', (g, c) => {
  for (let k = 0; k < 9; k++) { lobe(g, (k * TAU) / 9, 0.3, 0.66, 0.34, 2); rimmed(g, c, 0.1, 0.03); }
  for (let r = 0.7; r > 0.08; r -= 0.1) {
    g.fillStyle = c; g.beginPath(); g.arc((j(r * 40) - 0.5) * 0.04, (j(r * 50) - 0.5) * 0.04, r, 0, TAU); g.fill();
    withAlpha(g, 0.14, () => { g.strokeStyle = DARK(); g.lineWidth = 0.03; g.stroke(); });
  }
  withAlpha(g, 0.45, () => { g.fillStyle = tok('--c-accent-forest', DARK()); g.beginPath(); g.arc(0, 0, 0.07, 0, TAU); g.fill(); });
  dab(g, -0.32, -0.38, 0.15);
});

/** Daisy: sixteen slim petals and a golden centre. */
registerShape('daisy', (g, c) => {
  for (let k = 0; k < 16; k++) {
    const a = (k * TAU) / 16 + (j(k) - 0.5) * 0.12;
    g.save(); g.rotate(a); g.beginPath(); g.ellipse(0.55, 0, 0.42 + j(k + 5) * 0.04, 0.11, 0, 0, TAU); g.restore();
    rimmed(g, c, 0.14, 0.03);
  }
  g.fillStyle = tok('--c-flower-sunflower', c); g.beginPath(); g.arc(0, 0, 0.27, 0, TAU); g.fill();
  withAlpha(g, 0.5, () => {
    g.fillStyle = tok('--c-flower-sunflower-centre', DARK());
    for (let k = 0; k < 14; k++) { const a = k * 2.4, r = 0.2 * Math.sqrt((k + 0.5) / 14); g.beginPath(); g.arc(Math.cos(a) * r, Math.sin(a) * r, 0.03, 0, TAU); g.fill(); }
  });
});

/** Hydrangea: a dome of small four-petal florets. */
registerShape('hydrangea', (g, c) => {
  g.fillStyle = c; g.beginPath(); g.arc(0, 0, 0.8, 0, TAU); g.fill();
  withAlpha(g, 0.12, () => { g.fillStyle = DARK(); g.beginPath(); g.arc(0.05, 0.08, 0.78, 0, TAU); g.fill(); });
  for (let k = 0; k < 13; k++) {
    const a = k * 2.39996, r = 0.7 * Math.sqrt((k + 0.5) / 13);
    const x = Math.cos(a) * r, y = Math.sin(a) * r, s = 0.2;
    for (let p = 0; p < 4; p++) {
      const pa = (p * Math.PI) / 2 + a;
      g.beginPath(); g.ellipse(x + Math.cos(pa) * s * 0.55, y + Math.sin(pa) * s * 0.55, s * 0.55, s * 0.4, pa, 0, TAU);
      g.fillStyle = c; g.fill();
      withAlpha(g, 0.08 + j(k + p) * 0.12, () => { g.fillStyle = k % 3 ? LIGHT() : DARK(); g.fill(); });
      withAlpha(g, 0.14, () => { g.strokeStyle = DARK(); g.lineWidth = 0.02; g.stroke(); });
    }
    withAlpha(g, 0.4, () => { g.fillStyle = LIGHT(); g.beginPath(); g.arc(x, y, 0.035, 0, TAU); g.fill(); });
  }
});

/** Flower family colour variables (tokens.css). Emitters pick from these with the seeded rng. */
export const FLOWER_COLORS = [
  '--c-flower-peony-coral', '--c-flower-dahlia-salmon', '--c-flower-rose-brick', '--c-flower-rose-red', '--c-flower-peach',
  '--c-flower-daisy', '--c-flower-hydrangea', '--c-flower-sunflower', '--c-flower-peony-hot', '--c-blush-400',
] as const;
export const HEART_COLORS = ['--c-blush-600', '--c-berry-500', '--c-flower-peony-hot', '--c-blush-400'] as const;
export const CONFETTI_COLORS = ['--c-blush-400', '--c-accent-gold', '--c-accent-teal', '--c-flower-peony-coral', '--c-lilac-400', '--c-accent-honey'] as const;
/** Leaves tucked between flower heads. */
export const LEAF_COLORS = ['--c-accent-sage', '--c-accent-forest-soft'] as const;
/** Light for flash glints / starbursts. */
export const GLINT_COLORS = ['--c-cream-50', '--c-accent-twinkle', '--c-butter-200'] as const;
