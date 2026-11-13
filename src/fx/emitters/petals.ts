/**
 * Petal field (P31; FRAMEWORK §4.2, v2a A-E04; owner: fx). Ambient, lyric chapters only.
 *
 * 1-3 petals on screen (budgets.petalsOnScreen: 3 / 3 / 2) in 3 depth tiers, carried by the wind
 * (−0.8, +0.4) vw/frame = (−24, +12) vw/s scaled by depth, tumbling 135-270 °/s and swaying 2-4.6 vw.
 * Each petal crosses the screen right → left in passes; pass p of petal i is re-seeded with
 * rand01(seed, i, p), so the field is a pure function of t and loops forever without state.
 * Duration: the step's dur, or `params.loop: true` for an endless field (stop the handle). Reduced: off.
 */
import type { EmitterDef } from '../types';
import { budgets, primitive, type Tier } from '../../motion/core/tokens';
import { FLOWER_COLORS } from '../shapes';
import { pick, rand01 } from '../rng';
import { clamp01, inRange, vh, vw, DEG } from './_kit';
import { offInstance } from './_reduced';

const P = primitive.petalField;
const COLORS = FLOWER_COLORS.filter((c) => !c.includes('hydrangea') && !c.includes('sunflower'));
export interface PetalParams { loop?: boolean }

export const emitter: EmitterDef<PetalParams> = {
  id: 'petals',
  count: (tier: Tier) => budgets.petalsOnScreen[tier],
  create({ seed, origin: _o, view, count, durMs, params, tier, reduced }) {
    if (reduced) return offInstance();
    const n = Math.min(count, budgets.petalsOnScreen[tier]);
    const total = durMs ?? (params.loop ? Number.POSITIVE_INFINITY : 4800);
    const k = Array.from({ length: n }, (_, i) => {
      const depth = P.depthScale[i % P.depthScale.length]!;
      const wx = (vw(view, P.windVwPerS[0]) / 1000) * depth, wy = (vw(view, P.windVwPerS[1]) / 1000) * depth;
      const size = Math.round(vw(view, inRange(rand01(seed, i, 1), P.sizeVw)) * depth);
      const span = view.w + size * 4;
      const period = span / Math.abs(wx);
      return { depth, wx, wy, size, period, phase: (i / n) * period + rand01(seed, i, 2) * period * 0.3 };
    });
    return {
      count: n, durationMs: total,
      sprite(i, t, o) {
        const c = k[i]!;
        const T = t + c.phase;
        const pass = Math.floor(T / c.period);
        const tau = T - pass * c.period;
        const r = (salt: number) => rand01(seed, i * 977 + pass, salt);
        const y0 = vh(view, 5 + r(3) * 60);
        const amp = vw(view, inRange(r(4), P.swayVw));
        const sp = inRange(r(5), P.swayPeriodMs);
        const spin = (r(6) < 0.5 ? -1 : 1) * inRange(r(7), P.tumbleDegPerS) * DEG / 1000;
        o.x = view.w + c.size * 2 + c.wx * tau;
        o.y = y0 + c.wy * tau + amp * Math.sin((tau / sp) * Math.PI * 2 + r(8) * 6);
        o.rot = r(9) * Math.PI * 2 + spin * tau;
        // tumbling petals foreshorten: the scale breathes with the spin
        o.scale = 0.7 + 0.3 * Math.abs(Math.cos(spin * tau * 0.8));
        o.alpha = clamp01(tau / P.fadeInMs) * (0.65 + 0.35 * c.depth);
        o.size = c.size; o.shape = 'petal'; o.color = pick(r(10), COLORS);
        return o.y - c.size < view.h;
      },
    };
  },
};
