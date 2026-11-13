/**
 * P10 whipOff · P12 curtainDrop (DOM layer) · P23 cameraFlash · P37 slotPrint + toss · P47 tokenDrop ·
 * P14 hardCut (owner: primitives). Physical things move linearly (G8); the toss rides a true
 * quadratic Bézier on the shared ticker.
 */
import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { cssEasing, duration, spring } from '../../core/tokens';
import { ticker } from '../../core/ticker';
import { ease, keyframeAt, noise, springAt, tossPoint } from '../../core/actions/math';
import { useReducedMotion, useTicker } from '../hooks';
import type { BaseProps, OneShotProps } from './types';
import { P, tw, useDoneOnce, useLatest, cx } from './_shared';
import { stepOf } from '../../core/actions/params';

const WHIP_AT = stepOf('C2b', 'C2.whipOff').at;

const key = (playKey: unknown, play: boolean) => `${String(playKey)}:${play ? 1 : 0}`;

/** P10: ribbon x 0 → +43 vw, rotate 11 → 33° over 133 ms inQuad (after the 67 ms knot + hold). Reduced: 200 ms fade. */
export function WhipOff({ play = true, playKey, onDone, children, className, style }: OneShotProps) {
  const reduced = useReducedMotion();
  const done = useDoneOnce(onDone, play, playKey);
  const w = P.whipOff;
  // Same as the Director action in C2b: the ribbon holds still at its 11° rest through the knot +
  // hold, then x and rotate (11 → 33°) whip together over 133 ms inQuad from C2.whipOff's offset.
  const delay = WHIP_AT;
  return (
    <motion.div key={key(playKey, play)} className={className} style={style} data-primitive="whipOff"
      initial={reduced ? { opacity: 1 } : { x: '0vw', rotate: w.rotateDeg[0] }}
      animate={!play ? {} : reduced ? { opacity: 0 } : { x: `${w.xVw}vw`, rotate: w.rotateDeg[1] }}
      transition={reduced ? tw(P.reducedMs, 'outQuad') : tw(w.ms, 'inQuad', delay)}
      onAnimationComplete={() => play && done()}
    >{children}</motion.div>
  );
}

/**
 * P12 (DOM layer of the bloom → curtain hand-over): y → 105 vh over 1400 ms curtainFall, mean-colour
 * wash from +33 ms over 700 ms linear, opacity → 0 from +900 over 630 inQuad, top → bottom mask from
 * +1100 over 430, unmount (onDone) at +1530. Reduced: 300 ms crossfade.
 */
