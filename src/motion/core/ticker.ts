/**
 * The single rAF clock (FRAMEWORK §7.3; owner: scaffold). React-free.
 *
 * Everything time-based (Director runs, fx canvas, typewriter, tier probe) subscribes here; nobody
 * else calls requestAnimationFrame. The loop sleeps when there are no subscribers and wakes on the
 * next `add()`. Subscribers run in ascending `priority` (Director = 0, fx draw = 100) so a frame's
 * state is updated before it is drawn.
 */
export type TickFn = (now: number, dt: number) => void;

interface Sub { fn: TickFn; priority: number; order: number }

export interface Ticker {
  /** Subscribe; returns the unsubscribe function. */
  add(fn: TickFn, priority?: number): () => void;
  /** Current clock time in ms (performance.now()). */
  now(): number;
  /** True while a frame loop is scheduled. */
  readonly running: boolean;
  /** Last frame deltas in ms (newest last, up to 120) for the tier probe and the circuit breaker. */
  readonly deltas: readonly number[];
}

export function createTicker(raf: (cb: FrameRequestCallback) => number = (cb) => requestAnimationFrame(cb)): Ticker {
  let subs: Sub[] = [];
  let order = 0;
  let handle: number | null = null;
  let last = 0;
  const deltas: number[] = [];

  const frame = (now: number) => {
    handle = null;
    const dt = last ? now - last : 16.7;
    last = now;
    deltas.push(dt);
    if (deltas.length > 120) deltas.shift();
    for (const s of subs.slice()) {
      try { s.fn(now, dt); } catch (err) { console.error('[ticker]', err); }
    }
    if (subs.length) handle = raf(frame);
    else last = 0; // sleep
  };

  return {
    add(fn, priority = 0) {
      const sub = { fn, priority, order: order++ };
      subs = [...subs, sub].sort((a, b) => a.priority - b.priority || a.order - b.order);
      if (handle === null) handle = raf(frame);
      return () => { subs = subs.filter((s) => s !== sub); };
    },
    now: () => performance.now(),
    get running() { return handle !== null; },
    deltas,
  };
}

/** The app-wide ticker. Import this, never create a second clock. */
export const ticker: Ticker = createTicker();
