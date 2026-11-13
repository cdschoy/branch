/**
 * Director → fx bridge (owner: fx). Maps canvas ActionIds to emitters; the Director seeks the returned
 * control every tick with step-local time (handles are created with autoplay: false).
 *
 * Held emitters (`burstMound`, or any step with `params.hold: true`): when the step ends, `finish()` seeks
 * them to their end state and leaves them drawn until a flood `phase: "clear"` step with the same seed
 * starts (the wall fully covers them at that moment), the Director reverts the step (seek back), or
 * HOLD_CAP_MS passes (a cancelled run only cancels its active steps).
 */
import type { ActionId, FxBridge, StepContext, StepControl } from '../motion/core/types';
import type { EmitOptions, EmitterId, EmitterInstance, FxEngine, FxHandle } from './types';
import { getEmitter } from './registry';
import { hashSeed, mulberry32 } from './rng';
import { getTier } from '../motion/core/tier';
import { isReducedMotion } from '../motion/core/reduced';

const CURTAIN_MODE: Record<string, EmitterId> = { reveal: 'curtainReveal', wipe: 'curtainWipe', flood: 'flood', bloom: 'bloom' };
/** Emitters whose last frame stays on screen after their step (see header). */
const HELD: ReadonlySet<string> = new Set(['burstMound']);
/** Safety net: a held handle is removed after this long even if nothing clears it. */
const HOLD_CAP_MS = 4000;

/** Which emitter renders this step (undefined → not a canvas step). */
export function emitterFor(action: ActionId, params: Readonly<Record<string, unknown>> = {}): EmitterId | undefined {
  switch (action) {
    case 'bloomBurst': return 'bloom';
    case 'flowerCurtain': return CURTAIN_MODE[String(params.mode ?? 'reveal')];
    case 'confettiFountain': return 'confetti';
    case 'heartBurst': return 'hearts';
    case 'petalField': return 'petals';
    case 'fxEmit': return typeof params.emitter === 'string' ? params.emitter : undefined;
    default: return undefined;
  }
}

/** The element's box in CSS px, as emitters read it from `params.rect` (strip-relative confetti, heart spread). */
export function rectOf(el: Element | null | undefined): { w: number; h: number; top: number; left: number } | undefined {
  if (!el || typeof el.getBoundingClientRect !== 'function') return undefined;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 ? { w: r.width, h: r.height, top: r.top, left: r.left } : undefined;
}

/**
 * Build the instance an emit would create (same seed hashing, view, tier and budget) WITHOUT drawing it,
 * so a caller can read its closed-form timings: `coverAtMs` (≥70% cover swap point) and `coverage(t)`.
 */
export function probeEmitter(engine: FxEngine, id: EmitterId, opts: EmitOptions = {}): (EmitterInstance & { coverAtMs?: number; coverage?: (t: number) => number }) | undefined {
  const def = getEmitter(id);
  if (!def || def.stub) return undefined;
  const tier = opts.tier ?? getTier();
  const seed = typeof opts.seed === 'number' ? opts.seed >>> 0 : hashSeed(opts.seed ?? id);
  const params = opts.params ?? {};
  const view = engine.view.w ? engine.view : { w: window.innerWidth, h: window.innerHeight, dpr: 1 };
  const o = opts.origin;
  let origin = { x: view.w / 2, y: view.h / 2 };
  if (o) {
    const p = (typeof Element !== 'undefined' && o instanceof Element ? o.getBoundingClientRect() : o) as { x: number; y: number; width?: number; height?: number };
    origin = p.width !== undefined && p.height !== undefined ? { x: p.x + p.width / 2, y: p.y + p.height / 2 } : { x: p.x, y: p.y };
  }
  return def.create({
    seed, rng: mulberry32(seed), params, view, origin, tier, reduced: opts.reduced ?? isReducedMotion(),
    count: opts.count ?? def.count(tier, params), durMs: opts.durMs,
  });
}

export function createFxBridge(engine: FxEngine): FxBridge {
  /** Held handles by seed (cleared by a flood clear phase with the same seed). */
  const held = new Map<number, Set<FxHandle>>();
  const release = (seed: number) => { const s = held.get(seed); if (!s) return; held.delete(seed); for (const h of s) h.stop(); };

  return {
    handles(action: ActionId, ctx: StepContext) {
      const id = emitterFor(action, ctx.step.params);
      const def = id ? getEmitter(id) : undefined;
      return !!def && !def.stub;
    },
    run(ctx: StepContext): StepControl {
      const params = ctx.step.params ?? {};
      const id = emitterFor(ctx.step.action, params)!;
      const rect = rectOf(ctx.el);
      const h = engine.emit(id, {
        seed: ctx.seed, params: { ...(rect ? { rect } : {}), ...params, ease: ctx.step.ease }, origin: ctx.el, tier: ctx.tier,
        reduced: ctx.reduced, durMs: ctx.step.dur, autoplay: false,
      });
      // the wall of a clear phase covers everything at its start: drop the held burst under it
      if (id === 'flood' && params.phase === 'clear') release(ctx.seed);
      const hold = HELD.has(id) || params.hold === true;
      if (hold) {
        let s = held.get(ctx.seed);
        if (!s) held.set(ctx.seed, (s = new Set()));
        s.add(h);
        const timer = setTimeout(() => { h.stop(); held.get(ctx.seed)?.delete(h); }, HOLD_CAP_MS / Math.max(0.1, ctx.timeScale || 1));
        void h.finished.then(() => clearTimeout(timer));
      }
      const stop = () => { h.stop(); held.get(ctx.seed)?.delete(h); };
      return {
        seek: (ms) => h.seek(ms),
        pause: () => h.pause(),
        resume: () => h.resume(),
        finish: () => { h.seek(h.durationMs); if (!hold) h.stop(); },
        revert: stop,
        cancel: stop,
      };
    },
  };
}
