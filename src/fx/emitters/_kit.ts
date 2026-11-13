/**
 * Shared helpers for the closed-form emitters (owner: fx). React-free, allocation-free at draw time.
 * Not an emitter (exports no `emitter`), so the registry glob ignores it.
 *
 * Everything here is a pure function of its inputs: emitters draw their per-sprite constants once in
 * create() and evaluate f(i, t, seed) in sprite(), so the Director can seek and ×3 preview is exact.
 */
import { easing, reducedMotion, duration, type EasingName, type Tier } from '../../motion/core/tokens';
import type { Rng } from '../rng';
import type { Viewport } from '../types';

// ------------------------------------------------------------------ easing

/** cubic-bezier(x1, y1, x2, y2) as y(x), solved with Newton + bisection (same curve CSS / Motion use). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (u: number) => ((ax * u + bx) * u + cx) * u;
  const sy = (u: number) => ((ay * u + by) * u + cy) * u;
  const dx = (u: number) => (3 * ax * u + 2 * bx) * u + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u = x;
    for (let k = 0; k < 6; k++) {
      const e = sx(u) - x, d = dx(u);
      if (Math.abs(e) < 1e-6) return sy(u);
      if (Math.abs(d) < 1e-6) break;
      u -= e / d;
    }
    let lo = 0, hi = 1; u = x;
    for (let k = 0; k < 30; k++) { const v = sx(u); if (Math.abs(v - x) < 1e-6) break; if (v < x) lo = u; else hi = u; u = (lo + hi) / 2; }
    return sy(u);
  };
}

const easeCache = new Map<string, (x: number) => number>();
/** A token easing as a function; unknown names fall back to linear. */
export function ease(name: EasingName | string | undefined): (x: number) => number {
  if (!name || name === 'linear') return clamp01;
  let f = easeCache.get(name);
  if (!f) {
    const b = (easing as Record<string, readonly [number, number, number, number]>)[name];
    f = b ? cubicBezier(b[0], b[1], b[2], b[3]) : clamp01;
    easeCache.set(name, f);
  }
  return f;
}

/** Inverse of a monotone ease on [0, 1] by bisection: the x where ease(x) = y. */
export function invEase(f: (x: number) => number, y: number): number {
  if (y <= 0) return 0;
  if (y >= 1) return 1;
  let lo = 0, hi = 1;
  for (let k = 0; k < 32; k++) { const m = (lo + hi) / 2; if (f(m) < y) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

// ------------------------------------------------------------------ numbers

export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);
export const clamp = (x: number, a: number, b: number): number => (x < a ? a : x > b ? b : x);
export const lerp = (a: number, b: number, k: number): number => a + (b - a) * k;
export const DEG = Math.PI / 180;
/** Random value in a [min, max] tuple. */
export const inRange = (r: number, [a, b]: readonly [number, number] | readonly number[]): number => (a ?? 0) + r * ((b ?? a ?? 0) - (a ?? 0));
/** ±1 from a random draw. */
export const sign = (r: number): 1 | -1 => (r < 0.5 ? -1 : 1);

/** Viewport units in CSS px. */
export const vh = (view: Viewport, n: number): number => (view.h / 100) * n;
export const vw = (view: Viewport, n: number): number => (view.w / 100) * n;

/**
 * Sprite count from a step's `params.count` (number, "6-10", or [10, 14]) clamped to the tier budget.
 * Ranges resolve to their upper end (the budget is the cap; the seed never changes the count).
 */
export function countFrom(param: unknown, budget: number): number {
  let n = budget;
  if (typeof param === 'number' && Number.isFinite(param)) n = param;
  else if (typeof param === 'string') { const m = /(\d+)\s*(?:-\s*(\d+))?/.exec(param); if (m) n = Number(m[2] ?? m[1]); }
  else if (Array.isArray(param) && typeof param[param.length - 1] === 'number') n = param[param.length - 1] as number;
  return Math.max(0, Math.min(budget, Math.round(n)));
}

/** Clamp a requested count (EmitOptions.count) to the tier budget (budgets.*[tier]): the budget is a hard cap. */
export const capCount = (requested: number, budget: number): number => Math.max(0, Math.min(Math.round(requested), budget));

/** The §4.5 spectacle crossfade length ("crossfade 300ms"). */
export const REDUCED_CROSSFADE_MS: number = Number(/(\d+)\s*ms/.exec(String(reducedMotion.spectacles))?.[1] ?? duration.modal);

export const TIER_RANK: Record<Tier, number> = { low: 0, mid: 1, high: 2 };

// ------------------------------------------------------------------ colour

const cssCache = new Map<string, string>();
/**
 * Resolve a core colour variable ('--c-flower-wall-mean') to a canvas colour. Core `--c-*` tokens sit
 * on :root, so documentElement is enough; per-theme slots go through the engine's sprite colours.
 */
export function cssColor(name: string, fallback = 'transparent'): string {
  if (!name.startsWith('--')) return name;
  let v = cssCache.get(name);
  if (v === undefined) {
    v = typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() : '';
    if (v) cssCache.set(name, v);
  }
  return v || fallback;
}

// ------------------------------------------------------------------ layouts

export interface Cell { x: number; y: number; jx: number; jy: number }

/**
 * A jittered grid of exactly `n` cells covering the rect (x0, y0, w, h): cell size is chosen from the
 * area so coverage is the same on every tier (fewer sprites → bigger flowers). Returns cell centres
 * and the cell pitch; `jitter` is the fraction of the pitch each centre may move.
 */
export function coverGrid(n: number, x0: number, y0: number, w: number, h: number, rng: Rng, jitter = 0.35): { cells: Cell[]; pitch: number } {
  const cells: Cell[] = [];
  if (n <= 0) return { cells, pitch: 0 };
  const rows = Math.max(1, Math.round(Math.sqrt((n * h) / Math.max(1, w))));
  const cols = Math.max(1, Math.ceil(n / rows));
  const pw = w / cols, ph = h / rows;
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    // odd rows are offset half a cell (brick pattern) so gaps do not line up
    const off = r % 2 ? 0.5 : 0;
    const jx = (rng() - 0.5) * 2 * jitter, jy = (rng() - 0.5) * 2 * jitter;
    cells.push({ x: x0 + ((c + 0.5 + off) % cols) * pw + jx * pw, y: y0 + (r + 0.5) * ph + jy * ph, jx, jy });
  }
  return { cells, pitch: Math.sqrt(pw * ph) };
}

