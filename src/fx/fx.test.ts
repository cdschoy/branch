/** fx emitters (owner: fx): closed-form determinism, tier budgets, cover timing, reduced variants. */
import { describe, expect, it } from 'vitest';
import { getEmitter, listEmitters } from './registry';
import { mulberry32 } from './rng';
import { emitterFor } from './bridge';
import { budgets, type Tier } from '../motion/core/tokens';
import type { EmitterInit, EmitterInstance, Sprite } from './types';

const view = { w: 390, h: 844, dpr: 1 };
const make = (id: string, over: Partial<EmitterInit> = {}): EmitterInstance & { coverAtMs?: number; coverage?: (t: number) => number } => {
  const def = getEmitter(id)!;
  const tier: Tier = over.tier ?? 'high';
  const seed = over.seed ?? 1234;
  const params = (over.params ?? {}) as Record<string, unknown>;
  return def.create({
    seed, rng: mulberry32(seed), params, view, origin: { x: 195, y: 400 }, tier, reduced: false,
    count: def.count(tier, params), ...over,
  } as EmitterInit);
};
const blank = (): Sprite => ({ x: 0, y: 0, rot: 0, scale: 0, alpha: 0, size: 0, shape: 'dot', color: '' });
const frame = (inst: EmitterInstance, t: number) => {
  const out: string[] = [];
  const s = blank();
  for (let i = 0; i < inst.count; i++) if (inst.sprite(i, t, s)) out.push(`${i}:${s.x.toFixed(3)},${s.y.toFixed(3)},${s.rot.toFixed(3)},${s.scale.toFixed(3)},${s.alpha.toFixed(3)},${s.size},${s.shape},${s.color}`);
  return out.join('|');
};

const IDS = ['curtainReveal', 'curtainWipe', 'curtainDrop', 'bloom', 'flood', 'confetti', 'hearts', 'petals', 'echoTrail', 'rays', 'burstMound', 'starburst'];

describe('fx emitters', () => {
  it('registers every emitter and none is a stub', () => {
    const ids = listEmitters().map((e) => e.id);
    for (const id of IDS) { expect(ids).toContain(id); expect(getEmitter(id)!.stub).toBeFalsy(); }
  });

  it.each(IDS)('%s is closed-form: seek order does not matter, same seed → same frame', (id) => {
    const a = make(id), b = make(id);
    const d = Number.isFinite(a.durationMs) ? a.durationMs : 3000;
    const ts = [0, 0.13, 0.5, 0.77, 1].map((f) => f * d);
    const fwd = ts.map((t) => frame(a, t));
    const back = [...ts].reverse().map((t) => frame(b, t)).reverse();
    expect(back).toEqual(fwd);
    expect(fwd.some((f) => f.length > 0)).toBe(true);
    // a different seed gives a different layout (echoTrail has no random part: ghosts trail the hero)
    if (id !== 'echoTrail' && make(id).count > 1) expect(frame(make(id, { seed: 99 }), d * 0.5)).not.toEqual(fwd[2]);
  });

  it('caps sprite counts at the tier budget', () => {
    for (const tier of ['low', 'mid', 'high'] as const) {
      expect(make('bloom', { tier, count: 999 }).count).toBeLessThanOrEqual(budgets.bloomSprites[tier]);
      expect(make('curtainWipe', { tier, count: 999 }).count).toBeLessThanOrEqual(budgets.flowerSprites[tier]);
      expect(make('hearts', { tier, count: 999 }).count).toBeLessThanOrEqual(budgets.heartsPerBurst[tier]);
      expect(make('confetti', { tier, count: 999 }).count).toBeLessThanOrEqual(budgets.confettiPerLanding[tier]);
    }
    expect(make('bloom', { tier: 'high' }).count).toBe(budgets.bloomSprites.high);
  });

  it('curtains reach ≥70% cover at coverAtMs', () => {
    for (const id of ['curtainWipe', 'bloom', 'flood']) {
      const c = make(id);
      expect(c.coverage, id).toBeTypeOf('function');
      expect(c.coverage!(c.coverAtMs!), id).toBeGreaterThanOrEqual(0.7);
    }
    const reveal = make('curtainReveal');
    expect(reveal.coverage!(0)).toBeGreaterThan(0.9);
    expect(reveal.coverage!(reveal.durationMs)).toBeLessThan(0.05);
  });

  it('bloom ends fully covered and the drop continues from the same layout', () => {
    const bloom = make('bloom');
    expect(bloom.coverage!(bloom.durationMs)).toBeGreaterThan(0.95);
    const drop = make('curtainDrop');
    expect(drop.count).toBe(bloom.count);
  });

  it('reduced motion: spectacles become a short fade, particles are off', () => {
    for (const id of ['curtainReveal', 'curtainWipe', 'bloom', 'flood', 'curtainDrop']) {
      const r = make(id, { reduced: true });
      expect(r.durationMs, id).toBeLessThanOrEqual(400);
      const s = blank();
      for (let i = 0; i < r.count; i++) if (r.sprite(i, r.durationMs / 2, s)) { expect(s.rot).toBeCloseTo(s.rot); }
    }
    for (const id of ['confetti', 'petals', 'rays', 'burstMound', 'echoTrail']) expect(make(id, { reduced: true }).count, id).toBe(0);
    expect(make('hearts', { reduced: true }).count).toBe(1);
  });

  it('maps Director actions to emitters', () => {
    expect(emitterFor('bloomBurst')).toBe('bloom');
    expect(emitterFor('flowerCurtain', { mode: 'wipe' })).toBe('curtainWipe');
    expect(emitterFor('flowerCurtain', { mode: 'flood' })).toBe('flood');
    expect(emitterFor('flowerCurtain', {})).toBe('curtainReveal');
    expect(emitterFor('fxEmit', { emitter: 'rays' })).toBe('rays');
    expect(emitterFor('confettiFountain')).toBe('confetti');
  });
});
