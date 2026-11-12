/**
 * Generic action implementations (owner: scaffold). Primitive-specific actions (stampPop, tapWobble,
 * drawerSlide …) live in sibling files owned by the primitives builder and override nothing here
 * unless they intend to.
 */
import type { ActionImplMap, DomAnimationPlan, StepContext } from '../types';
import { bez, springT, reducedMotion, duration } from '../tokens';
import type { AnimationOptions, DOMKeyframesDefinition } from 'motion';

/** Transition for a step: its spring preset, else its easing over `dur` (seconds). */
export function stepTransition(ctx: StepContext, overrides: AnimationOptions = {}): AnimationOptions {
  const { step } = ctx;
  if (ctx.reduced) return { duration: Math.min(step.dur, duration.base) / 1000, ease: bez('outQuad'), ...overrides };
  if (step.spring) return { ...springT(step.spring), ...overrides };
  return { duration: step.dur / 1000, ease: bez(step.ease ?? 'outQuad'), ...overrides };
}

type Val = number | string | null;
const UNIT: Record<string, [prop: string, unit: string]> = {
  x: ['x', ''], y: ['y', ''], xPx: ['x', 'px'], yPx: ['y', 'px'],
  xVw: ['x', 'vw'], yVh: ['y', 'vh'], xPct: ['x', '%'], yPct: ['y', '%'], xPctW: ['x', '%'], yPctH: ['y', '%'],
  rotateDeg: ['rotate', 'deg'], rotate: ['rotate', ''], rotateX: ['rotateX', ''], rotateY: ['rotateY', ''],
  scale: ['scale', ''], scaleX: ['scaleX', ''], scaleY: ['scaleY', ''], opacity: ['opacity', ''],
};
const withUnit = (v: Val, unit: string): Val => (typeof v === 'number' && unit ? `${v}${unit}` : v);

/**
 * Map choreography `params` (motion-tokens.json vocabulary: yPx, xVw, rotateDeg, opacity [from, to] …)
 * to Motion keyframes. Unknown keys and descriptive strings are ignored.
 */
export function paramsToKeyframes(params: Readonly<Record<string, unknown>> | undefined, reduced = false): DOMKeyframesDefinition {
  const out: Record<string, Val | Val[]> = {};
  for (const [k, raw] of Object.entries(params ?? {})) {
    const map = UNIT[k];
    if (!map) continue;
    const [prop, unit] = map;
    if (reduced && prop !== 'opacity') continue;
    if (Array.isArray(raw)) {
      const vals = raw.filter((v): v is Val => v === null || typeof v === 'number' || (typeof v === 'string' && /^-?[\d.]/.test(v)));
      if (vals.length === raw.length) out[prop] = vals.map((v) => withUnit(v, unit));
    } else if (typeof raw === 'number') out[prop] = withUnit(raw, unit);
  }
  return out as DOMKeyframesDefinition;
}

const setHidden = (el: Element, hidden: boolean) => {
  if (el instanceof HTMLElement || el instanceof SVGElement) {
    if (hidden) el.setAttribute('data-director-hidden', ''); else el.removeAttribute('data-director-hidden');
    (el as HTMLElement).style.display = hidden ? 'none' : '';
  }
};

/** Dispatched on the target for 0 ms state steps so React components can react (`useDirectorCut`). */
export const CUT_EVENT = 'director:cut';
export interface CutEventDetail { readonly name: string; readonly action: string; readonly params: Readonly<Record<string, unknown>> }

const dispatchCut = (el: Element, ctx: StepContext) =>
  el.dispatchEvent(new CustomEvent<CutEventDetail>(CUT_EVENT, { detail: { name: ctx.step.name, action: ctx.step.action, params: ctx.step.params ?? {} } }));

export const actions: ActionImplMap = {
  /** Opacity to params.to (default 1). */
  fade: (el, ctx): DomAnimationPlan => {
    const to = Number((ctx.step.params as { to?: number } | undefined)?.to ?? 1);
    return { el, keyframes: { opacity: to }, transition: stepTransition(ctx) };
  },
  /** Generic tween from params (see paramsToKeyframes). Under reduced motion only opacity moves. */
  tween: (el, ctx) => {
    const kf = paramsToKeyframes(ctx.step.params, ctx.reduced);
    if (!Object.keys(kf).length) return;
    return { el, keyframes: kf, transition: stepTransition(ctx) };
  },
  /** 0 ms: params.text → textContent, params.inert → inert, params.opacity; always emits CUT_EVENT. */
  hardCut: (el, ctx) => {
    const p = (ctx.step.params ?? {}) as { text?: string; inert?: boolean; opacity?: number };
    const prev = { text: el.textContent, inert: (el as HTMLElement).inert, opacity: (el as HTMLElement).style.opacity };
    const apply = () => {
      if (typeof p.text === 'string') el.textContent = p.text;
      if (typeof p.inert === 'boolean') (el as HTMLElement).inert = p.inert;
      if (typeof p.opacity === 'number') (el as HTMLElement).style.opacity = String(p.opacity);
      dispatchCut(el, ctx);
    };
    apply();
    return {
      revert: () => {
        if (typeof p.text === 'string') el.textContent = prev.text;
        if (typeof p.inert === 'boolean') (el as HTMLElement).inert = prev.inert;
        if (typeof p.opacity === 'number') (el as HTMLElement).style.opacity = prev.opacity;
      },
    };
  },
  remove: (el, ctx) => { setHidden(el, true); dispatchCut(el, ctx); return { revert: () => setHidden(el, false) }; },
  unmount: (el, ctx) => { setHidden(el, true); dispatchCut(el, ctx); return { revert: () => setHidden(el, false) }; },
  mount: (el, ctx) => { setHidden(el, false); dispatchCut(el, ctx); return { revert: () => setHidden(el, true) }; },
};

/** Fallback for an ActionId with no implementation yet: a plain fade-in so scenes stay usable. */
export const fallbackAction = (el: HTMLElement | SVGElement, ctx: StepContext): DomAnimationPlan => ({
  el, keyframes: { opacity: 1 }, transition: { duration: Math.min(ctx.step.dur, duration.crossfade) / 1000, ease: bez('outQuad') },
});

/** Reduced flash parameters for cameraFlash implementations. */
export const reducedFlash = reducedMotion.flash;
