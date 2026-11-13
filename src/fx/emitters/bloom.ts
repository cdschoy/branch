/**
 * Bloom burst (P39; FRAMEWORK §4.2, v5 A-e08; owner: fx). Also FlowerCurtain mode "bloom".
 *
 * A radial emitter at the hero centre. Heads are assigned to a cover layout sorted by distance from
 * the origin; head i ARRIVES when the coverage curve (`bloomCoverage` over the 2500 ms bloom window)
 * reaches its rank, after a 0.9-1.4 s radial push on `bloomSprite` (fade-in 150 ms, scale .35 → 1). Once
 * home it keeps a 12.5 vh/s outward hold drift; in the edge-settle window (760 ms) the drift decays to
 * rest edge by edge: top, then right, then left (bottom with top).
 *
 * Phases (Director C1): `C1.bloom` (dur 2500, no phase) draws the window; `C1.edgeSettle`
 * (params.phase "edgeSettle", dur 760) continues from the same layout (same seed). Standalone (no
 * durMs) plays both: duration.bloomBurst (3270). Hand over to curtainDrop, which starts from bloomEnd().
 */
import type { EmitterDef, EmitterInit, Sprite } from '../types';
import { budgets, duration, flowerCurtain, type Tier } from '../../motion/core/tokens';
import { coverGrid, cssColor, ease, inRange, invEase, pickFlower, sizeClass, vh, clamp01, lerp, WALL_MEAN, capCount } from './_kit';
import { reducedCurtain, firstCover, type CoverInstance } from './_reduced';
import { mulberry32 } from '../rng';

const B = flowerCurtain.bloom;
/** The bloom window: coverage reaches 100% at its end ("over 2500 ms", 870 → 3370 ms from tap 1). */
export const BLOOM_WINDOW_MS = B.edgeSettleWindowMs[0] - 870;
const SETTLE_MS = B.edgeSettleMs;

export interface BloomParams { phase?: 'edgeSettle'; coverageEase?: string; ease?: string }

interface Head {
  tx: number; ty: number; dx: number; dy: number; arrive: number; start: number; push: number;
  settleAt: number; rot0: number; rot1: number; size: number; scale: number; shape: string; color: string;
}

/** Build the shared layout (pure in seed/view/origin/count): used by bloom and by curtainDrop's hand-over. */
export function bloomLayout(init: Pick<EmitterInit, 'seed' | 'view' | 'origin' | 'count'>, coverageEase = 'bloomCoverage') {
  const rng = mulberry32(init.seed ^ 0xb100);
  const { view, origin } = init;
  const n = Math.max(0, Math.round(init.count));
  const m = vh(view, 6);
  const { cells, pitch } = coverGrid(n, -m, -m, view.w + 2 * m, view.h + 2 * m, rng);
  const dist = (c: { x: number; y: number }) => Math.hypot(c.x - origin.x, c.y - origin.y);
  const order = cells.map((c, i) => ({ c, i, d: dist(c) })).sort((a, b) => a.d - b.d);
  const cov = ease(coverageEase);
  const drift = vh(view, B.holdDriftVhPerS) / 1000; // px/ms
  const W = BLOOM_WINDOW_MS;
  const heads: Head[] = order.map(({ c, d }, rank) => {
    const f = pickFlower(rng(), rng(), 0.1);
    const s = sizeClass(pitch, rng());
    const r = (rank + 1) / order.length;
    const arrive = W * invEase(cov, r);
    const start = Math.max(0, arrive - inRange(rng(), B.spritePushMs));
    const push = Math.max(B.spriteFadeInMs * 2, arrive - start);
    const ux = d > 0 ? (c.x - origin.x) / d : 0, uy = d > 0 ? (c.y - origin.y) / d : -1;
    // edge group: top (and bottom) settle first, then right, then left
    const edge = Math.abs(uy) >= Math.abs(ux) ? 0 : ux > 0 ? 1 : 2;
    return {
      tx: c.x, ty: c.y, dx: ux * drift, dy: uy * drift, arrive: start + push, start, push,
      settleAt: W + (edge * SETTLE_MS) / 3, rot0: (rng() - 0.5) * 1.2, rot1: (rng() - 0.5) * 0.35,
      size: s.size, scale: s.scale, shape: f.shape, color: f.color,
    };
  });
  return { heads, pitch, end: W + SETTLE_MS };
}

