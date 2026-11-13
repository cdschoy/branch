/** Primitive parameters vs FRAMEWORK §4.2 (owner: primitives). Node environment: pure values and math only. */
import { describe, expect, it } from 'vitest';
import { typewriterPlan, duration, spring, stagger } from '../../core/tokens';
import { P } from '../../core/actions/params';
import { springAt, tossPoint, wobbleSegments, keyframeAt } from '../../core/actions/math';

describe('P42 typewriter plan', () => {
  it('ms = clamp(3220/n, 25, 127), grapheme mode up to 130', () => {
    expect(typewriterPlan(10).msPer).toBe(127);
    expect(typewriterPlan(50).msPer).toBeCloseTo(64.4, 1);
    expect(typewriterPlan(130).unit).toBe('grapheme');
    expect(typewriterPlan(100).msPer).toBeCloseTo(32.2, 3);
    expect(typewriterPlan(130).msPer).toBe(25); // 3220/130 = 24.8 → floor 25
  });
  it('word mode above 130 graphemes (≈5·ms, ≥120 ms); floor 25 ms', () => {
    const p = typewriterPlan(300);
    expect(p.unit).toBe('word');
    expect(p.msPer).toBe(125);
  });
  it('start delay clamp(1.6·ms, 60, 200)', () => {
    expect(typewriterPlan(10).startDelayMs).toBe(200);
    expect(typewriterPlan(300).startDelayMs).toBe(60);
  });
});

describe('§4.2 rows', () => {
  it('P01 stamp mounts at 1.12, exits in ≤70 ms', () => {
    expect(P.stampPop.fromScale).toBe(1.12);
    expect(P.stampPop.exitMs).toBeLessThanOrEqual(70);
  });
  it('P04 polaroid stagger 150 ms, tilt −5°, stack 8 px for > 3 photos', () => {
    expect(P.polaroidDeal.staggerMs).toBe(stagger.polaroidDeal);
    expect(stagger.polaroidDeal).toBe(150);
    expect(P.polaroidDeal.tiltFromDeg).toBe(-5);
    expect(P.polaroidDeal.stackPx).toBe(8);
    expect(P.polaroidDeal.scaleMs).toBeGreaterThanOrEqual(120);
    expect(P.polaroidDeal.scaleMs).toBeLessThanOrEqual(160);
  });
  it('P05 drawer 560 ms, close 240 ms (≤60 %), zero overshoot', () => {
    expect(duration.drawer).toBe(560);
    expect(P.drawerSlide.closeMs).toBeLessThanOrEqual(duration.drawer * 0.6);
    expect(spring.drawer.overshootAllowed).toBe(false);
  });
  it('P32 page crossfade 240 ms outCubic; new layer +20 ms', () => {
    expect(P.pageCrossfade.outStep.dur).toBe(240);
    expect(P.pageCrossfade.inStep.at).toBe(20);
  });
  it('P02 sticker after page change at +140 ms, stagger within 80-120 ms', () => {
    expect(P.stickerPop.afterPageMs).toBe(140);
    expect(P.stickerPop.staggerMs).toBeGreaterThanOrEqual(80);
    expect(P.stickerPop.staggerMs).toBeLessThanOrEqual(120);
  });
  it('P28 hint ring 1 → 1.8 over 800 ms, repeat within 1.2-1.6 s', () => {
    expect(P.hintRing.scale).toEqual([1, 1.8]);
    expect(P.hintRing.periodMs).toBe(800);
    expect(P.hintRing.repeatEveryMs).toBeGreaterThanOrEqual(1200);
    expect(P.hintRing.repeatEveryMs).toBeLessThanOrEqual(1600);
  });
  it('P29 reels 1.1 s / rev', () => expect(P.reelSpin.periodMs).toBe(1100));
  it('P15 tap wobble keeps −1° and lasts ~233 ms', () => {
    expect(P.tapWobble.rotate.at(-1)).toBe(-1);
    expect(P.tapWobble.ms).toBe(233);
  });
});

describe('math', () => {
  it('stamp spring starts at 0 progress and settles at 1', () => {
    expect(springAt('stamp', 0)).toBeCloseTo(0, 5);
    expect(springAt('stamp', spring.stamp.settleMs)).toBeCloseTo(1, 2);
  });
  it('toss starts at the slot and lands exactly on the target', () => {
    expect(tossPoint(-100, 200, 40, 0)).toEqual({ x: -100, y: 200 });
    const end = tossPoint(-100, 200, 40, 1);
    expect(end.x).toBeCloseTo(0, 6);
    expect(end.y).toBeCloseTo(0, 6);
  });
  it('idle wobble stays inside the token ranges and is small for the first 1.5 s', () => {
    const segs = wobbleSegments(7, 16, P.idleWobble);
    for (const s of segs) {
      expect(s.ms).toBeGreaterThanOrEqual(400);
      expect(s.ms).toBeLessThanOrEqual(633);
      expect(Math.abs(s.x)).toBeLessThanOrEqual(4);
      expect(s.r).toBeLessThanOrEqual(10);
      expect(s.r).toBeGreaterThanOrEqual(-1.5);
      if (s.t0 + s.ms <= 1500) expect(Math.abs(s.r)).toBeLessThanOrEqual(3);
    }
  });
  it('keyframeAt interpolates segments', () => {
    expect(keyframeAt([0, 10, 0], [0, 0.5, 1], 0.25)).toBeCloseTo(5);
  });
});
