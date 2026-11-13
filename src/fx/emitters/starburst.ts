/**
 * Capture-flash starburst + subject glow (P23 layers; FRAMEWORK §4.2, v1 #13-19b; owner: fx).
 * Emit with `fx.emit('starburst', { origin: boothWindowEl })` at the flash, or `fxEmit` with
 * `params.emitter: 'starburst'`. The white full-screen flash layer itself is the DOM CameraFlash (P23).
 *
 *   glow      — soft cream glow on the subject on the flash envelope (rise 33 ms → .95, linear decay 160 ms)
 *   starburst — painted burst ABOVE the flash: .7 → 1 in ≤40 ms, hold 80 ms, +5% growth, +12° spin, fade 80 ms
 *   twinkles  — 2-3 small four-point glints popping around the subject's edge
 * Reduced motion (§4.5): glow only, peak .4 with a 200 ms decay; no starburst, no twinkles.
 */
import type { EmitterDef } from '../types';
import { flash, primitive, type Tier } from '../../motion/core/tokens';
import { clamp01, ease, inRange, lerp, vw, DEG } from './_kit';

const S = primitive.cameraStarburst;
const CAM = flash.camera;
export interface StarburstParams { rect?: { w: number; h: number }; glow?: boolean }

export const emitter: EmitterDef<StarburstParams> = {
  id: 'starburst',
  count: (_tier: Tier) => 2 + S.twinkles[1],
  create({ origin, view, durMs, params, reduced, rng }) {
    const subject = params.rect ? Math.min(params.rect.w, params.rect.h) : vw(view, 60);
    const glowPeak = reduced ? flash.reduced.peak : CAM.glowPeakAtSubject;
    const glowRise = reduced ? 0 : CAM.riseMs, glowDecay = reduced ? flash.reduced.decayMs : CAM.decayMs;
    const total = Math.max(durMs ?? 0, reduced ? glowRise + glowDecay : Math.max(CAM.starburstMs, glowRise + glowDecay));
    const glow = (t: number) => (t < glowRise ? glowPeak * (t / glowRise) : glowPeak * (1 - clamp01((t - glowRise) / glowDecay)));
    const burstSize = Math.round(subject * inRange(rng(), S.sizePctOfSubject) / 100);
    const nTw = reduced ? 0 : Math.round(inRange(rng(), S.twinkles));
    const rise = ease('outQuad');
    const tw = Array.from({ length: nTw }, () => {
      const a = rng() * Math.PI * 2;
      return { x: origin.x + Math.cos(a) * subject * 0.45, y: origin.y + Math.sin(a) * subject * 0.45, at: rng() * S.riseMs * 2, size: Math.round(subject * 0.09) };
    });
    const burstEnd = S.riseMs + S.holdMs + S.fadeMs;
    return {
      count: 2 + nTw, durationMs: total,
      sprite(i, t, o) {
        o.x = origin.x; o.y = origin.y; o.rot = 0;
        if (i === 0) { // glow under the burst
          if (params.glow === false) return false;
          o.size = Math.round(subject * 1.1); o.scale = 1; o.shape = 'glow'; o.color = '--c-cream-50'; o.alpha = glow(t);
          return o.alpha > 0;
        }
        if (reduced) return false;
        if (i === 1) {
          if (t > burstEnd) return false;
          const p = clamp01(t / burstEnd);
          o.size = burstSize; o.shape = 'starburst'; o.color = '--c-accent-twinkle';
          o.scale = lerp(S.scaleFrom, 1, rise(clamp01(t / S.riseMs))) * (1 + (S.growthPct / 100) * p);
          o.rot = S.spinDeg * DEG * p;
          o.alpha = t > S.riseMs + S.holdMs ? 1 - clamp01((t - S.riseMs - S.holdMs) / S.fadeMs) : 1;
          return o.alpha > 0;
        }
        const c = tw[i - 2]!;
        const lt = t - c.at, life = burstEnd - c.at;
        if (lt < 0 || lt > life) return false;
        const p = lt / life;
        o.x = c.x; o.y = c.y; o.size = c.size; o.shape = 'twinkle'; o.color = '--c-cream-50';
        o.scale = Math.sin(p * Math.PI); o.rot = p * 30 * DEG; o.alpha = 1;
        return o.scale > 0;
      },
    };
  },
};
