/**
 * The Director: choreography runtime (FRAMEWORK §7.3; owner: scaffold). React-free.
 *
 * `director.play(spec, refs, opts) → Run` plays a `Spec` from motion.ts (`choreography.C1a` …) against
 * named targets. One rAF ticker is the only clock; three renderers hang off it:
 *
 *   - DOM steps   → the action registry (src/motion/core/actions/*.ts) returns Motion `animate()` plans.
 *                   They start on a ticker frame and are re-seeked only when they drift > 1 frame
 *                   (or on skip / scrub / timeScale), so WAAPI keeps compositor offload.
 *   - Canvas steps → the FxBridge (src/fx/bridge.ts). The Director calls `seek(localMs)` every tick,
 *                   so sprites are pure f(index, t, seed) and scrubbing / ×3 preview is exact.
 *   - State steps → a `StepFn` target (setState at the offset) or the 0 ms base actions
 *                   (hardCut / remove / mount / unmount dispatch a `director:cut` event on the element).
 *
 * Rules implemented here:
 *   - G6: `await preload(spec.assets)` before t0 (bounded by `preloadTimeoutMs`).
 *   - §4.5: reduced motion swaps the spec for `opts.reducedSpec ?? reduceSpec(spec)`; ctx.reduced is set.
 *   - G15: `setTimeScale(3)` fast-forwards; `skip()` jumps to end states; input gating is the caller's job
 *     (await `run.finished`, then send CHOREO_DONE to the machine).
 *   - G18: circuit breaker — ≥3 dropped frames within 50 ms during a spectacle → `skip()`, and
 *     `director.degradeNext = true` makes the next spectacle a 300 ms crossfade.
 *   - `clock: 'gesture'` specs never advance on the ticker; the caller scrubs them with `seek()`.
 *   - `tierMin` steps are dropped below that tier.
 */
import { animate, type AnimationPlaybackControls } from 'motion';
import type { Spec, Step, Tier } from './tokens';
import type {
  ActionImplMap, Director, DomAnimationPlan, FxBridge, PlayOptions, Run, StepContext, StepControl, TargetBinding, TargetMap, TargetRef,
} from './types';
import { ticker as sharedTicker, type Ticker } from './ticker';
import { isReducedMotion, reduceSpec, CANVAS_ACTIONS } from './reduced';
import { getTier } from './tier';
import { hashSeed } from './hash';
import { preloadAssets } from './preload';
import { builtinActions } from './actions';
import { fallbackAction } from './actions/base';

const TIER_RANK: Record<Tier, number> = { low: 0, mid: 1, high: 2 };
const FRAME = 1000 / 60;
const DEV = !!import.meta.env?.DEV;
const warned = new Set<string>();
const warnOnce = (k: string, msg: string) => { if (DEV && !warned.has(k)) { warned.add(k); console.warn(msg); } };

interface Rec { step: Step; phase: 'pending' | 'active' | 'done'; control: Internal | null }
interface Internal extends StepControl { tick?(localMs: number): void }

const isElement = (x: unknown): x is Element => typeof Element !== 'undefined' && x instanceof Element;
const isRefObj = (x: unknown): x is { current: Element | null } => !!x && typeof x === 'object' && 'current' in (x as object);

function resolve(ref: TargetRef): { el: Element | null; run?: TargetBinding['run'] } {
  if (!ref) return { el: null };
  if (typeof ref === 'function') return { el: null, run: ref };
  if (isElement(ref)) return { el: ref };
  if (isRefObj(ref)) return { el: ref.current };
  const b = ref as TargetBinding;
  const el = b.el ? (isElement(b.el) ? b.el : isRefObj(b.el) ? b.el.current : null) : null;
  return b.run ? { el, run: b.run } : { el };
}

function isPlanList(x: unknown): x is readonly DomAnimationPlan[] { return Array.isArray(x); }
function isPlan(x: unknown): x is DomAnimationPlan { return !!x && typeof x === 'object' && 'keyframes' in (x as object); }

/** Wrap Motion controls as a StepControl with drift correction. */
function wrapAnims(anims: AnimationPlaybackControls[], speed: number): Internal {
  anims.forEach((a) => { a.speed = speed; });
  return {
    seek: (ms) => anims.forEach((a) => { a.time = Math.max(0, ms) / 1000; }),
    tick: (ms) => anims.forEach((a) => {
      const dur = (a.duration || 0) * 1000;
      if (ms > dur) return;
      if (Math.abs(a.time * 1000 - ms) > FRAME * 2) a.time = ms / 1000;
    }),
    pause: () => anims.forEach((a) => a.pause()),
    resume: () => anims.forEach((a) => a.play()),
    setSpeed: (x) => anims.forEach((a) => { a.speed = x; }),
    finish: () => anims.forEach((a) => a.complete()),
    revert: () => anims.forEach((a) => a.cancel()),
    cancel: () => anims.forEach((a) => a.stop()),
  };
}

