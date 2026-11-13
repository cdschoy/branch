/**
 * Closed-form motion math for ticker-driven primitives (owner: primitives). React-free.
 * Everything here is a pure function of time, so the Director can seek / scrub it exactly.
 */
import { easing, spring, type EasingName, type SpringName } from '../tokens';

/** cubic-bezier(x1, y1, x2, y2) evaluated at progress x ∈ [0, 1] (Newton + bisection). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const e = sx(t) - x;
      const d = dx(t);
      if (Math.abs(e) < 1e-5) return sy(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1; t = x;
    for (let i = 0; i < 24; i++) { const v = sx(t); if (Math.abs(v - x) < 1e-5) break; if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    return sy(t);
  };
}

const cache = new Map<EasingName, (x: number) => number>();
/** Named token easing as a function. */
export function ease(name: EasingName): (x: number) => number {
  let f = cache.get(name);
  if (!f) { const [a, b, c, d] = easing[name]; f = cubicBezier(a, b, c, d); cache.set(name, f); }
  return f;
}

/**
 * Normalised spring progress 0 → 1 at `ms` for a named preset (zero initial velocity), the same
 * physics springs.py simulated for the tokens. Overshoot shows as values above 1.
 */
export function springAt(name: SpringName, ms: number): number {
  const { stiffness: k, damping: c, mass: m } = spring[name];
  const t = Math.max(0, ms) / 1000;
  const w0 = Math.sqrt(k / m);
  const z = c / (2 * Math.sqrt(k * m));
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }
  if (z === 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  const r1 = -w0 * (z - Math.sqrt(z * z - 1)), r2 = -w0 * (z + Math.sqrt(z * z - 1));
  const A = r2 / (r2 - r1), B = -r1 / (r2 - r1);
  return 1 - (A * Math.exp(r1 * t) + B * Math.exp(r2 * t));
}

/** Value of a spring travelling from → to at `ms`. */
export const springValue = (name: SpringName, from: number, to: number, ms: number): number => from + (to - from) * springAt(name, ms);

/** Quadratic Bézier point. */
export const quad = (p0: number, p1: number, p2: number, u: number): number => (1 - u) * (1 - u) * p0 + 2 * (1 - u) * u * p1 + u * u * p2;

/** Piecewise-linear keyframe lookup with per-segment easing. */
export function keyframeAt(values: readonly number[], times: readonly number[], p: number, fn: (x: number) => number = (x) => x): number {
  if (p <= 0) return values[0] ?? 0;
  if (p >= 1) return values[values.length - 1] ?? 0;
  for (let i = 1; i < times.length; i++) {
    const t1 = times[i] ?? 1;
    if (p <= t1) {
      const t0 = times[i - 1] ?? 0, v0 = values[i - 1] ?? 0, v1 = values[i] ?? v0;
      const local = t1 === t0 ? 1 : (p - t0) / (t1 - t0);
      return v0 + (v1 - v0) * fn(local);
    }
  }
  return values[values.length - 1] ?? 0;
}

/** Deterministic 0-1 hash noise (mulberry32 step). */
export function noise(seed: number, i: number): number {
  let a = (seed + Math.imul(i + 1, 0x9e3779b9)) >>> 0;
  a = (a + 0x6d2b79f5) >>> 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * P37 toss path: a true quadratic Bézier from (dx, dy) (start offset from the rest position, px) to
 * (0, 0). The control point sits 3/4 along x (so x decelerates like outQuad) and `arcPx` above the
 * higher end (so y rises decelerating and falls accelerating into a hard stop).
 */
export function tossPoint(dx: number, dy: number, arcPx: number, u: number): { x: number; y: number } {
  const cx = dx * 0.25;
  const cy = Math.min(dy, 0) - 2 * arcPx;
  return { x: quad(dx, cx, 0, u), y: quad(dy, cy, 0, u) };
}

/**
 * P44 idle-wobble segment list: irregular inOutSine legs of 400-633 ms within the token ranges,
 * small (≤3°, ≤ a third of the range) until `smallForMs`. Pure function of the seed.
 */
export interface WobbleSeg { readonly t0: number; readonly ms: number; readonly x: number; readonly y: number; readonly r: number }
export function wobbleSegments(seed: number, count: number, p: {
  readonly xPctW: readonly number[]; readonly yPctH: readonly number[]; readonly rotateDeg: readonly number[];
  readonly segmentMs: readonly number[]; readonly smallForMs: number;
}): WobbleSeg[] {
  const [x0 = -4, x1 = 4] = p.xPctW, [y0 = 0, y1 = 7] = p.yPctH, [r0 = -1.5, r1 = 10] = p.rotateDeg, [m0 = 400, m1 = 633] = p.segmentMs;
  const out: WobbleSeg[] = [];
  let t = 0;
  for (let i = 0; i < count; i++) {
    const small = t < p.smallForMs;
    const k = small ? 1 / 3 : 1;
    const ms = m0 + (m1 - m0) * noise(seed, i * 4);
    const x = (x0 + (x1 - x0) * noise(seed, i * 4 + 1)) * k;
    const y = (y0 + (y1 - y0) * noise(seed, i * 4 + 2)) * k;
    let r = r0 + (r1 - r0) * noise(seed, i * 4 + 3);
    if (small) r = Math.max(-3, Math.min(3, r * k));
    out.push({ t0: t, ms, x, y, r });
    t += ms;
  }
  return out;
}
