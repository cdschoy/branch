/**
 * Procedural placeholder sprite art (owner: fx). ORIGINAL shapes in the framework palette — no
 * reference art. Each shape draws into a unit box centred at (0, 0) with radius 1; the engine scales
 * it and caches a bitmap per shape × colour × size bucket. Swap for a WebP atlas later (§7.4).
 */
import type { ShapeId } from './types';

export type ShapeDraw = (g: CanvasRenderingContext2D, color: string) => void;
const shapes = new Map<string, ShapeDraw>();

export function registerShape(id: ShapeId, draw: ShapeDraw): void { shapes.set(id, draw); }
export function getShape(id: ShapeId): ShapeDraw { return shapes.get(id) ?? shapes.get('dot')!; }

registerShape('dot', (g, c) => { g.fillStyle = c; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); });
registerShape('confetti', (g, c) => { g.fillStyle = c; g.fillRect(-1, -0.45, 2, 0.9); });
registerShape('heart', (g, c) => {
  g.fillStyle = c; g.beginPath();
  g.moveTo(0, 0.9);
  g.bezierCurveTo(-1.1, 0.1, -0.95, -0.95, 0, -0.35);
  g.bezierCurveTo(0.95, -0.95, 1.1, 0.1, 0, 0.9);
  g.fill();
});
registerShape('petal', (g, c) => {
  g.fillStyle = c; g.beginPath();
  g.moveTo(0, -1); g.quadraticCurveTo(0.85, -0.2, 0, 1); g.quadraticCurveTo(-0.85, -0.2, 0, -1); g.fill();
});
registerShape('leaf', (g, c) => {
  g.fillStyle = c; g.beginPath();
  g.moveTo(-1, 0); g.quadraticCurveTo(0, -0.7, 1, 0); g.quadraticCurveTo(0, 0.7, -1, 0); g.fill();
});
registerShape('star4', (g, c) => {
  g.fillStyle = c; g.beginPath();
  for (let k = 0; k < 8; k++) { const r = k % 2 ? 0.28 : 1, a = (k * Math.PI) / 4 - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  g.closePath(); g.fill();
});
/** Five round petals + a lighter centre (a gouache-ish flower head). The centre reuses the colour at low alpha. */
registerShape('flower', (g, c) => {
  g.fillStyle = c;
  for (let k = 0; k < 5; k++) {
    const a = (k * 2 * Math.PI) / 5;
    g.beginPath(); g.ellipse(Math.cos(a) * 0.5, Math.sin(a) * 0.5, 0.5, 0.42, a, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 0.35; g.fillStyle = c; g.beginPath(); g.arc(0, 0, 0.3, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
});

/** Flower family colour variables (tokens.css). Emitters pick from these with the seeded rng. */
export const FLOWER_COLORS = [
  '--c-flower-peony-coral', '--c-flower-dahlia-salmon', '--c-flower-rose-brick', '--c-flower-rose-red', '--c-flower-peach',
  '--c-flower-daisy', '--c-flower-hydrangea', '--c-flower-sunflower', '--c-flower-peony-hot', '--c-blush-400',
] as const;
export const HEART_COLORS = ['--c-blush-600', '--c-berry-500', '--c-flower-peony-hot', '--c-blush-400'] as const;
export const CONFETTI_COLORS = ['--c-blush-400', '--c-accent-gold', '--c-accent-teal', '--c-flower-peony-coral', '--c-lilac-400', '--c-accent-honey'] as const;
