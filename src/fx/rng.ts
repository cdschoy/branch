/**
 * Seeded randomness for closed-form sprites (FRAMEWORK §4.2 determinism; owner: scaffold).
 * Every sprite is f(index, t, seed): draw per-sprite constants once at emitter creation with
 * `mulberry32(seed)` (or statelessly with `rand01(seed, i, salt)`), never per frame.
 */
export { hashSeed } from '../motion/core/hash';

export type Rng = () => number;

/** mulberry32 PRNG: deterministic floats in [0, 1). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stateless: a float in [0, 1) for (seed, index, salt). Same inputs → same output. */
export function rand01(seed: number, i: number, salt = 0): number {
  let h = (seed ^ Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca77)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const range = (r: number, min: number, max: number): number => min + r * (max - min);
export const pick = <T>(r: number, xs: readonly T[]): T => xs[Math.min(xs.length - 1, Math.floor(r * xs.length))] as T;