function combine(controls: Internal[]): Internal | null {
  if (!controls.length) return null;
  if (controls.length === 1) return controls[0] ?? null;
  const each = (k: keyof Internal, ...args: unknown[]) => controls.forEach((c) => (c[k] as ((...a: unknown[]) => void) | undefined)?.(...args));
  return {
    seek: (ms) => each('seek', ms), tick: (ms) => each('tick', ms), pause: () => each('pause'), resume: () => each('resume'),
    setSpeed: (x) => each('setSpeed', x), finish: () => each('finish'), revert: () => each('revert'), cancel: () => each('cancel'),
    persistent: controls.every((c) => c.persistent),
  };
}

/** Adopt a caller/fx StepControl without losing `this` (class instances) and tick it with seek. */
function adopt(c: StepControl): Internal {
  return {
    seek: c.seek && ((ms) => c.seek!(ms)), tick: c.seek && ((ms) => c.seek!(ms)),
    pause: c.pause && (() => c.pause!()), resume: c.resume && (() => c.resume!()),
    setSpeed: c.setSpeed && ((x) => c.setSpeed!(x)), finish: c.finish && (() => c.finish!()),
    revert: c.revert && (() => c.revert!()), cancel: c.cancel && (() => c.cancel!()),
    persistent: !!c.persistent,
  };
}

const isSpectacle = (spec: Spec) => spec.steps.some((s) => CANVAS_ACTIONS.has(s.action)) || Math.max(0, ...spec.steps.map((s) => s.at + s.dur)) >= 1400;

