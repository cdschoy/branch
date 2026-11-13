/**
 * FlowerCurtain mode "reveal" (P38 reveal; FRAMEWORK §4.2, v4 A1-A4; owner: fx). Default gift opening.
 *
 * The screen starts covered by flowers (plus a second rank seeded above so the top stays covered) and
 * every head falls BALLISTICALLY: y = y0 + v0·t + ½·g·t² with g = 42 vh/s², v0 ∈ −2.5…+11 vh/s, drifting
 * 0-6 vw outward, tilted ±6-20° by quadrant (no spin), fading linearly 1 → 0 over the last 2.0 s of the
 * 2230 ms. The wall-mean wash under the heads falls with the mean head and fades on the same line.
 * Leaving sprites accelerate; nothing decelerates into the exit (§4.2 law).
 */
import type { EmitterDef } from '../types';
import { budgets, flowerCurtain, type Tier } from '../../motion/core/tokens';
import { coverGrid, cssColor, fillBand, inRange, pickFlower, sizeClass, vh, vw, DEG, WALL_MEAN, clamp01, capCount } from './_kit';
import { reducedCurtain, type CoverInstance } from './_reduced';

const R = flowerCurtain.reveal;

export const emitter: EmitterDef = {
  id: 'curtainReveal',
  count: (tier: Tier) => budgets.flowerSprites[tier],
  create(init): CoverInstance {
    if (init.reduced) return reducedCurtain(init, 'out');
    const { rng, view } = init;
    const total = init.durMs ?? R.durationMs;
    const k = total / R.durationMs;
    const fadeFrom = total - R.fadeMs * k;
    const n = capCount(init.count, budgets.flowerSprites[init.tier]);
    const above = vh(view, 25); // the second rank, seeded above the top edge
    const { cells, pitch } = coverGrid(n, 0, -above, view.w, view.h + above, rng);
    const g = vh(view, R.gravityVhPerS2) / 1e6 / (k * k); // px/ms²
    const cx = view.w / 2, cy = view.h / 2;
    const sprites = cells.map((c) => {
      const f = pickFlower(rng(), rng());
      const s = sizeClass(pitch, rng());
      const out = c.x < cx ? -1 : 1, up = c.y < cy ? -1 : 1;
      return {
        x0: c.x, y0: c.y,
        v0: vh(view, inRange(rng(), R.v0VhPerS)) / 1000 / k,
        drift: out * vw(view, inRange(rng(), R.driftVw)),
        tilt: out * up * inRange(rng(), R.tiltDeg) * DEG,
        size: s.size, scale: s.scale, shape: f.shape, color: f.color,
      };
    });
    const meanV0 = vh(view, (R.v0VhPerS[0] + R.v0VhPerS[1]) / 2) / 1000 / k;
    const fall = (t: number, v0: number) => v0 * t + 0.5 * g * t * t;
    const alpha = (t: number) => (t <= fadeFrom ? 1 : clamp01(1 - (t - fadeFrom) / (total - fadeFrom)));
    const wash = cssColor(WALL_MEAN);
    const inset = pitch * 0.4;
    const top = (t: number) => -above + fall(t, meanV0) + inset;
    return {
      count: sprites.length,
      durationMs: total,
      coverAtMs: 0,
      coverage: (t) => clamp01(alpha(t) * clamp01((view.h - Math.max(0, top(t))) / view.h)),
      before(gc, t, v) { fillBand(gc, v, top(t), v.h + fall(t, meanV0) + above, wash, alpha(t) * alpha(t) * 0.95); },
      sprite(i, t, o) {
        const c = sprites[i]!;
        const p = t / total;
        o.y = c.y0 + fall(t, c.v0);
        if (o.y - c.size > view.h) return false;
        o.x = c.x0 + c.drift * p;
        o.rot = c.tilt * Math.min(1, p * 4);
        o.scale = c.scale; o.alpha = alpha(t); o.size = c.size; o.shape = c.shape; o.color = c.color;
        return o.alpha > 0;
      },
    };
  },
};
