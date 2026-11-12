/**
 * React bindings for motion/core (owner: scaffold). The only React code under src/motion/ lives in
 * this folder (§7.2).
 */
import { useCallback, useEffect, useRef, useSyncExternalStore, type RefObject } from 'react';
import {
  director, ticker, isReducedMotion, subscribeReducedMotion, getReducedOverride, setReducedOverride, CUT_EVENT,
  type CutEventDetail, type PlayOptions, type Run, type Spec, type TargetMap, type TickFn,
} from '../core';

/** Effective reduced motion (OS preference OR the in-app toggle), live. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, isReducedMotion, () => false);
}

/** The in-app "Giảm chuyển động" toggle: [value (null = follow OS), set]. */
export function useReducedMotionToggle(): [boolean | null, (v: boolean | null) => void] {
  const v = useSyncExternalStore(subscribeReducedMotion, getReducedOverride, () => null);
  return [v, setReducedOverride];
}

/** Subscribe to the shared ticker while mounted (and `active`). */
export function useTicker(fn: TickFn, active = true, priority = 0): void {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => (active ? ticker.add((n, dt) => ref.current(n, dt), priority) : undefined), [active, priority]);
}

/**
 * `const play = usePlay(); const run = play(choreography.C4open, { letter: letterRef, scrim: scrimRef });`
 * Any run started through this hook is cancelled on unmount; starting a new run with the same `slot`
 * cancels the previous one.
 */
export function usePlay(): (spec: Spec, refs: TargetMap, opts?: PlayOptions & { slot?: string }) => Run {
  const runs = useRef(new Map<string, Run>());
  useEffect(() => () => { runs.current.forEach((r) => r.cancel()); runs.current.clear(); }, []);
  return useCallback((spec, refs, opts = {}) => {
    const slot = opts.slot ?? spec.id;
    runs.current.get(slot)?.cancel();
    const run = director.play(spec, refs, opts);
    runs.current.set(slot, run);
    void run.finished.then(() => { if (runs.current.get(slot) === run) runs.current.delete(slot); });
    return run;
  }, []);
}

/** React to the Director's 0 ms state steps (hardCut / remove / mount / unmount) on an element. */
export function useDirectorCut(ref: RefObject<Element | null>, onCut: (d: CutEventDetail) => void): void {
  const cb = useRef(onCut);
  cb.current = onCut;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const h = (e: Event) => cb.current((e as CustomEvent<CutEventDetail>).detail);
    el.addEventListener(CUT_EVENT, h);
    return () => el.removeEventListener(CUT_EVENT, h);
  }, [ref]);
}
