/**
 * C7 finale stingers for `fxEmit` (FRAMEWORK §4.3 C7, v4 D14-D19; owner: fx):
 *   echoTrail  — 2-3 ghost copies trailing the thrown hero flower (130 ms; the Director skips it below mid)
 *   rays       — 10-14 rays + a shockwave ring, a 1-2 frame pop (33-66 ms)
 *   burstMound — a heap of heads popping on `outBack` over 2-3 frames each, staggered over 450 ms; it
 *                stays drawn (held) under the flood wall until the wall's clear phase stops it
 * Reduced motion: all off (the Director drops canvas steps anyway).
 */
import type { EmitterDef } from '../types';
import { budgets, choreography, primitive, type Tier } from '../../motion/core/tokens';
import { GLINT_COLORS } from '../shapes';
import { pick } from '../rng';
import { clamp01, countFrom, ease, inRange, lerp, pickFlower, vw, DEG } from './_kit';
import { offInstance } from './_reduced';

const F = primitive.finaleFx;
const c7 = (name: string, fallback: number) => choreography.C7.steps.find((s) => s.name === name)?.dur ?? fallback;
const ECHO_MS = c7('C7.echoTrail', F.raysMs[1] * 2);
const BURST_MS = c7('C7.burst', F.burstPopMs[1] * 4);

export interface EchoParams { copies?: unknown; from?: { x: number; y: number }; rect?: { w: number; h: number } }
const echoTrail: EmitterDef<EchoParams> = {
  id: 'echoTrail',
  count: (_tier: Tier, p) => countFrom(p?.copies, F.echoCopies[1]),
  create({ origin, view, count, durMs, params, reduced }) {
    if (reduced) return offInstance();
    const total = durMs ?? ECHO_MS;
    const size = Math.round(params.rect ? Math.max(params.rect.w, params.rect.h) : vw(view, 20));
    // trail back toward where the throw came from (the CTA sits bottom-right on mobile)
    const from = params.from ?? { x: view.w * 0.85, y: view.h * 0.85 };
    const d = Math.hypot(from.x - origin.x, from.y - origin.y) || 1;
    const ux = (from.x - origin.x) / d, uy = (from.y - origin.y) / d;
    const gap = (size * F.echoSpacingPctOfFlower) / 100;
    return {
      count, durationMs: total,
      sprite(i, t, o) {
        const p = clamp01(t / total);
        const k = i + 1;
        o.x = origin.x + ux * gap * k * (1 - p * 0.5); o.y = origin.y + uy * gap * k * (1 - p * 0.5);
        o.rot = -k * 25 * DEG; o.scale = 1 - k * 0.08; o.size = size; o.shape = 'rose'; o.color = '--c-flower-rose-red';
        o.alpha = (0.45 / k) * (1 - p);
        return o.alpha > 0;
      },
    };
  },
};

export interface RaysParams { count?: unknown; rect?: { w: number; h: number } }
const rays: EmitterDef<RaysParams> = {
  id: 'rays',
  count: (_tier: Tier, p) => countFrom(p?.count, F.raysCount[1]),
  create({ origin, view, count, durMs, params, reduced, rng }) {
    if (reduced) return offInstance();
    const total = durMs ?? F.raysMs[1];
    const n = count + 1; // + the ring
    const r0 = (params.rect ? Math.max(params.rect.w, params.rect.h) : vw(view, 20)) * 0.6;
    const len = r0 * 0.9;
    const k = Array.from({ length: count }, (_, i) => ({ a: (i / count) * Math.PI * 2 + (rng() - 0.5) * 0.25, l: len * (0.75 + rng() * 0.5), c: pick(rng(), GLINT_COLORS) }));
    return {
      count: n, durationMs: total,
      sprite(i, t, o) {
        const p = clamp01(t / total);
        if (i === count) { // shockwave ring
          o.x = origin.x; o.y = origin.y; o.rot = 0; o.size = Math.round(r0 * 2.2);
          o.scale = lerp(F.ringScale[0], F.ringScale[1], p); o.alpha = 1 - p * p; o.shape = 'ring'; o.color = '--c-cream-50';
          return true;
        }
        const c = k[i]!;
        const r = r0 + c.l * 0.5 + p * c.l * 0.4;
        o.x = origin.x + Math.cos(c.a) * r; o.y = origin.y + Math.sin(c.a) * r;
        o.rot = c.a; o.size = Math.round(c.l); o.scale = p < 0.5 ? 0.6 + p * 0.8 : 1; o.alpha = 1 - clamp01((p - 0.5) * 2);
        o.shape = 'ray'; o.color = c.c;
        return o.alpha > 0;
      },
    };
  },
};

export interface BurstParams { count?: unknown; hold?: boolean }
const burstMound: EmitterDef<BurstParams> = {
  id: 'burstMound',
  count: (tier: Tier, p) => countFrom(p?.count, Math.round((budgets.finaleSprites[tier] * F.burstSpritesPctOfFinale) / 100)),
  create({ origin, view, count, durMs, reduced, rng }) {
    if (reduced) return offInstance();
    const total = durMs ?? BURST_MS;
    const pop = ease('outBack');
    const R = vw(view, 34);
    const k = Array.from({ length: count }, (_, i) => {
      // a mound: heads fill a half-disc below/around the impact point, heavier at the bottom
      const a = Math.PI * (0.05 + rng() * 0.9) + (rng() < 0.35 ? Math.PI : 0);
      const r = R * Math.sqrt((i + 0.5) / count) * (0.85 + rng() * 0.3);
      const f = pickFlower(rng(), rng(), 0.15);
      return {
        x: origin.x + Math.cos(a) * r, y: origin.y + Math.abs(Math.sin(a)) * r * (a > Math.PI ? -0.45 : 0.75),
        at: (r / R) * (total - F.burstPopMs[1]), dur: inRange(rng(), F.burstPopMs),
        rot: (rng() - 0.5) * 1.4, size: Math.round(vw(view, [13, 16, 20][Math.floor(rng() * 3)]!)), shape: f.shape, color: f.color,
      };
    });
    return {
      count, durationMs: total,
      sprite(i, t, o) {
        const c = k[i]!;
        if (t < c.at) return false;
        o.x = c.x; o.y = c.y; o.rot = c.rot; o.scale = Math.max(0, pop(clamp01((t - c.at) / c.dur)));
        o.alpha = 1; o.size = c.size; o.shape = c.shape; o.color = c.color;
        return true;
      },
    };
  },
};

export const emitters = [echoTrail, rays, burstMound] as const;
