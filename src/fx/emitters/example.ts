/**
 * Reference emitter (owner: scaffold) — the pattern every fx emitter follows. Not used by any scene.
 * Hearts rise from the origin with a seeded spread and fade: all constants drawn once in create(),
 * sprite(i, t) is pure.
 */
import type { EmitterDef } from '../types';
import { budgets, duration } from '../../motion/core/tokens';
import { range, pick } from '../rng';
import { HEART_COLORS } from '../shapes';

export const emitter: EmitterDef = {
  id: 'example',
  count: (tier) => budgets.heartsPerBurst[tier],
  create({ rng, origin, count, durMs }) {
    const total = durMs ?? duration.finaleCover;
    const k = Array.from({ length: count }, () => ({
      dx: range(rng(), -60, 60), rise: range(rng(), 50, 110), delay: range(rng(), 0, 0.25) * total,
      size: range(rng(), 12, 22), rot: range(rng(), -0.4, 0.4), color: pick(rng(), HEART_COLORS),
    }));
    return {
      count, durationMs: total,
      sprite(i, t, out) {
        const c = k[i]!;
        const p = (t - c.delay) / (total - c.delay);
        if (p <= 0 || p >= 1) return false;
        const e = 1 - (1 - p) * (1 - p); // outQuad on rise
        out.x = origin.x + c.dx * e; out.y = origin.y - c.rise * e;
        out.rot = c.rot; out.scale = Math.min(1, p * 6); out.alpha = p > 0.7 ? (1 - p) / 0.3 : 1;
        out.size = c.size; out.shape = 'heart'; out.color = c.color;
        return true;
      },
    };
  },
};