const spriteEase = ease('bloomSprite');

/** The last bloom per seed (origin + count), so curtainDrop can continue from its exact end layout. */
const lastBlooms = new Map<number, { origin: { x: number; y: number }; count: number }>();
export const lastBloomFor = (seed: number) => lastBlooms.get(seed);

/** Head i of a layout at absolute bloom time T (0 = start of the bloom window). */
export function bloomHead(L: ReturnType<typeof bloomLayout>, i: number, T: number, ox: number, oy: number, out: Sprite, push = spriteEase): boolean {
  const h = L.heads[i]!;
  if (T < h.start) return false;
  const p = clamp01((T - h.start) / h.push);
  const e = push(p);
  // hold drift after arrival; in the edge window the speed decays linearly to 0 (outQuad position)
  const held = Math.max(0, Math.min(T, h.settleAt) - h.arrive);
  const w = SETTLE_MS / 3;
  const tau = Math.max(0, Math.min(T - h.settleAt, w));
  const travel = held + tau - (tau * tau) / (2 * w);
  out.x = lerp(ox, h.tx, e) + h.dx * travel;
  out.y = lerp(oy, h.ty, e) + h.dy * travel;
  out.rot = lerp(h.rot0, h.rot1, e);
  out.scale = h.scale * lerp(B.spriteScale[0], B.spriteScale[1], e);
  out.alpha = clamp01((T - h.start) / B.spriteFadeInMs);
  out.size = h.size; out.shape = h.shape; out.color = h.color;
  return true;
}

export const emitter: EmitterDef<BloomParams> = {
  id: 'bloom',
  count: (tier: Tier) => budgets.bloomSprites[tier],
  create(init): CoverInstance {
    if (init.reduced) return reducedCurtain(init, 'in');
    const { view, origin, params } = init;
    const settleOnly = params.phase === 'edgeSettle';
    const offset = settleOnly ? BLOOM_WINDOW_MS : 0;
    const total = init.durMs ?? (settleOnly ? SETTLE_MS : duration.bloomBurst);
    const count = capCount(init.count, budgets.bloomSprites[init.tier]);
    const L = bloomLayout({ ...init, count }, params.coverageEase ?? 'bloomCoverage');
    lastBlooms.set(init.seed, { origin: { x: origin.x, y: origin.y }, count });
    if (lastBlooms.size > 8) lastBlooms.delete(lastBlooms.keys().next().value!);
    const push = ease(params.ease ?? 'bloomSprite');
    const cov = ease(params.coverageEase ?? 'bloomCoverage');
    const wash = cssColor(WALL_MEAN);
    const far = Math.max(
      Math.hypot(origin.x, origin.y), Math.hypot(view.w - origin.x, origin.y),
      Math.hypot(origin.x, view.h - origin.y), Math.hypot(view.w - origin.x, view.h - origin.y),
    );
    // fraction of heads home ≈ covered area, so the wash radius follows √coverage
    const radius = (T: number) => far * Math.sqrt(cov(clamp01(T / BLOOM_WINDOW_MS))) * 1.02;
    const coverage = (t: number) => {
      const r = radius(t + offset);
      // disc ∩ viewport, cheap: a 9×9 sample grid
      let hit = 0;
      for (let a = 0; a < 9; a++) for (let b = 0; b < 9; b++) {
        const x = ((a + 0.5) / 9) * view.w, y = ((b + 0.5) / 9) * view.h;
        if (Math.hypot(x - origin.x, y - origin.y) <= r) hit++;
      }
      return hit / 81;
    };
    return {
      count: L.heads.length,
      durationMs: total,
      coverAtMs: firstCover(coverage, total),
      coverage,
      before(g, t) {
        const r = radius(t + offset) - L.pitch * 0.5;
        if (r <= 0) return;
        g.globalAlpha = 0.96; g.fillStyle = wash; g.beginPath(); g.arc(origin.x, origin.y, r, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1;
      },
      sprite: (i, t, out) => bloomHead(L, i, t + offset, origin.x, origin.y, out, push),
    };
  },
};
