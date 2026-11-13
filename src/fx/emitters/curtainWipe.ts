/**
 * FlowerCurtain mode "wipe" (P38 wipe; FRAMEWORK §4.2, v1 #49-52; owner: fx).
 *
 * A band of flowers falls LINEARLY from the top: spawns spread over `spawnSpreadMs` (630), the first
 * spawn leads at `leadVhPerS` (200 vh/s) and the last trails at `trailVhPerS` (153 vh/s), so the band
 * stretches as it falls and uncovers the new scene from the top. Each head sways on a sine (3.4-4.9 vw,
 * 280-400 ms) and spins at a constant 150-300 °/s. An opaque wall-mean band sits under the heads so the
 * cover is real on every tier. Swap under the cover at C13.replaySwap (530 ms, coverage ≈100% ≥ 70%).
 */
import type { EmitterDef } from '../types';
import { budgets, flowerCurtain, choreography, type Tier } from '../../motion/core/tokens';
import { coverGrid, cssColor, fillBand, inRange, pickFlower, sizeClass, sign, vh, vw, DEG, WALL_MEAN, bandCoverage, capCount } from './_kit';
import { reducedCurtain, type CoverInstance } from './_reduced';

const W = flowerCurtain.wipe;
const SWAP_MS = choreography.C13.steps.find((s) => s.name === 'C13.replaySwap')?.at ?? W.durationMs * 0.39;

export const emitter: EmitterDef = {
  id: 'curtainWipe',
  count: (tier: Tier) => budgets.flowerSprites[tier],
  create(init): CoverInstance {
    if (init.reduced) return reducedCurtain(init, 'inout');
    const { rng, view } = init;
    const total = init.durMs ?? W.durationMs;
    const k = total / W.durationMs; // a step may stretch / squeeze the wipe; speeds scale with it
    const spread = W.spawnSpreadMs * k;
    const n = capCount(init.count, budgets.flowerSprites[init.tier]);
    // band layout: u ∈ [0,1] is "how late in the spawn spread"; columns cover the width
    const band = vh(view, 130);
    const { cells, pitch } = coverGrid(n, 0, 0, view.w, band, rng, 0.3);
    const vLead = vh(view, W.leadVhPerS) / 1000 / k, vTrail = vh(view, W.trailVhPerS) / 1000 / k; // px/ms
    const sprites = cells.map((c) => {
      const u = Math.min(1, Math.max(0, 1 - c.y / band));                 // lower cells spawn first (they lead)
      const f = pickFlower(rng(), rng());
      const s = sizeClass(pitch, rng());
      return {
        x: c.x, ts: u * spread, v: vTrail + (vLead - vTrail) * (1 - u) * (0.94 + rng() * 0.06),
        amp: vw(view, inRange(rng(), W.swayPctVw)), period: inRange(rng(), W.swayPeriodMs) * k, phase: rng() * Math.PI * 2,
        spin: sign(rng()) * inRange(rng(), W.spinDegPerS) * DEG / 1000 / k, rot0: rng() * Math.PI * 2,
        size: s.size, scale: s.scale, shape: f.shape, color: f.color,
      };
    });
    const half = pitch * 0.75;
    const y0 = -half;
    // band edges (closed form): lead = first spawn's head, trail = last spawn's head
    const lead = (t: number) => y0 + vLead * t;
    const trail = (t: number) => (t < spread ? y0 : y0 + vTrail * (t - spread));
    const wash = cssColor(WALL_MEAN);
    const inset = pitch * 0.35;
    return {
      count: sprites.length,
      durationMs: total,
      coverAtMs: SWAP_MS * k,
      coverage: (t) => bandCoverage(view, trail(t) + inset, lead(t) - inset),
      before(g, t, v) { fillBand(g, v, trail(t) + inset, lead(t) - inset, wash, 0.96); },
      sprite(i, t, out) {
        const c = sprites[i]!;
        const dt = t - c.ts;
        if (dt < 0) return false;
        out.y = y0 + c.v * dt;
        if (out.y - c.size > view.h) return false;
        out.x = c.x + c.amp * Math.sin((dt / c.period) * Math.PI * 2 + c.phase);
        out.rot = c.rot0 + c.spin * dt;
        out.scale = c.scale; out.alpha = 1; out.size = c.size; out.shape = c.shape; out.color = c.color;
        return true;
      },
    };
  },
};
