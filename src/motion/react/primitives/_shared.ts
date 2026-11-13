/** Shared helpers for the React primitives (owner: primitives). */
import './primitives.css';
import { useCallback, useEffect, useRef } from 'react';
import { bez, sec, type EasingName } from '../../core/tokens';
import { P } from '../../core/actions/params';

export { P };

/** Motion tween transition from a duration in ms + a token easing (+ delay ms). */
export const tw = (ms: number, e: EasingName, delayMs = 0) => ({ duration: sec(ms), ease: bez(e), delay: sec(delayMs) });

/** §4.5 reduced pop: opacity 200 ms outQuad in place. */
export const reducedPop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: tw(P.reducedMs, 'outQuad'),
} as const;

/** Call `onDone` at most once per (play, playKey) cycle. */
export function useDoneOnce(onDone: (() => void) | undefined, play: boolean, playKey: unknown): () => void {
  const fired = useRef(false);
  const cb = useRef(onDone);
  cb.current = onDone;
  useEffect(() => { fired.current = false; }, [play, playKey]);
  return useCallback(() => {
    if (!play || fired.current) return;
    fired.current = true;
    cb.current?.();
  }, [play]);
}

/** Latest-value ref. */
export function useLatest<T>(v: T) {
  const r = useRef(v);
  r.current = v;
  return r;
}

export const cx = (...xs: (string | false | null | undefined)[]): string => xs.filter(Boolean).join(' ');
