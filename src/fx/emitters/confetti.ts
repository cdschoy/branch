/**
 * Confetti fountain (P22; FRAMEWORK §4.2, v1 #25/#29/#33; owner: fx).
 *
 * 11-15 flakes (budgets.confettiPerLanding: 15 / 12 / 8) thrown up from the landed strip and falling
 * under gravity, all in STRIP-RELATIVE units: y = y0 + vy0·H·t + ½·g·H·t² with vy0 = −0.60 strip
 * heights/s and g = 2.36 strip heights/s² (a ~0.076 H apex at ~254 ms, ~0.27 H below the start at
 * 800 ms), spreading ±34% of the strip width over the 800 ms. Drawn on the stage canvas, never clipped
 * to the photo. `params.rect` ({ w, h }: the strip's box, set by the bridge / wrapper) gives H and W.
 * Reduced motion: off.
 */
import type { EmitterDef } from '../types';
import { budgets, duration, primitive, type Tier } from '../../motion/core/tokens';
import { CONFETTI_COLORS } from '../shapes';
import { pick } from '../rng';
import { countFrom, inRange, vh, DEG } from './_kit';
import { offInstance } from './_reduced';

const C = primitive.confettiFountain;
const SHAPES = ['confetti', 'confetti', 'confetti', 'dot', 'star4'] as const;
export interface ConfettiParams { count?: unknown; rect?: { w: number; h: number; top?: number } }

export const emitter: EmitterDef<ConfettiParams> = {
  id: 'confetti',
  count: (tier: Tier, p) => countFrom(p?.count, budgets.confettiPerLanding[tier]),
  create({ rng, origin, view, count, durMs, params, tier, reduced }) {
    if (reduced) return offInstance();
    const H = params.rect?.h ?? vh(view, 45);
    const W = params.rect?.w ?? H * 0.37;
    const top = params.rect?.top ?? origin.y - H / 2;
    const total = durMs ?? C.durMs;
    const n = Math.min(count, budgets.confettiPerLanding[tier]);
    const vy0 = (C.vy0StripHPerS * H) / 1000, g = (C.gStripHPerS2 * H) / 1e6; // px/ms, px/ms²
    const k = Array.from({ length: n }, (_, i) => {
      const lane = n > 1 ? (i / (n - 1)) * 2 - 1 : 0;
      const shape = pick(rng(), SHAPES);
      return {
        x: origin.x + lane * W * 0.25, y: top + H * (0.04 + rng() * 0.1),
        sx: (lane * 0.7 + (rng() - 0.5) * 0.6) * (C.spreadPctW / 100) * W / total,
        vy: vy0 * (0.8 + rng() * 0.4),
        spin: (rng() < 0.5 ? -1 : 1) * inRange(rng(), C.spinDegPerS) * DEG / 1000, rot0: rng() * Math.PI,
        size: Math.max(5, Math.round((W * inRange(rng(), C.sizePctW)) / 100 * (shape === 'confetti' ? 1.4 : 1))),
        shape, color: pick(rng(), CONFETTI_COLORS), delay: rng() * duration.frame,
      };
    });
    return {
      count: n, durationMs: total,
      sprite(i, t, o) {
        const c = k[i]!;
        const lt = t - c.delay;
        if (lt <= 0 || lt >= total - c.delay) return false;
        o.x = c.x + c.sx * lt;
        o.y = c.y + c.vy * lt + 0.5 * g * lt * lt;
        o.rot = c.rot0 + c.spin * lt;
        // paper flutter: the flake's apparent width breathes as it tumbles
        o.scale = 0.75 + 0.25 * Math.abs(Math.cos(c.spin * lt * 1.7));
        const left = total - t;
        o.alpha = left < C.fadeMs ? left / C.fadeMs : 1;
        o.size = c.size; o.shape = c.shape; o.color = c.color;
        return true;
      },
    };
  },
};