export function CurtainDrop({ play = true, playKey, onDone, children, className, style }: OneShotProps) {
  const reduced = useReducedMotion();
  const done = useLatest(onDone);
  const c = P.curtainDrop;
  useEffect(() => {
    if (!play) return;
    const id = setTimeout(() => done.current?.(), reduced ? duration.modal : duration.curtainDrop);
    return () => clearTimeout(id);
  }, [play, playKey, reduced, done]);
  return (
    <motion.div key={key(playKey, play)} className={cx('prim-curtain', className)} style={style} data-primitive="curtainDrop"
      initial={{ y: '0vh', opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
      animate={!play ? {} : reduced ? { opacity: 0 } : { y: `${c.yVh[1]}vh`, opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' }}
      transition={reduced ? tw(duration.modal, 'outQuad') : {
        y: tw(P.curtainFallMs, 'curtainFall'),
        opacity: tw(c.fadeMs, c.fadeEase, c.fadeFromMs),
        clipPath: tw(c.maskMs, c.maskEase, c.maskFromMs),
      }}
    >
      {children}
      {!reduced ? (
        <motion.span className="prim-curtain__wash" aria-hidden="true"
          initial={{ opacity: 0 }} animate={play ? { opacity: 1 } : {}} transition={tw(c.washMs, c.washEase, c.washFromMs)} />
      ) : null}
    </motion.div>
  );
}

export interface CameraFlashProps extends BaseProps {
  /** Increment to fire one flash. */
  fire: number;
  kind?: 'camera' | 'impact';
  /** 'fullScreen' sits below the HUD; 'element' covers the parent (gift booth window). */
  scope?: 'fullScreen' | 'element';
  /** Called at the flash peak (grab the frame here). */
  onPeak?: () => void;
  onDone?: () => void;
}
/**
 * P23: ≤1-frame rise to .85, linear decay 160 ms (camera; white) or .6 → .3 → .07 → 0 over 100 ms
 * outQuad (impact; warm). Reduced: peak .4, 200 ms, no shake / starburst. A full-screen flash closer
 * than 1000 ms to the previous one (WCAG 2.3.1) still calls onPeak / onDone but draws nothing.
 * Use scope 'element' for the gift booth window (< 25 % of the viewport).
 */
export function CameraFlash({ fire, kind = 'camera', scope = 'fullScreen', onPeak, onDone, className, style }: CameraFlashProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const cb = useLatest({ onPeak, onDone });
  const lastFull = useRef(-Infinity);
  useEffect(() => {
    if (fire <= 0) return;
    const el = ref.current;
    const f = P.cameraFlash;
    const now = ticker.now();
    const throttled = scope === 'fullScreen' && now - lastFull.current < f.minIntervalMs;
    if (scope === 'fullScreen' && !throttled) lastFull.current = now;
    const camera = kind === 'camera';
    const riseMs = reduced || !camera ? 0 : f.camera.riseMs;
    const decayMs = reduced ? f.reduced.decayMs : camera ? f.camera.decayMs : f.impact.decayMs;
    let anim: Animation | null = null;
    if (el && !throttled && typeof el.animate === 'function') {
      const peak = reduced ? f.reduced.peak : camera ? f.camera.peak : f.impact.peak;
      const total = riseMs + decayMs;
      const frames: Keyframe[] = reduced ? [{ opacity: peak }, { opacity: 0 }]
        : camera ? [{ opacity: 0 }, { opacity: peak, offset: riseMs / total }, { opacity: 0 }]
        : f.impactSteps.map((o) => ({ opacity: o }));
      anim = el.animate(frames, { duration: total, easing: reduced || camera ? 'linear' : cssEasing('outQuad'), fill: 'forwards' });
    }
    const peakId = setTimeout(() => cb.current.onPeak?.(), riseMs);
    const doneId = setTimeout(() => cb.current.onDone?.(), riseMs + decayMs);
    return () => { clearTimeout(peakId); clearTimeout(doneId); anim?.cancel(); };
  }, [fire]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div ref={ref} aria-hidden="true" data-primitive="cameraFlash" data-kind={kind}
      className={cx('prim-flash', `prim-flash--${scope}`, `prim-flash--${kind}`, className)} style={style} />
  );
}

export interface SlotPrintProps extends OneShotProps {
  /** ms for the feed; default from C12print (700 ms ≈ 0.9 strip heights/s on the mini strip). */
  durationMs?: number;
}
/** P37a: linear feed (y −100 % → 0) inside an overflow:hidden slot (clip padding 0.25em). */
export function SlotPrint({ durationMs, play = true, playKey, onDone, children, className, style }: SlotPrintProps) {
  const reduced = useReducedMotion();
  const done = useDoneOnce(onDone, play, playKey);
  return (
    <div className={cx('prim-slot', className)} style={style} data-primitive="slotPrint">
      <motion.div key={key(playKey, play)}
        initial={reduced ? { opacity: 0 } : { y: '-100%' }}
        animate={!play ? {} : reduced ? { opacity: 1 } : { y: '0%' }}
        transition={reduced ? tw(P.reducedMs, 'outQuad') : tw(durationMs ?? P.slotPrint.ms, 'linear')}
        onAnimationComplete={() => play && done()}
      >{children}</motion.div>
    </div>
  );
}

export interface TossProps extends OneShotProps {
  /** Start rect (the print slot) in viewport px; the element's own layout box is the target. */
  from: { x: number; y: number; scale: number };
  arcMs?: number;
  /** Rest tilt: −3.6° / +1.3° / +4°. */
  restDeg: number;
}
/**
 * P37b: arc 367 / 600 ms on a quadratic Bézier (x decelerates, y rises then falls into a hard stop,
 * 26-51 px above the target), scale on spring.toss from `from.scale` → 1.054 → 1 (832 ms), tilt
 * ±16°·sign(dx) at ~60 %, unwinding to `restDeg`. One ticker callback; transforms only.
 * Reduced: opacity 200 ms in place.
 */
export function Toss({ from, arcMs = P.toss.arcMs[1], restDeg, play = true, playKey, onDone, children, className, style }: TossProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const done = useDoneOnce(onDone, play, playKey);
  const st = useRef<{ t0: number; dx: number; dy: number; arc: number } | null>(null);
  const total = spring.toss.settleMs;
  useLayoutEffect(() => {
    const el = ref.current;
    st.current = null;
    if (!el) return;
    if (!play) { el.style.opacity = '0'; return; }
    el.style.opacity = '';
    if (reduced) return;
    el.style.transform = '';
    const r = el.getBoundingClientRect();
    const dx = from.x - (r.left + r.width / 2), dy = from.y - (r.top + r.height / 2);
    const [a0, a1] = P.toss.arcPx;
    st.current = { t0: ticker.now(), dx, dy, arc: a0 + (a1 - a0) * noise(11, Math.round(restDeg * 10)) };
    apply(0);
  }, [play, playKey, reduced]); // eslint-disable-line react-hooks/exhaustive-deps
  const tiltFn = ease('outQuad');
  function apply(ms: number) {
    const el = ref.current, s = st.current;
    if (!el || !s) return;
    const u = Math.min(1, ms / arcMs);
    const pt = tossPoint(s.dx, s.dy, s.arc, u);
    const sc = from.scale + (1 - from.scale) * springAt('toss', ms);
    const sign = s.dx === 0 ? 1 : Math.sign(-s.dx);
    const rot = keyframeAt([0, P.toss.tiltDeg * sign, restDeg], [0, (P.toss.tiltAt * arcMs) / total, 1], Math.min(1, ms / total), tiltFn);
    el.style.transform = `translate(${pt.x}px, ${pt.y}px) rotate(${rot}deg) scale(${sc})`;
  }
  useTicker((now) => {
    const s = st.current;
    if (!s) return;
    const ms = now - s.t0;
    apply(ms);
    if (ms >= total) { st.current = null; done(); }
  }, play && !reduced);
  return (
    <motion.div ref={ref} className={className} data-primitive="toss"
      style={reduced ? { ...style, rotate: restDeg } : { ...style, transform: `rotate(${restDeg}deg)` }}
      initial={reduced ? { opacity: 0 } : false}
      animate={reduced && play ? { opacity: 1 } : undefined}
      transition={tw(P.reducedMs, 'outQuad')}
      onAnimationComplete={() => reduced && play && done()}
    >{children}</motion.div>
  );
}

/**
 * P47: the coin (children) hard-cuts out and a heart token rises ≈ −4 vh with `in` over 100 ms,
 * fading into the slot. Reduced: the coin hard-cuts to the heart in the slot (no travel).
 */
export function TokenDrop({ play = true, playKey, onDone, children, className, style }: OneShotProps) {
  const reduced = useReducedMotion();
  const done = useDoneOnce(onDone, play, playKey);
  const t = P.tokenDrop;
  useEffect(() => { if (play && reduced) done(); }, [play, playKey, reduced, done]);
  return (
    <span className={cx('prim-token', className)} style={style} data-primitive="tokenDrop">
      <span data-coin style={{ opacity: play ? 0 : 1 }}>{children}</span>
      {play && !reduced ? (
        <motion.svg key={String(playKey)} className="prim-token__heart" viewBox="0 0 20 18" aria-hidden="true"
          initial={{ y: `${t.heartYPctVh[0]}vh`, opacity: 1 }}
          animate={{ y: `${t.heartYPctVh[1]}vh`, opacity: 0 }}
          transition={tw(t.durMs[1], 'in')}
          onAnimationComplete={done}
        ><path d="M10 17 1.8 9A4.6 4.6 0 0 1 10 3a4.6 4.6 0 0 1 8.2 6Z" /></motion.svg>
      ) : null}
    </span>
  );
}

/** P14: 0 ms swap. Renders `children` keyed by `value` so React swaps on the same frame (never tween a label). */
export function HardCut({ value, children }: { value: string | number; children: ReactNode }) {
  return <span key={value} data-cut={value}>{children}</span>;
}
