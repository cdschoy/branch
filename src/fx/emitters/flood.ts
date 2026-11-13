/**
 * FlowerCurtain mode "flood" (C7 finale; FRAMEWORK §4.2 P38 flood, v4 D20-D21; owner: fx).
 *
 * A wall of heads rises NEAR-LINEARLY at `vhPerS` (240-260, default 250 vh/s) from below the screen:
 * the leading edge reaches the top after 100 vh (400 ms at 250 vh/s) = full cover (C7.swap at 1200 ms
 * from the tap = 800 + 400). The wall is 130 vh deep, so in the clear phase (630 ms) it streams on up
 * and its tail clears the top. Heads churn (a small rotation wobble) as they rise ("burst churn").
 *
 * Phases: no phase + durMs → the rise only (C7.wall, dur 400); params.phase "clear" → the clear only
 * (C7.fieldClear, dur 630), continuing from the same layout (same seed); standalone (no durMs) plays
 * both (1030 ms). One frame of ramp at the start (§4.2).
 */
import type { EmitterDef } from '../types';
import { budgets, flowerCurtain, choreography, duration, type Tier } from '../../motion/core/tokens';
import { coverGrid, cssColor, fillBand, pickFlower, sizeClass, vh, WALL_MEAN, bandCoverage, capCount } from './_kit';
import { reducedCurtain, type CoverInstance } from './_reduced';

const F = flowerCurtain.flood;
const step = (name: string) => choreography.C7.steps.find((s) => s.name === name);
const CLEAR_MS = step('C7.fieldClear')?.dur ?? 630;
const DEFAULT_V = (F.vhPerS[0] + F.vhPerS[1]) / 2;
const DEPTH_VH = 130;

export interface FloodParams { phase?: 'clear'; vhPerS?: number }

export const emitter: EmitterDef<FloodParams> = {
  id: 'flood',
  count: (tier: Tier) => budgets.finaleSprites[tier],
  create(init): CoverInstance {
    const clearOnly = init.params.phase === 'clear';
    if (init.reduced) return reducedCurtain(init, clearOnly ? 'out' : init.durMs ? 'in' : 'inout');
    const { rng, view, params } = init;
    const v = vh(view, typeof params.vhPerS === 'number' ? params.vhPerS : DEFAULT_V) / 1000; // px/ms
    const riseMs = view.h / v;
    const offset = clearOnly ? riseMs : 0;
    const total = init.durMs ?? (clearOnly ? CLEAR_MS : riseMs + CLEAR_MS);
    const n = capCount(init.count, budgets.finaleSprites[init.tier]);
    const depth = vh(view, DEPTH_VH);
    const { cells, pitch } = coverGrid(n, 0, 0, view.w, depth, rng, 0.3);
    const ramp = duration.frame;
    const sprites = cells.map((c) => {
      const f = pickFlower(rng(), rng(), 0.14);
      const s = sizeClass(pitch, rng());
      return {
        x: c.x, dy: c.y, wob: (0.12 + rng() * 0.2) * (rng() < 0.5 ? -1 : 1), wobP: 260 + rng() * 220, ph: rng() * Math.PI * 2,
        rot0: rng() * Math.PI * 2, size: s.size, scale: s.scale, shape: f.shape, color: f.color, sway: pitch * 0.12 * rng(),
      };
    });
    // lead edge (closed form, with a 1-frame ease-in ramp): starts just below the screen
    const travel = (T: number) => (T < ramp ? (v * T * T) / (2 * ramp) : v * (T - ramp / 2));
    const lead = (T: number) => view.h + pitch * 0.6 - travel(T);
    const wash = cssColor(WALL_MEAN);
    const inset = pitch * 0.35;
    return {
      count: sprites.length,
      durationMs: total,
      coverAtMs: clearOnly ? 0 : Math.min(total, riseMs + ramp),
      coverage: (t) => bandCoverage(view, lead(t + offset) + inset, lead(t + offset) + depth - inset),
      before(g, t, vp) { const y = lead(t + offset); fillBand(g, vp, y + inset, y + depth - inset, wash, 0.96); },
      sprite(i, t, out) {
        const c = sprites[i]!;
        const T = t + offset;
        out.y = lead(T) + c.dy;
        if (out.y - c.size > view.h || out.y + c.size < 0) return false;
        out.x = c.x + c.sway * Math.sin(T / c.wobP * Math.PI * 2 + c.ph);
        out.rot = c.rot0 + c.wob * Math.sin((T / c.wobP) * Math.PI * 2 + c.ph);
        out.scale = c.scale; out.alpha = 1; out.size = c.size; out.shape = c.shape; out.color = c.color;
        return true;
      },
    };
  },
};
