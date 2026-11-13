/**
 * Reduced-motion variants (FRAMEWORK §4.5; owner: fx). Spectacles become a short crossfade on a static
 * flower frame (no travel, no spin); particles are off. Not an emitter (the registry ignores this file).
 */
import type { EmitterInit, EmitterInstance } from '../types';
import { coverGrid, cssColor, fillBand, pickFlower, sizeClass, REDUCED_CROSSFADE_MS, WALL_MEAN, clamp01 } from './_kit';
import { mulberry32 } from '../rng';

/** in: fade up to a full cover (ends covered); out: start covered and fade away; inout: up then away. */
export type CoverProfile = 'in' | 'out' | 'inout';

export interface CoverInstance extends EmitterInstance {
  /** Fraction of the viewport hidden at local time t (0-1). Pure. */
  coverage(t: number): number;
  /** The local time at which a caller should swap the scene under the cover (≥70% cover). */
  readonly coverAtMs: number;
}

/** Alpha of a cover profile at t over `ms`. */
export function profileAlpha(profile: CoverProfile, t: number, ms: number): number {
  const p = clamp01(t / Math.max(1, ms));
  if (profile === 'in') return p;
  if (profile === 'out') return 1 - p;
  return p < 0.5 ? p * 2 : (1 - p) * 2;
}

/** A static flower frame that crossfades per `profile` over the §4.5 300 ms. */
export function reducedCurtain(init: EmitterInit<any>, profile: CoverProfile): CoverInstance {
  const { view } = init;
  const rng = mulberry32(init.seed ^ 0x2ed);
  const n = Math.min(init.count, 40);
  const { cells, pitch } = coverGrid(n, 0, 0, view.w, view.h, rng);
  const k = cells.map((c) => { const f = pickFlower(rng(), rng()); const s = sizeClass(pitch, rng()); return { ...c, ...f, ...s, rot: (rng() - 0.5) * 0.5 }; });
  const ms = REDUCED_CROSSFADE_MS;
  const wash = cssColor(WALL_MEAN);
  const coverage = (t: number) => profileAlpha(profile, t, ms);
  return {
    count: k.length,
    durationMs: ms,
    coverAtMs: profile === 'out' ? 0 : profile === 'in' ? ms * 0.7 : ms / 2,
    coverage,
    before(g, t, v) { fillBand(g, v, 0, v.h, wash, coverage(t) * 0.95); },
    sprite(i, t, out) {
      const c = k[i]!;
      out.x = c.x; out.y = c.y; out.rot = c.rot; out.scale = c.scale; out.size = c.size;
      out.shape = c.shape; out.color = c.color; out.alpha = coverage(t);
      return out.alpha > 0;
    },
  };
}

/** Particles under reduced motion: nothing to draw, finishes on the next frame. */
export function offInstance(): EmitterInstance {
  return { count: 0, durationMs: 0, sprite: () => false };
}

/** First local time (10 ms steps) at which `coverage(t)` reaches `at` (default the §4.2 70% swap rule). */
export function firstCover(coverage: (t: number) => number, total: number, at = 0.7): number {
  for (let t = 0; t <= total; t += 10) if (coverage(t) >= at) return t;
  return total;
}