export function createDirector(deps: { ticker?: Ticker; fx?: FxBridge | null } = {}): Director {
  const tk = deps.ticker ?? sharedTicker;
  let fx: FxBridge | null = deps.fx ?? null;
  let loader: (assets: readonly string[]) => Promise<void> = preloadAssets;
  const registry: ActionImplMap = { ...builtinActions };

  const director: Director = {
    timeScale: 1,
    degradeNext: false,
    setFx(b) { fx = b; },
    setAssetLoader(fn) { loader = fn; },
    registerActions(map) { Object.assign(registry, map); },
    play(spec, refs, opts = {}) { return startRun(spec, refs, opts); },
  };

  function startRun(source: Spec, refs: TargetMap, opts: PlayOptions): Run {
    const tier = opts.tier ?? getTier();
    const reduced = opts.reduced ?? isReducedMotion();
    let spec = source;
    if (reduced) spec = opts.reducedSpec ?? reduceSpec(source);
    else if (director.degradeNext && isSpectacle(source)) { spec = reduceSpec(source, 300); director.degradeNext = false; }
    const seed = opts.seed ?? hashSeed(source.id);
    const data = opts.data ?? {};
    const gesture = spec.clock === 'gesture';
    const breaker = opts.circuitBreaker ?? isSpectacle(source);

    const recs: Rec[] = spec.steps
      .filter((s) => !s.tierMin || TIER_RANK[tier] >= TIER_RANK[s.tierMin])
      .map((step, i) => ({ step, i }))
      .sort((a, b) => a.step.at - b.step.at || a.i - b.i)
      .map(({ step }) => ({ step, phase: 'pending' as const, control: null }));
    const total = Math.max(0, ...recs.map((r) => r.step.at + r.step.dur));

    let state: Run['state'] = 'preloading';
    let base = 0;          // run time at wallStart
    let wallStart = 0;
    let paused = !!opts.paused || gesture;
    let scale = (opts.timeScale ?? 1) * director.timeScale;
    let pendingSeek: number | null = null;
    let skipRequested = false;
    let unsub: (() => void) | null = null;
    let frames = 0;
    const drops: [number, number][] = [];
    let resolveFinished!: () => void;
    let resolveStarted!: () => void;
    const finished = new Promise<void>((r) => { resolveFinished = r; });
    const started = new Promise<void>((r) => { resolveStarted = r; });

    const now = () => tk.now();
    const time = () => (state === 'running' && !paused ? base + (now() - wallStart) * scale : base);

    function ctxFor(step: Step, targetName: string, el: Element | null): StepContext {
      return { step, spec, el, targetName, reduced, tier, timeScale: scale, seed, data };
    }

    function startStep(rec: Rec, local: number) {
      const { step } = rec;
      const controls: Internal[] = [];
      const parts = step.target.split('+');
      let fxDone = false;
      for (const part of parts) {
        const r = resolve(refs[part]);
        const ctx = ctxFor(step, part, r.el);
        const custom = r.run?.(ctx);
        if (custom) { controls.push(adopt(custom)); continue; }
        if (!fxDone && fx?.handles(step.action, ctx)) {
          const c = fx.run(ctx); fxDone = true;
          controls.push(adopt(c));
          continue;
        }
        if (!r.el) { if (!r.run) warnOnce(`${spec.id}:${part}`, `[director] ${spec.id}: no target "${part}" for ${step.name}`); continue; }
        const el = r.el as HTMLElement | SVGElement;
        let impl = registry[step.action];
        if (!impl) { warnOnce(step.action, `[director] no implementation for action "${step.action}" (${step.name}); using fallback fade`); impl = fallbackAction; }
        const out = impl(el, ctx);
        if (!out) continue;
        if (isPlanList(out) || isPlan(out)) {
          const plans = isPlanList(out) ? out : [out];
          const anims = plans.map((p) => animate(p.el ?? el, p.keyframes, p.transition) as unknown as AnimationPlaybackControls);
          controls.push(wrapAnims(anims, scale));
        } else {
          controls.push(adopt(out as StepControl));
        }
      }
      rec.control = combine(controls);
      if (paused) rec.control?.pause?.();
      if (local > 0) rec.control?.seek?.(local);
      opts.onStep?.(step, 'start');
    }

    function endStep(rec: Rec) {
      if (!rec.control?.persistent) rec.control?.finish?.();
      rec.phase = 'done';
      opts.onStep?.(rec.step, 'end');
    }

    function advance(T: number) {
      for (const rec of recs) {
        const { at, dur } = rec.step;
        if (rec.phase === 'pending' && T >= at) { rec.phase = 'active'; startStep(rec, T - at); }
        if (rec.phase === 'active') {
          if (T >= at + dur) endStep(rec);
          else rec.control?.tick?.(T - at);
        }
      }
      if (T >= total && recs.every((r) => r.phase === 'done')) complete();
    }

    function revertAfter(T: number) {
      for (let i = recs.length - 1; i >= 0; i--) {
        const rec = recs[i]!;
        if (rec.phase !== 'pending' && rec.step.at + rec.step.dur > T) {
          rec.control?.revert?.();
          rec.control = null;
          rec.phase = 'pending';
        }
      }
    }

    function onTick(_now: number, dt: number) {
      if (state !== 'running' || paused) return;
      if (breaker && ++frames > 2) {
        const t = now();
        const dropped = Math.max(0, Math.round(dt / FRAME) - 1);
        if (dropped) drops.push([t, dropped]);
        while (drops.length && t - drops[0]![0] > 50 + dt) drops.shift();
        if (drops.reduce((n, d) => n + d[1], 0) >= 3) {
          warnOnce(`breaker:${spec.id}`, `[director] ${spec.id}: frame-drop breaker tripped → skip, next spectacle degrades`);
          director.degradeNext = true;
          run.skip();
          return;
        }
      }
      advance(time());
    }

    function complete() {
      if (state === 'finished' || state === 'cancelled') return;
      base = Math.max(total, base);
      state = 'finished';
      unsub?.(); unsub = null;
      resolveFinished();
    }

    const run: Run = {
      finished, started,
      get time() { return time(); },
      get duration() { return total; },
      get spec() { return spec; },
      get state() { return state === 'running' && paused ? 'paused' : state; },
      skip() {
        if (state === 'preloading') { skipRequested = true; return; }
        if (state !== 'running') return;
        base = total; wallStart = now();
        advance(total);
        for (const rec of recs) if (rec.phase === 'active') endStep(rec);
        complete();
      },
      pause() {
        if (state !== 'running' || paused) return;
        base = time(); paused = true;
        recs.forEach((r) => r.phase === 'active' && r.control?.pause?.());
      },
      resume() {
        if (state !== 'running' || !paused || gesture) return;
        wallStart = now(); paused = false;
        recs.forEach((r) => r.phase === 'active' && r.control?.resume?.());
      },
      seek(ms) {
        if (state === 'preloading') { pendingSeek = ms; return; }
        if (state !== 'running') return;
        const T = Math.max(0, Math.min(ms, total));
        if (T < time()) revertAfter(T);
        base = T; wallStart = now();
        advance(T);
        recs.forEach((r) => { if (r.phase === 'active') { r.control?.seek?.(T - r.step.at); if (paused) r.control?.pause?.(); } });
      },
      seekTo(name) {
        const rec = recs.find((r) => r.step.name === name);
        if (rec) run.seek(rec.step.at);
      },
      setTimeScale(x) {
        base = time(); wallStart = now(); scale = x * director.timeScale;
        recs.forEach((r) => r.phase === 'active' && r.control?.setSpeed?.(scale));
      },
      cancel() {
        if (state === 'finished' || state === 'cancelled') return;
        recs.forEach((r) => { if (r.phase === 'active') r.control?.cancel?.(); });
        state = 'cancelled';
        unsub?.(); unsub = null;
        resolveStarted(); resolveFinished();
      },
    };

    const assets = spec.assets ?? [];
    const preload = opts.preload ?? loader;
    const timeout = new Promise<void>((r) => setTimeout(r, opts.preloadTimeoutMs ?? 1500));
    Promise.race([assets.length ? preload(assets).catch(() => undefined) : Promise.resolve(), timeout]).then(() => {
      if (state === 'cancelled') return;
      state = 'running';
      base = 0; wallStart = now();
      resolveStarted();
      if (!gesture) unsub = tk.add(onTick, 0);
      advance(0);
      if (pendingSeek !== null) run.seek(pendingSeek);
      if (skipRequested) run.skip();
    });

    return run;
  }

  return director;
}

/** The app-wide Director (fx is attached by the app shell via `director.setFx(createFxBridge(fxEngine))`). */
export const director: Director = createDirector();
