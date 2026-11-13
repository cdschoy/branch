/**
 * Director DOM actions for the primitive catalog (FRAMEWORK §4.2; owner: primitives). React-free.
 * Collected by actions/index.ts, so `director.play(choreography.Cx, refs)` drives these on DOM
 * targets. Each one honours ctx.reduced with the §4.5 variant and reads its numbers from tokens /
 * params.ts. Ticker-driven ones (toss, ambient loops) return a StepControl whose seek() is a pure
 * function of step-local time, so scrubbing and ×3 preview are exact.
 */
import { animate, type AnimationPlaybackControls, type DOMKeyframesDefinition } from 'motion';
import type { ActionImplMap, DomAnimationPlan, StepContext, StepControl } from '../types';
import { bez, sec, springT, spring, duration, type EasingName } from '../tokens';
import { CUT_EVENT, type CutEventDetail } from './base';
import { P } from './params';
import { ease, keyframeAt, springAt, springValue, tossPoint, wobbleSegments, noise } from './math';

type El = HTMLElement | SVGElement;
type Params = Readonly<Record<string, unknown>>;
const params = (ctx: StepContext): Params => (ctx.step.params ?? {}) as Params;
const num = (v: unknown, d: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const tw = (ms: number, e: EasingName, delayMs = 0) => ({ duration: sec(ms), ease: bez(e), delay: sec(delayMs) });
const plan = (el: El, keyframes: DOMKeyframesDefinition, transition: DomAnimationPlan['transition']): DomAnimationPlan => ({ el, keyframes, transition });
const style = (el: El) => (el as HTMLElement).style;

/** §4.5 "pops and springs": opacity 200 ms outQuad in place. */
const reducedIn = (el: El, to = 1): DomAnimationPlan => plan(el, { opacity: [0, to] }, tw(P.reducedMs, 'outQuad'));
const reducedOut = (el: El): DomAnimationPlan => plan(el, { opacity: 0 }, tw(P.reducedMs, 'outQuad'));

const cut = (el: El, ctx: StepContext) =>
  el.dispatchEvent(new CustomEvent<CutEventDetail>(CUT_EVENT, { detail: { name: ctx.step.name, action: ctx.step.action, params: params(ctx) } }));

/** A persistent loop (ambient): keeps running after the run ends; cancel/revert stop it. */
function loop(el: El, kf: DOMKeyframesDefinition, opts: Parameters<typeof animate>[2]): StepControl {
  const a = animate(el, kf, { repeat: Infinity, ...opts } as never) as unknown as AnimationPlaybackControls;
  return {
    persistent: true,
    pause: () => a.pause(), resume: () => a.play(), setSpeed: (x) => { a.speed = x; },
    cancel: () => a.stop(), revert: () => { a.cancel(); },
  };
}

/** A seekable control from a pure frame function f(localMs). */
function seekable(apply: (ms: number) => void, endMs: number, reset: () => void): StepControl {
  apply(0);
  return { seek: (ms) => apply(Math.min(ms, endMs)), finish: () => apply(endMs), revert: reset, cancel: () => {} };
}

// ------------------------------------------------------------------ FLIP snapshots (P35 / P36)
const snapshots = new WeakMap<Element, DOMRect>();
/** Record an element's rect before a DOM change; the next layoutMove / sharedLightbox step FLIPs from it. */
export function snapshotLayout(el: Element | null | undefined, rect?: DOMRect): void { if (el) snapshots.set(el, rect ?? el.getBoundingClientRect()); }
function flipFrom(el: El): { x: number; y: number; sx: number; sy: number } | null {
  const from = snapshots.get(el);
  if (!from) return null;
  snapshots.delete(el);
  const to = el.getBoundingClientRect();
  if (!to.width || !to.height) return null;
  return {
    x: from.left + from.width / 2 - (to.left + to.width / 2),
    y: from.top + from.height / 2 - (to.top + to.height / 2),
    sx: from.width / to.width, sy: from.height / to.height,
  };
}

const isSheet = () => typeof matchMedia === 'function' && matchMedia(`(max-width: ${P.drawerSlide.sheetMaxWidthPx}px)`).matches;

export const actions: ActionImplMap = {
  // ------------------------------------------------------------ pops
  /** P01: opacity 1, scale 1.12 → 1 on spring.stamp. Reduced: opacity only, 100 ms. */
  stampPop: (el, ctx) => {
    if (ctx.reduced) return plan(el, { opacity: [0, 1] }, tw(P.stampPop.reducedMs, 'outQuad'));
    style(el).opacity = '1';
    return plan(el, { scale: [P.stampPop.fromScale, 1] }, springT('stamp'));
  },
  /** P02: scale 0 → 1 on spring.sticker; opacity over the first 67 ms. */
  stickerPop: (el, ctx) => {
    if (ctx.reduced) return reducedIn(el);
    return [plan(el, { scale: [0, 1] }, springT('sticker')), plan(el, { opacity: [0, 1] }, tw(P.stickerPop.opacityMs, 'linear'))];
  },
  /** P03: opacity .18 → 1 in 67 ms; scale .93 → 1 on spring.letterPop (peaks ~1.008, tier 1). */
  letterPop: (el, ctx) => {
    if (ctx.reduced) return reducedIn(el);
    return [plan(el, { scale: [P.letterPop.fromScale, 1] }, springT('letterPop')), plan(el, { opacity: [P.letterPop.fromOpacity, 1] }, tw(P.letterPop.opacityMs, 'linear'))];
  },
  /** P04: opacity 280 standard; y +5…+12 → 0 (+8 px when stacked); scale .90 → 1.02 → 1; rotate tilt − 5° → tilt. */
  polaroidDeal: (el, ctx) => {
    const p = params(ctx);
    const photos = num(ctx.data.photoCount, Infinity);
    if (p.stack && photos <= P.polaroidDeal.stackOnlyIfPhotosGt) return;
    if (ctx.reduced) return reducedIn(el);
    const d = P.polaroidDeal;
    const tilt = num(p.tiltDeg, num(Number((el as HTMLElement).dataset?.tilt), 0));
    const rest = p.stack ? d.stackPx : 0;
    const [y0, y1] = d.yFromPx;
    const yFrom = rest + y0 + (y1 - y0) * noise(ctx.seed, ctx.step.at);
    return [
      plan(el, { opacity: [0, 1] }, tw(d.opacityMs, 'standard')),
      plan(el, { y: [yFrom, rest] }, tw(d.scaleMs, 'outQuad')),
      plan(el, { scale: [...d.scale] }, { ...tw(d.scaleMs, 'outQuad'), times: [...d.scaleTimes] }),
      plan(el, { rotate: [tilt + d.tiltFromDeg, tilt] }, tw(d.opacityMs, 'standard')),
    ];
  },

  // ------------------------------------------------------------ surfaces
  /** P05: ONE tween. Rail x calc(100% + 19px) → 0 (mobile sheet y 100% → 0), 560 ms drawer; dock 610 ms; close 240 ms `in`. No scrim. */
  drawerSlide: (el, ctx) => {
    const p = params(ctx);
    const d = P.drawerSlide;
    const variant = (p.variant as string | undefined) ?? (el as HTMLElement).dataset?.variant ?? (isSheet() ? 'sheet' : 'rail');
    const xs = p.x as readonly unknown[] | undefined;
    const closing = (Array.isArray(xs) && xs[0] === 0) || (Array.isArray(p.opacity) && p.opacity[0] === 1);
    const axis = variant === 'sheet' ? 'y' : 'x';
    const off = axis === 'y' ? d.offY : d.offX;
    if (ctx.reduced) {
      const px = `${d.reducedPx}px`;
      return plan(el, closing ? { opacity: [1, 0], [axis]: ['0px', px] } : { opacity: [0, 1], [axis]: [px, '0px'] }, tw(d.reducedMs, 'outQuad'));
    }
    if (closing) return plan(el, { [axis]: [0, off], opacity: [1, 0] }, tw(d.closeMs, 'in'));
    const ms = variant === 'dock' ? duration.dock : duration.drawer;
    return [
      plan(el, { [axis]: [off, 0] }, tw(ms, variant === 'dock' ? 'dock' : 'drawer')),
      plan(el, { opacity: [0, 1] }, tw(d.opacityMs, 'outQuad')),
    ];
  },
  /** P32: opacity only, 240 ms outCubic, no dip. */
  pageCrossfade: (el, ctx) => {
    const to = num(params(ctx).to, 1);
    return plan(el, { opacity: to }, tw(ctx.step.dur || duration.crossfade, 'outCubic'));
  },
  /** P33: both layers 333 ms (out outQuad, in paperIn). Layers are [data-layer="out"|"in"]; else the target dips. */
  paperDipCrossfade: (el, ctx) => {
    const out = el.querySelector<HTMLElement>('[data-layer="out"]');
    const inn = el.querySelector<HTMLElement>('[data-layer="in"]');
    const ms = P.paperDip.ms;
    if (out && inn) {
      if (ctx.reduced) return [plan(out, { opacity: 0 }, tw(P.reducedMs, 'outQuad')), plan(inn, { opacity: [0, 1] }, tw(P.reducedMs, 'outQuad'))];
      return [plan(out, { opacity: [1, 0] }, tw(ms, 'outQuad')), plan(inn, { opacity: [0, 1] }, tw(ms, 'paperIn'))];
    }
    cut(el, ctx);
    return;
  },
  /** P34: lid rotateX 0 → 180° about its bottom edge (perspective 700) + box y +18 vh, one inOutCubic 280 ms. */
  lidFlip3D: (el, ctx) => {
    const p = params(ctx) as { rotateX?: number[]; boxYVh?: number[] };
    const ms = ctx.step.dur || P.lidFlip.step.dur;
    if (ctx.targetName === 'box') {
      if (ctx.reduced) return;
      const [a = 0, b = 18] = p.boxYVh ?? [];
      return plan(el, { y: [`${a}vh`, `${b}vh`] }, tw(ms, 'inOutCubic'));
    }
    if (ctx.reduced) return reducedOut(el);
    style(el).transformOrigin = '50% 100%';
    const [a = 0, b = 180] = p.rotateX ?? [];
    // perspective is constant (never interpolated from 0: a late start would sample perspective(-ε px))
    const pp = P.lidFlip.perspectivePx;
    return plan(el, { rotateX: [a, b], transformPerspective: [pp, pp] } as DOMKeyframesDefinition, tw(ms, 'inOutCubic'));
  },
  /** P35: FLIP from snapshotLayout(el), 280 ms inOutCubic. Without a snapshot it is an instant change. */
  layoutMove: (el, ctx) => {
    const f = flipFrom(el);
    if (!f) return;
    if (ctx.reduced) return reducedIn(el);
    return plan(el, { x: [f.x, 0], y: [f.y, 0], scaleX: [f.sx, 1], scaleY: [f.sy, 1] }, tw(ctx.step.dur || P.layoutMove.ms, 'inOutCubic'));
  },
  /** P36: thumb → hero on spring.lightbox (scale .17 → 1, rotate −4 → −1°); close (params.reverse) on spring.modal. */
  sharedLightbox: (el, ctx) => {
    const p = params(ctx);
    const reverse = !!p.reverse;
    if (ctx.reduced) return reverse ? reducedOut(el) : reducedIn(el);
    const f = flipFrom(el);
    const [r0, r1] = P.lightbox.rotateDeg;
    if (reverse) {
      return plan(el, f ? { x: [0, f.x], y: [0, f.y], scale: [1, f.sx] } : { scale: [1, spring.lightbox.fromValue], opacity: [1, 0] }, springT('modal'));
    }
    const s0 = f ? f.sx : spring.lightbox.fromValue;
    return [
      plan(el, f ? { x: [f.x, 0], y: [f.y, 0], scale: [s0, 1] } : { scale: [s0, 1] }, springT('lightbox')),
      plan(el, { rotate: [r0, r1] }, springT('lightbox')),
      plan(el, { opacity: 1 }, tw(duration.frame, 'linear')),
    ];
  },
  /** P45: shell persists; inner prompt/object fade out 200 standard; the next CTA fades in 167 outCubic. */
  contentSwapInShell: (el, ctx) => {
    const p = params(ctx);
    const c = P.contentSwap;
    if (p.phase === 'cta') return plan(el, { opacity: [0, 1] }, tw(c.nextCtaInMs, 'outCubic'));
    return plan(el, { opacity: 0 }, tw(c.outMs, 'standard'));
  },

  // ------------------------------------------------------------ text
  /** P06: blur 4 → 0 + opacity (dreamy 10 → 0 over 1.8 s); mid tier caps blur at 4 px; low tier scale .98 → 1. */
  textBlurIn: (el, ctx) => {
    if (ctx.reduced) return reducedIn(el);
    const dreamy = params(ctx).variant === 'dreamy';
    const t = P.textBlurIn;
    const ms = ctx.step.dur || (dreamy ? t.dreamyMs : t.shortMs);
    if (ctx.tier === 'low') return plan(el, { opacity: [0, 1], scale: [t.lowScale, 1] }, tw(ms, 'textIn'));
    const px = dreamy && ctx.tier === 'high' ? t.dreamyPx : t.shortPx;
    return plan(el, { opacity: [0, 1], filter: [`blur(${px}px)`, 'blur(0px)'] }, tw(ms, dreamy ? 'outQuad' : 'textIn'));
  },
  /** P07: opacity + y 1.25 px → 0, 167 ms outQuart. */
  tooltipRise: (el, ctx) => {
    if (ctx.reduced) return reducedIn(el);
    return plan(el, { opacity: [0, 1], y: [P.tooltipRise.yPx, 0] }, tw(P.tooltipRise.ms, 'outQuart'));
  },
  /** P08: opacity 0 → .85 over 200 ms outQuad (kept under reduced motion: it is the gate). */
  timedPrompt: (el) => plan(el, { opacity: [0, P.timedPrompt.opacity] }, tw(P.timedPrompt.ms, 'outQuad')),
  /** P42 as a Director step: a 0 ms cue. The React <Typewriter> listens with useDirectorCut and starts. */
  typewriter: (el, ctx) => { cut(el, ctx); },

  // ------------------------------------------------------------ gestures
  /** P15: rotate [0, −2, 1.9, −1]° at [0, .33, .62, 1], 233 ms inOutSine; keeps −1°. Reduced: none. */
  tapWobble: (el, ctx) => {
    if (ctx.reduced) return;
    const w = P.tapWobble;
    return plan(el, { rotate: [...w.rotate] }, { ...tw(w.ms, 'inOutSine'), times: [...w.times] });
  },
  /** P16: container scale (1.01, .995) and back with no bounce (pills: .97 for 70 ms). */
  pressSquash: (el, ctx) => {
    if (ctx.reduced) return;
    const s = P.pressSquash;
    if (params(ctx).kind === 'pill') return plan(el, { scale: [1, s.pill, 1] }, tw(s.pillMs, 'outQuad'));
    return plan(el, { scaleX: [1, s.container[0], 1], scaleY: [1, s.container[1], 1] }, tw(s.pressMs + s.releaseMs, 'outQuad'));
  },
  /** P19: x −9 px + scale 1.06 → 0 / 1 on spring.chromeNudge. */
  chromeNudge: (el, ctx) => {
    if (ctx.reduced) return reducedIn(el);
    return [plan(el, { x: [P.chromeNudge.xPx, 0], scale: [P.chromeNudge.fromScale, 1] }, springT('chromeNudge')), plan(el, { opacity: 1 }, tw(duration.frame, 'linear'))];
  },
  /** P20: colour swap is React state (cut event); the pressed ring is instant. */
  activeSwap: (el, ctx) => { cut(el, ctx); },

  // ------------------------------------------------------------ ambient (persistent; dropped under reduced by reduceSpec)
  /** P25: y 0 ↔ −2.5 px, 3 s inOutSine. */
  idleFloat: (el, ctx) => (ctx.reduced ? undefined : loop(el, { y: [...P.idleFloat.translateYpx] }, tw(P.idleFloat.periodMs, 'inOutSine'))),
  /** P26: origin 50% 100%; 0° 0-17%, 2.7° 50-67%, 0° at 100%; 800 ms linear. */
  trapezoidSway: (el, ctx) => {
    if (ctx.reduced) return;
    const s = P.trapezoidSway;
    style(el).transformOrigin = s.origin;
    return loop(el, { rotate: [...s.values] }, { ...tw(s.periodMs, 'linear'), times: [...s.keyTimes] });
  },
  /** P27: an impulse on spring.pendulum (step = settleMs), seekable; then the 4.8 s ±0.4° breeze persists. */
  pendulum: (el, ctx) => {
    if (ctx.reduced) return;
    const p = P.pendulum;
    style(el).transformOrigin = p.origin;
    let breeze: StepControl | null = null;
    const apply = (ms: number) => { style(el).rotate = `${springValue('pendulum', p.impulseDeg, 0, ms)}deg`; };
    apply(0);
    return {
      persistent: true,
      seek: (ms) => { if (ms < spring.pendulum.settleMs) apply(ms); },
      finish: () => {
        apply(spring.pendulum.settleMs);
        breeze ??= loop(el, { rotate: [0, p.breeze.rotateDeg, 0, -p.breeze.rotateDeg, 0] }, tw(p.breeze.periodMs, 'inOutSine'));
      },
      cancel: () => breeze?.cancel?.(),
      revert: () => { breeze?.cancel?.(); breeze = null; style(el).rotate = ''; },
    };
  },
  /** P28 via the Director: marks the target (data-hint="ring") and emits a cut so a React <HintRing> mounts. */
  hintRing: (el, ctx) => {
    (el as HTMLElement).dataset.hint = 'ring';
    cut(el, ctx);
    return { persistent: true, revert: () => { delete (el as HTMLElement).dataset.hint; }, cancel: () => {} };
  },
  /** P29: 360° per 1.1 s linear (right reel: params.reverse). Bind to media events in React (ReelSpin). */
  reelSpin: (el, ctx) => {
    const per = P.reelSpin.periodMs / (ctx.reduced ? P.reelSpin.reducedFactor : 1);
    return loop(el, { rotate: params(ctx).reverse ? [0, -360] : [0, 360] }, tw(per, 'linear'));
  },
  /** P44: irregular inOutSine legs within the token ranges; small for the first ~1.5 s. Reduced: none (static outline). */
  idleWobble: (el, ctx) => {
    if (ctx.reduced) { style(el).outline = '2px solid var(--c-blush-ring)'; return { revert: () => { style(el).outline = ''; } }; }
    const segs = wobbleSegments(ctx.seed, 16, P.idleWobble);
    const x = ['0%', ...segs.map((s) => `${s.x}%`)], y = ['0%', ...segs.map((s) => `${s.y}%`)], r = [0, ...segs.map((s) => s.r)];
    const total = segs.reduce((n, s) => n + s.ms, 0);
    const times = [0, ...segs.map((s) => (s.t0 + s.ms) / total)];
    return loop(el, { x, y, rotate: r } as DOMKeyframesDefinition, { ...tw(total, 'inOutSine'), times, repeatType: 'mirror' } as never);
  },

  // ------------------------------------------------------------ physical
  /** P10: ribbon x 0 → +43 vw, rotate 11 → 33° over 133 ms inQuad (micro exit). Reduced: 200 ms fade. */
  whipOff: (el, ctx) => {
    if (ctx.reduced) return reducedOut(el);
    const p = params(ctx) as { xVw?: number[]; rotateDeg?: number[] };
    const [x0 = 0, x1 = P.whipOff.xVw] = p.xVw ?? [];
    const [r0, r1] = (p.rotateDeg as [number, number] | undefined) ?? P.whipOff.rotateDeg;
    return plan(el, { x: [`${x0}vw`, `${x1}vw`], rotate: [r0, r1] }, tw(ctx.step.dur || P.whipOff.ms, 'inQuad'));
  },
  /** P12: y → 105 vh over 1400 curtainFall; wash ([data-wash]) from +33 over 700 linear; fade from +900 over 630 inQuad; mask from +1100 over 430. */
  curtainDrop: (el, ctx) => {
    if (ctx.reduced) return plan(el, { opacity: 0 }, tw(Math.min(ctx.step.dur || duration.modal, duration.modal), 'outQuad'));
    const c = P.curtainDrop;
    const [y0, y1] = c.yVh;
    const plans: DomAnimationPlan[] = [
      plan(el, { y: [`${y0}vh`, `${y1}vh`] }, tw(P.curtainFallMs, 'curtainFall')),
      plan(el, { opacity: [1, 0] }, tw(c.fadeMs, c.fadeEase, c.fadeFromMs)),
      plan(el, { clipPath: ['inset(0% 0 0 0)', 'inset(100% 0 0 0)'] }, tw(c.maskMs, c.maskEase, c.maskFromMs)),
    ];
    const wash = el.querySelector<HTMLElement>('[data-wash]');
    if (wash) plans.push(plan(wash, { opacity: [0, 1] }, tw(c.washMs, c.washEase, c.washFromMs)));
    return plans;
  },
  /** P23: ≤1-frame rise to .85, linear decay (camera) / .6 → .3 → .07 → 0 outQuad (impact). Reduced: .4 over 200 ms. */
  cameraFlash: (el, ctx) => {
    const f = P.cameraFlash;
    const impact = params(ctx).kind === 'impact';
    if (ctx.reduced) return plan(el, { opacity: [f.reduced.peak, 0] }, tw(f.reduced.decayMs, 'linear'));
    if (impact) return plan(el, { opacity: [...f.impactSteps] }, tw(f.impact.decayMs, 'outQuad'));
    const total = f.camera.riseMs + f.camera.decayMs;
    return plan(el, { opacity: [0, f.camera.peak, 0] }, { ...tw(total, 'linear'), times: [0, f.camera.riseMs / total, 1] });
  },
  /** P37a: linear feed out of an overflow:hidden slot (y −100% → 0). */
  slotPrint: (el, ctx) => {
    if (ctx.reduced) return reducedIn(el);
    return plan(el, { y: ['-100%', '0%'] }, tw(ctx.step.dur || P.slotPrint.ms, 'linear'));
  },
  /**
   * P37b: quadratic-Bézier arc over params.arcMs from the slot (data-from-x/-y on the target, px offsets
   * from the rest position; default: 30 vh below) + scale on spring.toss from params.fromScale + tilt
   * ±16° at ~60 % unwinding to rest (data-rest-deg). Seekable: a pure function of step time.
   */
  toss: (el, ctx) => {
    if (ctx.reduced) return reducedIn(el);
    const p = params(ctx);
    const ds = (el as HTMLElement).dataset ?? {};
    const arcMs = num(p.arcMs, P.toss.arcMs[1]);
    const from = num(p.fromScale, P.toss.fromScale[0]);
    const dx = num(Number(ds.fromX), 0), dy = num(Number(ds.fromY), (typeof innerHeight === 'number' ? innerHeight : 844) * 0.3);
    const rest = num(Number(ds.restDeg), 0);
    const [a0, a1] = P.toss.arcPx;
    const arc = a0 + (a1 - a0) * noise(ctx.seed, ctx.step.at);
    const total = ctx.step.dur || spring.toss.settleMs;
    const sign = dx === 0 ? 1 : Math.sign(-dx);
    const tiltFn = ease('outQuad');
    const s = style(el);
    return seekable((ms) => {
      const u = Math.min(1, ms / arcMs);
      const pt = tossPoint(dx, dy, arc, u);
      const sc = from + (1 - from) * springAt('toss', ms);
      const pr = Math.min(1, ms / total);
      const tA = (P.toss.tiltAt * arcMs) / total;
      const rot = keyframeAt([0, P.toss.tiltDeg * sign, rest], [0, tA, 1], pr, tiltFn);
      s.opacity = '1';
      s.transform = `translate(${pt.x}px, ${pt.y}px) rotate(${rot}deg) scale(${sc})`;
    }, total, () => { s.transform = ''; });
  },
  /** P47: the coin hard-cuts (opacity 1 → 0) to a heart token ([data-token]) that rises −4 vh `in` and fades into the slot. */
  tokenDrop: (el, ctx) => {
    const heart = el.querySelector<HTMLElement>('[data-token]');
    const coin = el.querySelector<HTMLElement>('[data-coin]');
    if (coin) coin.style.opacity = '0';
    if (!heart) return;
    const t = P.tokenDrop;
    if (ctx.reduced) { heart.style.opacity = '0'; return; }
    const [y0, y1] = t.heartYPctVh;
    return plan(heart, { y: [`${y0}vh`, `${y1}vh`], opacity: [1, 0] }, tw(ctx.step.dur || t.durMs[1], 'in'));
  },
};