/**
 * Three discrete base sizes per emission so the bitmap cache stays small (shape × colour × 3); the
 * per-sprite variation goes into `scale`, which costs nothing.
 */
export function sizeClass(pitch: number, r: number): { size: number; scale: number } {
  const classes = [1.15, 1.45, 1.8];
  const k = Math.min(2, Math.floor(r * 3));
  return { size: Math.round(pitch * (classes[k] ?? 1.45)), scale: 0.9 + ((r * 3) % 1) * 0.2 };
}

/** Painted-flower shapes used by curtains (shapes.ts), weighted toward the round heads. */
export const FLOWER_SHAPES = ['peony', 'peony', 'rose', 'rose', 'flower', 'daisy', 'hydrangea', 'ranunculus'] as const;

// ------------------------------------------------------------------ layer passes

/** Fill a horizontal band (CSS px) with a colour at alpha: the opaque body under a curtain's sprites. */
export function fillBand(g: CanvasRenderingContext2D, view: Viewport, top: number, bottom: number, color: string, alpha: number): void {
  const a = clamp01(alpha);
  const y0 = Math.max(0, top), y1 = Math.min(view.h, bottom);
  if (a <= 0 || y1 <= y0) return;
  g.globalAlpha = a; g.fillStyle = color; g.fillRect(0, y0, view.w, y1 - y0); g.globalAlpha = 1;
}

/** Coverage of the viewport by a band [top, bottom] (fraction of the height, 0-1). */
export const bandCoverage = (view: Viewport, top: number, bottom: number): number =>
  view.h > 0 ? clamp01((Math.min(view.h, bottom) - Math.max(0, top)) / view.h) : 0;

// ------------------------------------------------------------------ flower picks

const PALETTE: Record<string, readonly string[]> = {
  peony: ['--c-flower-peony-coral', '--c-flower-peony-hot', '--c-blush-400', '--c-flower-peach'],
  rose: ['--c-flower-rose-red', '--c-flower-rose-brick', '--c-flower-peony-hot', '--c-flower-crimson'],
  flower: ['--c-flower-dahlia-salmon', '--c-blush-400', '--c-flower-peach'],
  daisy: ['--c-flower-daisy', '--c-flower-peach'],
  hydrangea: ['--c-flower-hydrangea', '--c-lilac-400'],
  ranunculus: ['--c-flower-dahlia-salmon', '--c-flower-peony-coral', '--c-flower-peach'],
  leaf: ['--c-accent-sage', '--c-accent-forest-soft'],
};

/** A seeded flower head (shape + matching palette colour); `leafShare` of picks are leaves. */
export function pickFlower(r1: number, r2: number, leafShare = 0.12): { shape: string; color: string } {
  if (r1 < leafShare) { const c = PALETTE.leaf!; return { shape: 'leaf', color: c[Math.floor(r2 * c.length) % c.length]! }; }
  const k = (r1 - leafShare) / (1 - leafShare);
  const shape = FLOWER_SHAPES[Math.min(FLOWER_SHAPES.length - 1, Math.floor(k * FLOWER_SHAPES.length))]!;
  const c = PALETTE[shape]!;
  return { shape, color: c[Math.floor(r2 * c.length) % c.length]! };
}

/** The wash colour behind curtains: the measured mean colour of a flower wall. */
export const WALL_MEAN = '--c-flower-wall-mean';
