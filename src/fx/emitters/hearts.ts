/**
 * Heart burst (P21; FRAMEWORK §4.2, v1 #35, v4 C4; owner: fx).
 *
 * 13-15 hearts (budgets.heartsPerBurst: 15 / 10 / 6) spread across the origin element, each popping on
 * `outBack` over 100 ms, floating up ~9-12 vh on `outQuad` and fading over the last 300 ms; 1170 ms in
 * all. `params.count` ("6-10", 12, [6, 10]) and `params.risePctH` (C2.heartsRise) override, clamped to
 * the tier budget. `params.rect` ({ w, h }, set by the bridge / wrapper) sizes the spread.
 * Reduced motion: one static heart fades in and out at the origin (§4.5 "one static heart may fade in").
 */
import type { EmitterDef } from '../types';
import { budgets, primitive, type Tier } from '../../motion/core/tokens';
import { HEART_COLORS } from '../shapes';
import { pick } from '../rng';
import { clamp01, countFrom, ease, inRange, vh, vw, REDUCED_CROSSFADE_MS } from './_kit';
import { profileAlpha } from './_reduced';

const H = primitive.heartBurst;
export interface HeartParams { count?: unknown; risePctH?: number; rect?: { w: number; h: number } }

export const emitter: EmitterDef<HeartParams> = {
  id: 'hearts',
  count: (tier: Tier, p) => countFrom(p?.count, budgets.heartsPerBurst[tier]),
  create({ rng, origin, view, count, durMs, params, tier, reduced }) {
    const W = params.rect?.w ?? vw(view, 30), Hh = params.rect?.h ?? vh(view, 20);
    const base = Math.max(14, Math.min(40, W * 0.12));
    if (reduced) {
      const ms = REDUCED_CROSSFADE_MS * 2;
      return {
        count: 1, durationMs: ms,
        sprite(_i, t, o) {
          o.x = origin.x; o.y = origin.y; o.rot = 0; o.scale = 1; o.size = Math.round(base * 1.4);
          o.shape = 'heart'; o.color = HEART_COLORS[0]; o.alpha = profileAlpha('inout', t, ms);
          return o.alpha > 0;
        },
      };
    }
    const total = durMs ?? H.durMs;
    const n = Math.min(count, budgets.heartsPerBurst[tier]);
    const pop = ease(H.popEase), rise = ease(H.riseEase);
    const riseRange = typeof params.risePctH === 'number' ? [params.risePctH, params.risePctH * 1.3] : H.riseVh;
    const k = Array.from({ length: n }, (_, i) => {
      const lane = n > 1 ? i / (n - 1) : 0.5; // spread evenly, then jitter: no clumps
      return {
        x: origin.x + (inRange(lane, H.spreadPctW) / 100) * W + (rng() - 0.5) * W * 0.08,
        y: origin.y + (rng() - 0.3) * Hh * 0.35,
        rise: vh(view, inRange(rng(), riseRange)), dx: (rng() - 0.5) * W * 0.15,
        delay: rng() * total * 0.15, rot: (rng() - 0.5) * 0.5,
        size: Math.round(base * [0.75, 1, 1.25][Math.floor(rng() * 3)]!), color: pick(rng(), HEART_COLORS),
      };
    });
    return {
      count: n, durationMs: total,
      sprite(i, t, o) {
        const c = k[i]!;
        const life = total - c.delay, lt = t - c.delay;
        if (lt <= 0 || lt >= life) return false;
        const p = lt / life;
        const e = rise(p);
        o.x = c.x + c.dx * e; o.y = c.y - c.rise * e;
        o.rot = c.rot * (1 - e * 0.5);
        o.scale = Math.max(0, pop(clamp01(lt / H.popMs)));
        o.alpha = lt > life - H.fadeMs ? (life - lt) / H.fadeMs : 1;
        o.size = c.size; o.shape = 'heart'; o.color = c.color;
        return true;
      },
    };
  },
};
