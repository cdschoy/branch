/**
 * Reduced motion (FRAMEWORK §4.5; owner: scaffold). React-free.
 *
 * Reduced is ON when the OS asks (`prefers-reduced-motion: reduce`) OR the in-app toggle
 * "Giảm chuyển động" is on (persisted in localStorage, try/catch). The Director swaps each spec for
 * its reduced variant (`spec.reduced`, see `reduceSpec`), and every action implementation receives
 * `ctx.reduced` so it can play the §4.5 behaviour (opacity only, no particles, no ambient loops).
 */
import type { Spec, Step, ActionId } from './tokens';

const KEY = 'qt.reducedMotion';
type Listener = (reduced: boolean) => void;
const listeners = new Set<Listener>();

let override: boolean | null = (() => {
  try { const v = localStorage.getItem(KEY); return v === null ? null : v === '1'; } catch { return null; }
})();

const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
mq?.addEventListener?.('change', () => emit());

function emit() { const r = isReducedMotion(); listeners.forEach((l) => l(r)); }

/** OS preference only. */
export const prefersReducedMotion = (): boolean => !!mq?.matches;
/** Effective setting: in-app toggle (if set) OR the OS preference. */
export const isReducedMotion = (): boolean => (override === true) || prefersReducedMotion();
/** The in-app toggle value (null = follow the OS). */
export const getReducedOverride = (): boolean | null => override;
export function setReducedOverride(v: boolean | null): void {
  override = v;
  try { if (v === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* private mode */ }
  emit();
}
export function subscribeReducedMotion(fn: Listener): () => void { listeners.add(fn); return () => { listeners.delete(fn); }; }

// ---------------------------------------------------------------- spec transform
/** Actions drawn on the fx canvas (particles, curtains). Off under reduced motion (§4.5). */
export const CANVAS_ACTIONS: ReadonlySet<ActionId> = new Set<ActionId>([
  'bloomBurst', 'flowerCurtain', 'confettiFountain', 'heartBurst', 'petalField', 'fxEmit', 'risingParallax', 'rainLens',
]);
/** Ambient loops: off under reduced motion (static poses). */
export const AMBIENT_ACTIONS: ReadonlySet<ActionId> = new Set<ActionId>([
  'idleFloat', 'trapezoidSway', 'pendulum', 'hintRing', 'livingHold', 'handheldSway', 'idleWobble', 'sparkleGlint',
]);
/** 0 ms state steps: keep under reduced motion, in order (gates still work). */
export const STATE_ACTIONS: ReadonlySet<ActionId> = new Set<ActionId>(['hardCut', 'remove', 'mount', 'unmount', 'typewriter', 'timedPrompt']);

/** Parse `spec.reduced`: 'crossfade300' | 'opacity200' | 'crossfade200' | 'flashReduced' | 'none' | 'n/a'. */
export function reducedVariant(spec: Spec): { kind: 'compress' | 'flash' | 'none'; ms: number } {
  const m = /^(crossfade|opacity)(\d+)$/.exec(spec.reduced);
  if (m) return { kind: 'compress', ms: Number(m[2]) };
  if (spec.reduced === 'flashReduced') return { kind: 'flash', ms: 0 };
  return { kind: 'none', ms: 0 };
}

/**
 * Default reduced transform used by the Director:
 * - 'crossfadeN' / 'opacityN': the timeline is compressed into N ms (each `at` scaled, `dur` capped at N);
 *   canvas and ambient steps are dropped (a step can opt back in with `params.keepReduced: true`);
 *   state steps are kept in order. Action implementations see `ctx.reduced` and play opacity-only.
 * - 'flashReduced': timing unchanged (the booth timer is functional), particles dropped, flash impl
 *   uses peak .4 / 200 ms decay (`reducedMotion.flash`).
 * - 'none' / 'n/a': unchanged.
 * A choreography may pass its own hand-written reduced spec via `PlayOptions.reducedSpec` instead.
 */
export function reduceSpec(spec: Spec, forceCrossfadeMs?: number): Spec {
  const v = forceCrossfadeMs ? { kind: 'compress' as const, ms: forceCrossfadeMs } : reducedVariant(spec);
  if (v.kind === 'none') return spec;
  const keep = (s: Step) => !!(s.params as { keepReduced?: boolean } | undefined)?.keepReduced;
  const steps = spec.steps.filter((s) => keep(s) || (!CANVAS_ACTIONS.has(s.action) && !AMBIENT_ACTIONS.has(s.action)));
  if (v.kind === 'flash') return { ...spec, steps };
  const total = Math.max(1, ...spec.steps.map((s) => s.at + s.dur));
  const k = Math.min(1, v.ms / total);
  return {
    ...spec,
    steps: steps.map((s) => {
      const at = Math.round(s.at * k);
      return { ...s, at, dur: Math.max(0, Math.min(s.dur, v.ms - at)) };
    }),
  };
}
