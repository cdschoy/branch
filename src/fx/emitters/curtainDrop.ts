/**
 * Curtain drop (P12) on the canvas (FRAMEWORK §4.2, v5 A-e12-14; owner: fx). The hand-over after a
 * bloom: the cover layer falls to 105 vh over 1400 ms on `curtainFall`, flattens toward the wall-mean
 * colour from +33 ms over 700 ms, fades from +900 ms over 630 ms `inQuad`, and is masked top → bottom
 * from +1100 ms over 430 ms `inQuad`; gone at 1530 ms.
 *
 * It starts from the bloom's END state (same seed → same layout), so bloom → drop has no pop. The
 * origin of the last bloom with this seed is reused, since the drop's own target is usually the wall.
 * Step params (C1.curtainDrop: washFromMs, fadeFromMs, maskFromMs, …) override the tokens.
 */
import type { EmitterDef } from '../types';
import { budgets, duration, primitive, type Tier } from '../../motion/core/tokens';
import { cssColor, ease, fillBand, vh, clamp01, WALL_MEAN, capCount } from './_kit';
import { reducedCurtain, firstCover, type CoverInstance } from './_reduced';
import { bloomHead, bloomLayout, lastBloomFor } from './bloom';

const D = primitive.curtainDrop;
type Num = number | undefined;
export interface DropParams { washFromMs?: Num; washMs?: Num; fadeFromMs?: Num; fadeMs?: Num; maskFromMs?: Num; maskMs?: Num; yVh?: readonly number[]; ease?: string }

export const emitter: EmitterDef<DropParams> = {
  id: 'curtainDrop',
  count: (tier: Tier) => budgets.flowerSprites[tier],
  create(init): CoverInstance {
    if (init.reduced) return reducedCurtain(init, 'out');
    const { view, params: p } = init;
    const total = init.durMs ?? duration.curtainDrop;
    const k = total / D.unmountMs;
    const prev = lastBloomFor(init.seed);
    const origin = prev?.origin ?? init.origin;
    const L = bloomLayout({ seed: init.seed, view, origin, count: prev?.count ?? capCount(init.count, budgets.bloomSprites[init.tier]) });
    const yTo = vh(view, (p.yVh?.[1] ?? D.yVh[1]) - (p.yVh?.[0] ?? D.yVh[0]));
    const yMs = D.yMs * k;
    const fall = ease(p.ease ?? D.yEase);
    const fadeE = ease(D.fadeEase);
    const maskE = ease(D.maskEase);
    const washFrom = (p.washFromMs ?? D.washFromMs) * k, washMs = (p.washMs ?? D.washMs) * k;
    const fadeFrom = (p.fadeFromMs ?? D.fadeFromMs) * k, fadeMs = (p.fadeMs ?? D.fadeMs) * k;
    const maskFrom = (p.maskFromMs ?? D.maskFromMs) * k, maskMs = (p.maskMs ?? D.maskMs) * k;
    const wash = cssColor(WALL_MEAN);
    const dy = (t: number) => yTo * fall(clamp01(t / yMs));
    const alpha = (t: number) => 1 - fadeE(clamp01((t - fadeFrom) / fadeMs));
    const washA = (t: number) => D.washPeak * clamp01((t - washFrom) / washMs);
    const maskTop = (t: number) => view.h * maskE(clamp01((t - maskFrom) / maskMs));
    const pad = L.pitch;
    const coverage = (t: number) => clamp01(alpha(t) * (1 - Math.max(maskTop(t), dy(t)) / view.h));
    return {
      count: L.heads.length,
      durationMs: total,
      coverAtMs: firstCover((t) => 1 - coverage(t), total, 0.3), // when the scene underneath is 30% open
      coverage,
      before(g, t, v) {
        g.beginPath(); g.rect(0, maskTop(t), v.w, v.h); g.clip();
        fillBand(g, v, dy(t) - pad, v.h + dy(t) + pad, wash, 0.96 * alpha(t));
      },
      after(g, t, v) {
        // flatten the heads toward the wall's mean colour (the clip from before() still applies)
        fillBand(g, v, dy(t) - pad * 2, v.h + dy(t) + pad * 2, wash, washA(t) * alpha(t));
      },
      sprite(i, t, out) {
        if (!bloomHead(L, i, L.end, origin.x, origin.y, out)) return false;
        out.y += dy(t);
        out.alpha = alpha(t);
        return out.alpha > 0 && out.y - out.size < view.h;
      },
    };
  },
};
